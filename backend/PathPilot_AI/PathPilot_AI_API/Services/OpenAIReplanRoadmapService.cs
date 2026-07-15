using System.Text.Json;
using PathPilot_AI_API.Models;

namespace PathPilot_AI_API.Services;

public sealed class OpenAIReplanRoadmapService : IReplanRoadmapService
{
    public const int MaxOutputTokens = 4000;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IConfiguration _configuration;
    private readonly OpenAIResponsesClient _responsesClient;

    public OpenAIReplanRoadmapService(
        IConfiguration configuration,
        OpenAIResponsesClient responsesClient)
    {
        _configuration = configuration;
        _responsesClient = responsesClient;
    }

    public async Task<RoadmapResponse> ReplanAsync(
        ReplanRoadmapRequest request,
        CancellationToken cancellationToken)
    {
        var apiKey = _configuration["OpenAI:ApiKey"]!;
        var model = _configuration["OpenAI:Model"];
        if (string.IsNullOrWhiteSpace(model) || !model.StartsWith("gpt-5.6", StringComparison.OrdinalIgnoreCase))
        {
            throw new RoadmapGenerationException("The OpenAI replan model must be configured as GPT-5.6.");
        }

        var originalInput = JsonSerializer.Serialize(request, JsonOptions);
        string? previousResponseId = null;
        string? failureReason = null;

        for (var attempt = 0; attempt < 2; attempt++)
        {
            var input = attempt == 0
                ? originalInput
                : previousResponseId is null
                    ? $"{originalInput}\nCorrection: {failureReason} Return one complete, shorter JSON object."
                    : $"Correct the prior output: {failureReason} Return one complete, shorter JSON object.";

            var response = await _responsesClient.CreateStructuredResponseAsync(
                apiKey,
                model,
                "Revise only unfinished roadmap work using progress and updated constraints. Preserve completed skill and milestone text at its existing phase ID and index. Preserve the current phase and all phase IDs. Future phases may be reordered. Make Summary a concise replan summary. Keep risk and feasibility consistent. Return only strict JSON; no markdown.",
                input,
                "replanned_roadmap",
                RoadmapJsonSchemas.Roadmap,
                MaxOutputTokens,
                previousResponseId,
                cancellationToken);

            if (response.HttpStatus is < 200 or >= 300)
            {
                throw new RoadmapGenerationException(GetHttpFailure(response.HttpStatus));
            }

            if (response.IsRefusal)
            {
                throw new RoadmapGenerationException("Replanning failed because the model declined the request.");
            }

            if (!response.EnvelopeJsonParsed)
            {
                failureReason = "The prior API response was invalid JSON.";
                if (attempt == 0) continue;
                throw new RoadmapGenerationException("Replanning failed because the API response was invalid JSON.");
            }

            if (response.Status == "incomplete")
            {
                failureReason = response.IncompleteReason == "max_output_tokens"
                    ? "The prior response reached max_output_tokens."
                    : "The prior structured response was incomplete.";
                previousResponseId = response.ResponseId;
                if (attempt == 0) continue;
                throw new RoadmapGenerationException("Replanning failed because the structured response remained incomplete.");
            }

            if (response.Status != "completed")
            {
                throw new RoadmapGenerationException("Replanning failed because OpenAI did not complete the request.");
            }

            if (string.IsNullOrWhiteSpace(response.OutputText))
            {
                failureReason = "The prior response did not contain valid structured JSON.";
                previousResponseId = response.ResponseId;
                if (attempt == 0) continue;
                throw new RoadmapGenerationException("Replanning failed because the response was not valid JSON.");
            }

            RoadmapResponse? roadmap;
            try
            {
                roadmap = JsonSerializer.Deserialize<RoadmapResponse>(response.OutputText, JsonOptions);
            }
            catch (JsonException)
            {
                roadmap = null;
            }

            var validationFailure = roadmap is null
                ? "JSON deserialization failed"
                : GetValidationFailure(roadmap, request);
            if (validationFailure is not null)
            {
                failureReason = $"Schema validation failed because {validationFailure}.";
                previousResponseId = response.ResponseId;
                if (attempt == 0) continue;
                throw new RoadmapGenerationException($"Replanning failed: {failureReason}");
            }

            return NormalizeFeasibilityScore(roadmap!);
        }

        throw new RoadmapGenerationException("Replanning failed because structured output validation failed.");
    }

    private static string? GetValidationFailure(RoadmapResponse roadmap, ReplanRoadmapRequest request)
    {
        var original = request.CurrentRoadmap!;
        var progress = request.LearnerProgress!;
        var constraints = request.UpdatedConstraints!;

        if (roadmap.Goal != original.Goal) return "the learner goal changed";
        if (roadmap.StartingLevel != original.StartingLevel) return "the starting level changed";
        if (roadmap.Timeline != constraints.Timeline) return "the updated timeline was not applied";
        if (roadmap.WeeklyHours != constraints.WeeklyHours) return "the updated weekly hours were not applied";
        if (string.IsNullOrWhiteSpace(roadmap.Summary)) return "replanSummary was empty";
        if (roadmap.Phases is not { Count: > 0 }) return "phases was empty";
        if (progress.CurrentPhase is int currentPhase && roadmap.Phases.All(phase => phase.Id != currentPhase)) return "the current phase was removed";
        if (roadmap.CriticReview is null) return "criticReview was missing";
        if (roadmap.FeasibilityScore is < 0 or > 100) return "feasibilityScore was outside 0 to 100";

        foreach (var itemId in progress.CompletedSkillIds ?? [])
        {
            if (!CompletedItemWasPreserved(itemId, original, roadmap, isSkill: true))
                return $"completed skill {itemId} was changed";
        }
        foreach (var itemId in progress.CompletedMilestoneIds ?? [])
        {
            if (!CompletedItemWasPreserved(itemId, original, roadmap, isSkill: false))
                return $"completed milestone {itemId} was changed";
        }

        return null;
    }

    private static bool CompletedItemWasPreserved(
        string itemId,
        RoadmapResponse original,
        RoadmapResponse revised,
        bool isSkill)
    {
        var parts = itemId.Split(':');
        if (parts.Length != 4 || !int.TryParse(parts[1], out var phaseId) ||
            !int.TryParse(parts[3], out var itemIndex)) return false;

        var originalPhase = original.Phases.FirstOrDefault(phase => phase.Id == phaseId);
        var revisedPhase = revised.Phases.FirstOrDefault(phase => phase.Id == phaseId);
        if (originalPhase is null || revisedPhase is null) return false;

        var originalItems = isSkill ? originalPhase.Skills : originalPhase.Milestones;
        var revisedItems = isSkill ? revisedPhase.Skills : revisedPhase.Milestones;
        return itemIndex >= 0 && itemIndex < originalItems.Count && itemIndex < revisedItems.Count &&
            revisedItems[itemIndex] == originalItems[itemIndex];
    }

    private static RoadmapResponse NormalizeFeasibilityScore(RoadmapResponse roadmap)
    {
        var score = roadmap.CriticReview.RiskLevel switch
        {
            "Low" => Math.Clamp(roadmap.FeasibilityScore, 75, 100),
            "Medium" => Math.Clamp(roadmap.FeasibilityScore, 45, 74),
            "High" => Math.Clamp(roadmap.FeasibilityScore, 0, 44),
            _ => roadmap.FeasibilityScore
        };
        return roadmap with { FeasibilityScore = score };
    }

    private static string GetHttpFailure(int statusCode) => statusCode switch
    {
        401 or 403 => "Replanning failed because OpenAI authentication was rejected.",
        429 => "Replanning failed because OpenAI rejected the request due to quota or rate limits.",
        >= 400 and < 500 => $"Replanning failed because OpenAI rejected the request (HTTP {statusCode}).",
        _ => $"Replanning failed because OpenAI returned HTTP {statusCode}."
    };
}
