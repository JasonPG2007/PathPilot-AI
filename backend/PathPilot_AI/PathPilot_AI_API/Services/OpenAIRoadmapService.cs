using System.Diagnostics;
using System.Text.Json;
using PathPilot_AI_API.Models;
using PathPilot_AI_API.Prompts;

namespace PathPilot_AI_API.Services;

public sealed class OpenAIRoadmapService : IRoadmapService
{
    private const int PlannerMaxOutputTokens = 1200;
    private const int CriticMaxOutputTokens = 800;
    private const int RevisionMaxOutputTokens = 4000;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<OpenAIRoadmapService> _logger;
    private readonly OpenAIResponsesClient _responsesClient;

    public OpenAIRoadmapService(
        IConfiguration configuration,
        IWebHostEnvironment environment,
        ILogger<OpenAIRoadmapService> logger,
        OpenAIResponsesClient responsesClient)
    {
        _configuration = configuration;
        _environment = environment;
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
            var initialRoadmap = await GenerateValidatedAsync<PlannerDraft>(
                apiKey,
                model,
                "Planner",
                AgentPrompts.Planner,
                $"profile={learnerJson}",
                "planner_roadmap",
                RoadmapJsonSchemas.Planner,
                PlannerMaxOutputTokens,
                GetPlannerValidationFailure,
                cancellationToken);

            var initialRoadmapJson = JsonSerializer.Serialize(initialRoadmap, JsonOptions);
            var criticFeedback = await GenerateValidatedAsync<CriticFeedback>(
                apiKey,
                model,
                "Critic",
                AgentPrompts.Critic,
                $"profile={learnerJson}\ndraft={initialRoadmapJson}",
                "critic_feedback",
                RoadmapJsonSchemas.Critic,
                CriticMaxOutputTokens,
                GetCriticValidationFailure,
                cancellationToken);

            var criticJson = JsonSerializer.Serialize(criticFeedback, JsonOptions);
            var finalRoadmap = await GenerateValidatedAsync<RoadmapResponse>(
                apiKey,
                model,
                "Revision",
                AgentPrompts.Revision,
                $"profile={learnerJson}\ndraft={initialRoadmapJson}\ncritique={criticJson}",
                "revised_roadmap",
                RoadmapJsonSchemas.Roadmap,
                RevisionMaxOutputTokens,
                GetRoadmapValidationFailure,
                cancellationToken);
            return NormalizeFeasibilityScore(finalRoadmap);
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
        string stageName,
        string instructions,
        string input,
        string schemaName,
        System.Text.Json.Nodes.JsonNode schema,
        int maxOutputTokens,
        Func<T, string?> getSemanticValidationFailure,
        CancellationToken cancellationToken)
    {
        var stopwatch = Stopwatch.StartNew();
        _logger.LogInformation("{Stage} started.", stageName);

        string? previousResponseId = null;
        string? finalFailureDetail = null;

        for (var attempt = 0; attempt < 2; attempt++)
        {
            var attemptNumber = attempt + 1;
            var retryInstruction = finalFailureDetail is null
                ? "Return a shorter complete JSON object that strictly matches the schema."
                : $"Correct the prior output. {finalFailureDetail} Return one shorter complete JSON object.";
            var attemptInput = attempt == 0
                ? input
                : previousResponseId is null
                    ? $"{input}\nCorrection: {retryInstruction}"
                    : retryInstruction;
            var attemptStopwatch = Stopwatch.StartNew();
            var response = await _responsesClient.CreateStructuredResponseAsync(
                apiKey,
                model,
                instructions,
                attemptInput,
                schemaName,
                schema,
                maxOutputTokens,
                previousResponseId,
                cancellationToken);

            _logger.LogInformation(
                "{Stage} response. Attempt={Attempt} HttpStatus={HttpStatus} ResponseStatus={ResponseStatus} IncompleteReason={IncompleteReason} OutputTokens={OutputTokens} ElapsedMs={ElapsedMs}.",
                stageName,
                attemptNumber,
                response.HttpStatus,
                response.Status,
                response.IncompleteReason ?? "none",
                response.OutputTokens,
                attemptStopwatch.ElapsedMilliseconds);

            if (response.HttpStatus is < 200 or >= 300)
            {
                LogStructuredOutputFailure(stageName, attemptNumber, $"HTTP {response.HttpStatus}", attemptStopwatch.ElapsedMilliseconds);
                throw new RoadmapGenerationException(GetHttpFailureDetail(stageName, response.HttpStatus));
            }

            if (!response.EnvelopeJsonParsed)
            {
                finalFailureDetail = "the API response was not valid JSON.";
                _logger.LogWarning(
                    "{Stage} JSON deserialization failed. Attempt={Attempt} ElapsedMs={ElapsedMs}.",
                    stageName,
                    attemptNumber,
                    attemptStopwatch.ElapsedMilliseconds);
                _logger.LogWarning(
                    "{Stage} schema validation failed. Attempt={Attempt} Reason={Reason} ElapsedMs={ElapsedMs}.",
                    stageName,
                    attemptNumber,
                    "API response envelope was invalid JSON",
                    attemptStopwatch.ElapsedMilliseconds);
                if (attempt == 0)
                {
                    LogRetry(stageName, attemptNumber, "invalid JSON", stopwatch.ElapsedMilliseconds);
                    continue;
                }

                throw new RoadmapGenerationException($"{stageName} failed: the API response was invalid JSON.");
            }

            if (response.IsRefusal)
            {
                LogStructuredOutputFailure(stageName, attemptNumber, "explicit refusal", attemptStopwatch.ElapsedMilliseconds);
                throw new RoadmapGenerationException($"{stageName} failed: the model declined to produce the roadmap.");
            }

            if (response.Status == "incomplete")
            {
                var reason = response.IncompleteReason ?? "an unspecified limit was reached";
                finalFailureDetail = $"The response was incomplete because {FormatIncompleteReason(reason)}";
                previousResponseId = response.ResponseId;
                LogStructuredOutputFailure(stageName, attemptNumber, $"response incomplete: {reason}", attemptStopwatch.ElapsedMilliseconds);
                if (attempt == 0)
                {
                    LogRetry(stageName, attemptNumber, $"incomplete response ({reason})", stopwatch.ElapsedMilliseconds);
                    continue;
                }

                throw new RoadmapGenerationException(
                    $"{stageName} failed: response incomplete because {FormatIncompleteReason(reason)}");
            }

            if (response.Status == "failed")
            {
                LogStructuredOutputFailure(stageName, attemptNumber, "response status was failed", attemptStopwatch.ElapsedMilliseconds);
                throw new RoadmapGenerationException($"{stageName} failed: the OpenAI response reported failure.");
            }

            if (response.Status != "completed")
            {
                LogStructuredOutputFailure(stageName, attemptNumber, "unexpected response status", attemptStopwatch.ElapsedMilliseconds);
                throw new RoadmapGenerationException(
                    $"{stageName} failed: the OpenAI response had an unexpected status.");
            }

            if (string.IsNullOrWhiteSpace(response.OutputText))
            {
                finalFailureDetail = "Structured output validation failed because output text was empty.";
                _logger.LogWarning(
                    "{Stage} JSON deserialization failed. Attempt={Attempt} Reason={Reason} ElapsedMs={ElapsedMs}.",
                    stageName,
                    attemptNumber,
                    "output text was empty",
                    attemptStopwatch.ElapsedMilliseconds);
                _logger.LogWarning(
                    "{Stage} schema validation failed. Attempt={Attempt} Reason={Reason} ElapsedMs={ElapsedMs}.",
                    stageName,
                    attemptNumber,
                    "output text was empty",
                    attemptStopwatch.ElapsedMilliseconds);
                previousResponseId = response.ResponseId;
                if (attempt == 0)
                {
                    LogRetry(stageName, attemptNumber, "schema validation failure", stopwatch.ElapsedMilliseconds);
                    continue;
                }

                throw new RoadmapGenerationException(
                    $"{stageName} failed: structured output validation failed because output text was empty.");
            }

            T? result;
            try
            {
                result = JsonSerializer.Deserialize<T>(response.OutputText, JsonOptions);
                _logger.LogInformation(
                    "{Stage} JSON deserialization succeeded. Attempt={Attempt} ElapsedMs={ElapsedMs}.",
                    stageName,
                    attemptNumber,
                    attemptStopwatch.ElapsedMilliseconds);
            }
            catch (JsonException)
            {
                result = default;
                _logger.LogWarning(
                    "{Stage} JSON deserialization failed. Attempt={Attempt} ElapsedMs={ElapsedMs}.",
                    stageName,
                    attemptNumber,
                    attemptStopwatch.ElapsedMilliseconds);
            }

            if (result is null)
            {
                finalFailureDetail = "Structured output validation failed because the JSON could not be deserialized.";
                _logger.LogWarning(
                    "{Stage} schema validation failed. Attempt={Attempt} Reason={Reason} ElapsedMs={ElapsedMs}.",
                    stageName,
                    attemptNumber,
                    "JSON deserialization failed",
                    attemptStopwatch.ElapsedMilliseconds);
                previousResponseId = response.ResponseId;
                if (attempt == 0)
                {
                    LogRetry(stageName, attemptNumber, "invalid JSON", stopwatch.ElapsedMilliseconds);
                    continue;
                }

                throw new RoadmapGenerationException(
                    $"{stageName} failed: structured output contained invalid JSON.");
            }

            var semanticFailure = getSemanticValidationFailure(result);
            if (semanticFailure is not null)
            {
                finalFailureDetail = $"Structured output validation failed because {semanticFailure}.";
                _logger.LogWarning(
                    "{Stage} schema validation failed. Attempt={Attempt} SemanticFailureReason={Reason} ElapsedMs={ElapsedMs}.",
                    stageName,
                    attemptNumber,
                    semanticFailure,
                    attemptStopwatch.ElapsedMilliseconds);
                previousResponseId = response.ResponseId;
                if (attempt == 0)
                {
                    LogRetry(stageName, attemptNumber, "schema validation failure", stopwatch.ElapsedMilliseconds);
                    continue;
                }

                throw new RoadmapGenerationException(
                    $"{stageName} failed: structured output validation failed because {semanticFailure}.");
            }

            _logger.LogInformation(
                "{Stage} schema and semantic validation succeeded. Attempt={Attempt} ElapsedMs={ElapsedMs}.",
                stageName,
                attemptNumber,
                attemptStopwatch.ElapsedMilliseconds);
            _logger.LogInformation(
                "{Stage} ended. Status=Succeeded ElapsedMs={ElapsedMs} Attempt={Attempt}.",
                stageName,
                stopwatch.ElapsedMilliseconds,
                attemptNumber);
            return result;
        }

        throw new RoadmapGenerationException($"{stageName} failed: structured output validation failed.");
    }

    private void LogRetry(string stageName, int attempt, string reason, long elapsedMilliseconds)
    {
        _logger.LogWarning(
            "{Stage} triggered its single retry. Attempt={Attempt} Reason={Reason} ElapsedMs={ElapsedMs}.",
            stageName,
            attempt,
            reason,
            elapsedMilliseconds);
    }

    private void LogStructuredOutputFailure(
        string stageName,
        int attempt,
        string reason,
        long elapsedMilliseconds)
    {
        _logger.LogWarning(
            "{Stage} JSON deserialization failed. Attempt={Attempt} Reason={Reason} ElapsedMs={ElapsedMs}.",
            stageName,
            attempt,
            reason,
            elapsedMilliseconds);
        _logger.LogWarning(
            "{Stage} schema validation failed. Attempt={Attempt} SemanticFailureReason={Reason} ElapsedMs={ElapsedMs}.",
            stageName,
            attempt,
            reason,
            elapsedMilliseconds);
    }

    private static string? GetPlannerValidationFailure(PlannerDraft roadmap)
    {
        if (string.IsNullOrWhiteSpace(roadmap.Summary)) return "summary was empty";
        if (roadmap.CoachSummary is null) return "coachSummary was missing";
        if (roadmap.Phases is not { Count: > 0 }) return "phases was empty";
        if (roadmap.Phases.Any(phase => string.IsNullOrWhiteSpace(phase.Title))) return "a phase title was empty";
        if (roadmap.Phases.Any(phase => phase.Skills is not { Count: > 0 })) return "a phase had no skills";
        if (roadmap.Phases.Any(phase => phase.Milestones is not { Count: > 0 })) return "a phase had no milestones";
        if (roadmap.RecommendedProjects is not { Count: > 0 }) return "recommendedProjects was empty";
        return null;
    }

    private static string? GetRoadmapValidationFailure(RoadmapResponse roadmap)
    {
        if (string.IsNullOrWhiteSpace(roadmap.Goal)) return "goal was empty";
        if (string.IsNullOrWhiteSpace(roadmap.Summary)) return "summary was empty";
        if (roadmap.CoachSummary is null) return "coachSummary was missing";
        if (roadmap.FeasibilityScore is < 0 or > 100) return "feasibilityScore was outside 0 to 100";
        if (roadmap.Phases is not { Count: > 0 }) return "phases was empty";
        if (roadmap.Phases.Any(phase => string.IsNullOrWhiteSpace(phase.Title))) return "a phase title was empty";
        if (roadmap.Phases.Any(phase => phase.Skills is not { Count: > 0 })) return "a phase had no skills";
        if (roadmap.Phases.Any(phase => phase.Milestones is not { Count: > 0 })) return "a phase had no milestones";
        if (roadmap.Phases.Any(phase => phase.RecommendedProject is null)) return "a phase had no recommended project";
        if (roadmap.CriticReview is null) return "criticReview was missing";
        if (roadmap.SkillVault is not { Count: > 0 }) return "skillVault was empty";
        if (roadmap.SuggestedProjects is not { Count: > 0 }) return "suggestedProjects was empty";
        return null;
    }

    private static string? GetCriticValidationFailure(CriticFeedback feedback)
    {
        if (string.IsNullOrWhiteSpace(feedback.RiskLevel)) return "riskLevel was empty";
        if (feedback.Issues is null) return "issues was missing";
        if (feedback.RecommendedChanges is null) return "recommendedChanges was missing";
        if (string.IsNullOrWhiteSpace(feedback.TimelineAdjustments)) return "timelineAdjustments was empty";
        if (string.IsNullOrWhiteSpace(feedback.PrerequisiteCorrections)) return "prerequisiteCorrections was empty";
        return null;
    }

    private RoadmapResponse NormalizeFeasibilityScore(RoadmapResponse roadmap)
    {
        var normalizedScore = roadmap.CriticReview.RiskLevel switch
        {
            "Low" => Math.Clamp(roadmap.FeasibilityScore, 75, 100),
            "Medium" => Math.Clamp(roadmap.FeasibilityScore, 45, 74),
            "High" => Math.Clamp(roadmap.FeasibilityScore, 0, 44),
            _ => roadmap.FeasibilityScore
        };

        if (normalizedScore == roadmap.FeasibilityScore)
        {
            return roadmap;
        }

        if (_environment.IsDevelopment())
        {
            _logger.LogInformation("feasibilityScore normalized to match critic riskLevel.");
        }

        return roadmap with { FeasibilityScore = normalizedScore };
    }

    private static string GetHttpFailureDetail(string stageName, int statusCode)
    {
        return statusCode switch
        {
            401 or 403 => $"{stageName} failed: OpenAI authentication was rejected.",
            429 => $"{stageName} failed: OpenAI rejected the request because of quota or rate limits.",
            >= 400 and < 500 => $"{stageName} failed: OpenAI rejected the request (HTTP {statusCode}).",
            _ => $"{stageName} failed: OpenAI returned HTTP {statusCode}."
        };
    }

    private static string FormatIncompleteReason(string reason)
    {
        return reason == "max_output_tokens"
            ? "max_output_tokens was reached."
            : $"{reason.Replace('_', ' ')}.";
    }

    private sealed record CriticFeedback(
        string RiskLevel,
        IReadOnlyList<string> Issues,
        IReadOnlyList<string> RecommendedChanges,
        string TimelineAdjustments,
        string PrerequisiteCorrections);

    private sealed record PlannerDraft(
        string Summary,
        CoachSummary CoachSummary,
        IReadOnlyList<PlannerPhase> Phases,
        IReadOnlyList<string> RecommendedProjects);

    private sealed record PlannerPhase(
        string Title,
        IReadOnlyList<string> Skills,
        IReadOnlyList<string> Prerequisites,
        IReadOnlyList<string> Milestones);
}
