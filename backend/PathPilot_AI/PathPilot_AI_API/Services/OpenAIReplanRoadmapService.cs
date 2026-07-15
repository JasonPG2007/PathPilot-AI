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
        var preflightFailure = GetCompletedItemFailure(request.CurrentRoadmap!, request.CurrentRoadmap!, request.LearnerProgress!);
        if (preflightFailure is not null)
        {
            throw new RoadmapGenerationException($"Replanning was stopped before contacting OpenAI: completed {preflightFailure.ItemType} {preflightFailure.ItemId} was {preflightFailure.Reason}.");
        }

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
                    : $"Correct the prior output: {failureReason} Restore the exact immutable completed item from the original input at the same phase and index. Return one complete, shorter JSON object.";

            var response = await _responsesClient.CreateStructuredResponseAsync(
                apiKey,
                model,
                "Revise only unfinished roadmap work. Completed items are immutable: never change their text, phase ID, index identity, or position. Preserve the current phase and all phase IDs. Apply updated constraints only to unfinished work. Future phases may be reordered only when completed items remain fixed. Make Summary concise, keep risk and feasibility consistent, and return strict JSON without markdown.",
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
                throw new RoadmapGenerationException("Replanning failed because the API response was invalid JSON.");
            }

            if (response.Status == "incomplete")
            {
                failureReason = response.IncompleteReason == "max_output_tokens"
                    ? "The prior response reached max_output_tokens."
                    : "The prior structured response was incomplete.";
                throw new RoadmapGenerationException("Replanning failed because the structured response remained incomplete.");
            }

            if (response.Status != "completed")
            {
                throw new RoadmapGenerationException("Replanning failed because OpenAI did not complete the request.");
            }

            if (string.IsNullOrWhiteSpace(response.OutputText))
            {
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
                ? new ValidationFailure("JSON deserialization failed", false)
                : GetValidationFailure(roadmap, request);
            if (validationFailure is not null)
            {
                failureReason = $"Schema validation failed because {validationFailure.Message}.";
                previousResponseId = response.ResponseId;
                if (attempt == 0 && validationFailure.RetryableCompletedItemFailure) continue;
                throw new RoadmapGenerationException($"Replanning failed: {failureReason}");
            }

            return NormalizeFeasibilityScore(roadmap!);
        }

        throw new RoadmapGenerationException("Replanning failed because structured output validation failed.");
    }

    private static ValidationFailure? GetValidationFailure(RoadmapResponse roadmap, ReplanRoadmapRequest request)
    {
        var original = request.CurrentRoadmap!;
        var progress = request.LearnerProgress!;
        var constraints = request.UpdatedConstraints!;

        if (roadmap.Goal != original.Goal) return new("the learner goal changed", false);
        if (roadmap.StartingLevel != original.StartingLevel) return new("the starting level changed", false);
        if (roadmap.Timeline != constraints.Timeline) return new("the updated timeline was not applied", false);
        if (roadmap.WeeklyHours != constraints.WeeklyHours) return new("the updated weekly hours were not applied", false);
        if (string.IsNullOrWhiteSpace(roadmap.Summary)) return new("replanSummary was empty", false);
        if (roadmap.Phases is not { Count: > 0 }) return new("phases was empty", false);
        if (progress.CurrentPhase is int currentPhase && roadmap.Phases.All(phase => phase.Id != currentPhase)) return new("the current phase was removed", false);
        if (roadmap.CriticReview is null) return new("criticReview was missing", false);
        if (roadmap.FeasibilityScore is < 0 or > 100) return new("feasibilityScore was outside 0 to 100", false);

        var preservationFailure = GetCompletedItemFailure(original, roadmap, progress);
        if (preservationFailure is not null)
            return new($"completed {preservationFailure.ItemType} {preservationFailure.ItemId} was {preservationFailure.Reason}", true);

        return null;
    }

    private static PreservationFailure? GetCompletedItemFailure(RoadmapResponse original, RoadmapResponse revised, LearnerProgressDto progress)
    {
        foreach (var itemId in progress.CompletedSkillIds ?? [])
        {
            var failure = InspectCompletedItem(itemId, original, revised, true);
            if (failure is not null) return failure;
        }
        foreach (var itemId in progress.CompletedMilestoneIds ?? [])
        {
            var failure = InspectCompletedItem(itemId, original, revised, false);
            if (failure is not null) return failure;
        }
        return null;
    }

    private static PreservationFailure? InspectCompletedItem(
        string itemId, RoadmapResponse original, RoadmapResponse revised, bool isSkill)
    {
        var itemType = isSkill ? "skill" : "milestone";
        var parts = itemId.Split(':');
        if (parts.Length != 4 || !int.TryParse(parts[1], out var phaseId) ||
            !int.TryParse(parts[3], out var itemIndex)) return new(itemType, itemId, "missing because its ID was invalid");

        var originalPhase = original.Phases.FirstOrDefault(phase => phase.Id == phaseId);
        var revisedPhase = revised.Phases.FirstOrDefault(phase => phase.Id == phaseId);
        if (originalPhase is null) return new(itemType, itemId, "missing from the submitted roadmap");
        if (revisedPhase is null) return new(itemType, itemId, "moved because its original phase was removed");

        var originalItems = isSkill ? originalPhase.Skills : originalPhase.Milestones;
        var revisedItems = isSkill ? revisedPhase.Skills : revisedPhase.Milestones;
        if (itemIndex < 0 || itemIndex >= originalItems.Count) return new(itemType, itemId, "missing from the submitted roadmap");
        if (itemIndex >= revisedItems.Count) return new(itemType, itemId, "missing from its original position");
        if (revisedItems[itemIndex] != originalItems[itemIndex]) return new(itemType, itemId, "changed");
        return null;
    }

    private sealed record ValidationFailure(string Message, bool RetryableCompletedItemFailure);
    private sealed record PreservationFailure(string ItemType, string ItemId, string Reason);

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
