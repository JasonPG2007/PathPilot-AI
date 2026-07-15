using System.Text.Json;
using PathPilot_AI_API.Models;
using PathPilot_AI_API.Prompts;

namespace PathPilot_AI_API.Services;

public sealed class OpenAIRoadmapService : IRoadmapService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IConfiguration _configuration;
    private readonly ILogger<OpenAIRoadmapService> _logger;
    private readonly OpenAIResponsesClient _responsesClient;

    public OpenAIRoadmapService(
        IConfiguration configuration,
        ILogger<OpenAIRoadmapService> logger,
        OpenAIResponsesClient responsesClient)
    {
        _configuration = configuration;
        _logger = logger;
        _responsesClient = responsesClient;
    }

    public async Task<RoadmapResponse> GenerateAsync(
        GenerateRoadmapRequest request,
        CancellationToken cancellationToken)
    {
        var apiKey = _configuration["OpenAI:ApiKey"];
        var model = _configuration["OpenAI:Model"];

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new RoadmapGenerationException("OpenAI is not configured. Add the API key to user secrets and try again.");
        }

        if (string.IsNullOrWhiteSpace(model))
        {
            throw new RoadmapGenerationException("The OpenAI model is not configured.");
        }

        try
        {
            var learnerJson = JsonSerializer.Serialize(request, JsonOptions);
            var initialRoadmap = await GenerateValidatedAsync<RoadmapResponse>(
                apiKey,
                model,
                AgentPrompts.Planner,
                $"Learner profile:\n{learnerJson}",
                "planner_roadmap",
                RoadmapJsonSchemas.Roadmap,
                IsValidRoadmap,
                cancellationToken);

            var initialRoadmapJson = JsonSerializer.Serialize(initialRoadmap, JsonOptions);
            var criticFeedback = await GenerateValidatedAsync<CriticFeedback>(
                apiKey,
                model,
                AgentPrompts.Critic,
                $"Learner profile:\n{learnerJson}\n\nRoadmap to audit:\n{initialRoadmapJson}",
                "critic_feedback",
                RoadmapJsonSchemas.Critic,
                IsValidCriticFeedback,
                cancellationToken);

            var criticJson = JsonSerializer.Serialize(criticFeedback, JsonOptions);
            return await GenerateValidatedAsync<RoadmapResponse>(
                apiKey,
                model,
                AgentPrompts.Revision,
                $"Learner profile:\n{learnerJson}\n\nOriginal roadmap:\n{initialRoadmapJson}\n\nCritic feedback:\n{criticJson}",
                "revised_roadmap",
                RoadmapJsonSchemas.Roadmap,
                IsValidRoadmap,
                cancellationToken);
        }
        catch (RoadmapGenerationException)
        {
            throw;
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            throw new RoadmapGenerationException("The AI service took too long to respond. Please try again.");
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "The OpenAI roadmap workflow failed.");
            throw new RoadmapGenerationException(
                "The AI agents could not complete the roadmap. Please try again.",
                exception);
        }
    }

    private async Task<T> GenerateValidatedAsync<T>(
        string apiKey,
        string model,
        string instructions,
        string input,
        string schemaName,
        System.Text.Json.Nodes.JsonNode schema,
        Func<T, bool> validator,
        CancellationToken cancellationToken)
    {
        for (var attempt = 0; attempt < 2; attempt++)
        {
            var attemptInput = attempt == 0
                ? input
                : $"{input}\n\nThe previous response was invalid. Regenerate the complete JSON object and follow the schema exactly.";
            var json = await _responsesClient.CreateStructuredResponseAsync(
                apiKey,
                model,
                instructions,
                attemptInput,
                schemaName,
                schema,
                cancellationToken);

            try
            {
                var result = JsonSerializer.Deserialize<T>(json, JsonOptions);
                if (result is not null && validator(result))
                {
                    return result;
                }
            }
            catch (JsonException exception)
            {
                _logger.LogWarning(exception, "Agent {SchemaName} returned invalid JSON on attempt {Attempt}.", schemaName, attempt + 1);
            }
        }

        throw new RoadmapGenerationException(
            "The AI service returned invalid structured data twice. Please try again.");
    }

    private static bool IsValidRoadmap(RoadmapResponse roadmap)
    {
        return !string.IsNullOrWhiteSpace(roadmap.Goal) &&
            !string.IsNullOrWhiteSpace(roadmap.Summary) &&
            roadmap.FeasibilityScore is >= 0 and <= 100 &&
            roadmap.Phases is { Count: > 0 } &&
            roadmap.Phases.All(phase =>
                !string.IsNullOrWhiteSpace(phase.Title) &&
                phase.Skills is { Count: > 0 } &&
                phase.Milestones is { Count: > 0 } &&
                phase.RecommendedProject is not null) &&
            roadmap.CriticReview is not null &&
            roadmap.SkillVault is { Count: > 0 } &&
            roadmap.SuggestedProjects is { Count: > 0 };
    }

    private static bool IsValidCriticFeedback(CriticFeedback feedback)
    {
        return !string.IsNullOrWhiteSpace(feedback.RiskLevel) &&
            feedback.Issues is not null &&
            feedback.RecommendedChanges is not null &&
            !string.IsNullOrWhiteSpace(feedback.TimelineAdjustments) &&
            !string.IsNullOrWhiteSpace(feedback.PrerequisiteCorrections);
    }

    private sealed record CriticFeedback(
        string RiskLevel,
        IReadOnlyList<string> Issues,
        IReadOnlyList<string> RecommendedChanges,
        string TimelineAdjustments,
        string PrerequisiteCorrections);
}
