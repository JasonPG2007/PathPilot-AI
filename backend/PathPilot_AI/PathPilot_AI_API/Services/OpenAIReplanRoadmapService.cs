using System.Text.Json;
using System.Diagnostics;
using PathPilot_AI_API.Models;

namespace PathPilot_AI_API.Services;

public sealed class OpenAIReplanRoadmapService : IReplanRoadmapService
{
    public const int MaxOutputTokens = 2800;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IConfiguration _configuration;
    private readonly OpenAIResponsesClient _responsesClient;
    private readonly ILogger<OpenAIReplanRoadmapService> _logger;

    public OpenAIReplanRoadmapService(
        IConfiguration configuration,
        OpenAIResponsesClient responsesClient,
        ILogger<OpenAIReplanRoadmapService> logger)
    {
        _configuration = configuration;
        _responsesClient = responsesClient;
        _logger = logger;
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

        var input = JsonSerializer.Serialize(BuildCompactContext(request), JsonOptions);
        var stopwatch = Stopwatch.StartNew();
        _logger.LogInformation("Replan OpenAI stage started.");
        OpenAIResponseResult response;
        try
        {
            response = await _responsesClient.CreateStructuredResponseAsync(
                apiKey,
                model,
                "Return one concise revised roadmap as strict JSON, no markdown. Revise unfinished work only. Completed items are immutable in text, phase, index, and position. Preserve goal, starting level, current phase, and phase IDs. Apply the new timeline and weekly hours. Keep descriptions, issues, changes, and milestones brief. Keep risk and feasibility consistent.",
                input,
                "replanned_roadmap",
                RoadmapJsonSchemas.Roadmap,
                MaxOutputTokens,
                previousResponseId: null,
                cancellationToken);
        }
        catch (OperationCanceledException exception) when (!cancellationToken.IsCancellationRequested)
        {
            stopwatch.Stop();
            _logger.LogWarning("Replan OpenAI stage hit the configured HTTP timeout after {ElapsedMs} ms.", stopwatch.ElapsedMilliseconds);
            throw new UpstreamServiceTimeoutException("The OpenAI replan request exceeded the configured 170-second service timeout.", exception);
        }
        catch (OperationCanceledException)
        {
            stopwatch.Stop();
            _logger.LogInformation("Replan OpenAI stage cancelled after {ElapsedMs} ms.", stopwatch.ElapsedMilliseconds);
            throw;
        }

        stopwatch.Stop();
        _logger.LogInformation("Replan OpenAI stage completed after {ElapsedMs} ms with HTTP {HttpStatus} and response status {ResponseStatus}.",
            stopwatch.ElapsedMilliseconds, response.HttpStatus, response.Status);

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
            throw new RoadmapGenerationException(response.IncompleteReason == "max_output_tokens"
                ? "Replanning failed because the response reached max_output_tokens."
                : "Replanning failed because the structured response was incomplete.");
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
            throw new RoadmapGenerationException($"Replanning failed: Schema validation failed because {validationFailure.Message}.");
        }

        return NormalizeFeasibilityScore(roadmap!);
    }

    private static object BuildCompactContext(ReplanRoadmapRequest request)
    {
        var roadmap = request.CurrentRoadmap!;
        var progress = request.LearnerProgress!;
        var completedSkills = (progress.CompletedSkillIds ?? []).ToHashSet(StringComparer.Ordinal);
        var completedMilestones = (progress.CompletedMilestoneIds ?? []).ToHashSet(StringComparer.Ordinal);

        return new
        {
            goal = roadmap.Goal,
            startingLevel = roadmap.StartingLevel,
            selectedStrategy = GetStrategy(roadmap.Timeline),
            currentTimeline = roadmap.Timeline,
            currentWeeklyHours = roadmap.WeeklyHours,
            currentPhase = progress.CurrentPhase,
            phases = roadmap.Phases.Select(phase => new
            {
                id = phase.Id,
                title = phase.Title,
                remainingSkills = phase.Skills.Select((text, index) => new { id = $"phase:{phase.Id}:skill:{index}", text })
                    .Where(item => !completedSkills.Contains(item.id)),
                completedImmutableSkills = phase.Skills.Select((text, index) => new { id = $"phase:{phase.Id}:skill:{index}", text, index })
                    .Where(item => completedSkills.Contains(item.id)),
                remainingMilestones = phase.Milestones.Select((text, index) => new { id = $"phase:{phase.Id}:milestone:{index}", text })
                    .Where(item => !completedMilestones.Contains(item.id)),
                completedImmutableMilestones = phase.Milestones.Select((text, index) => new { id = $"phase:{phase.Id}:milestone:{index}", text, index })
                    .Where(item => completedMilestones.Contains(item.id)),
                projectTitle = phase.RecommendedProject.Title
            }),
            updatedConstraints = new
            {
                weeklyHours = request.UpdatedConstraints!.WeeklyHours,
                timeline = request.UpdatedConstraints.Timeline,
                difficulty = request.UpdatedConstraints.MainDifficulty,
                note = request.UpdatedConstraints.Note
            }
        };
    }

    private static string GetStrategy(string timeline) =>
        timeline.Contains("Fast Track", StringComparison.OrdinalIgnoreCase) ? "fast" :
        timeline.Contains("Deep Mastery", StringComparison.OrdinalIgnoreCase) ? "deep" : "balanced";

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
