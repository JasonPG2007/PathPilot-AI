using System.Diagnostics;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using PathPilot_AI_API.Models;
using PathPilot_AI_API.Services;

namespace PathPilot_AI_API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class RoadmapsController : ControllerBase
{
    private readonly IRoadmapService _roadmapService;
    private readonly IReplanRoadmapService _replanService;
    private readonly IRoadmapExplanationService _explanationService;
    private readonly ILogger<RoadmapsController> _logger;
    private readonly IWebHostEnvironment _environment;
    private static readonly JsonSerializerOptions StreamJsonOptions = new(JsonSerializerDefaults.Web);

    public RoadmapsController(IRoadmapService roadmapService, IReplanRoadmapService replanService, IRoadmapExplanationService explanationService, ILogger<RoadmapsController> logger, IWebHostEnvironment environment)
    {
        _roadmapService = roadmapService;
        _replanService = replanService;
        _explanationService = explanationService;
        _logger = logger;
        _environment = environment;
    }

    [HttpPost("generate/stream")]
    public async Task GenerateStream(
        [FromBody] GenerateRoadmapRequest request,
        CancellationToken cancellationToken)
    {
        Response.StatusCode = StatusCodes.Status200OK;
        Response.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache, no-store";
        Response.Headers.Append("X-Accel-Buffering", "no");

        var workflowTimer = Stopwatch.StartNew();
        var stageTimer = Stopwatch.StartNew();
        var eventGapTimer = Stopwatch.StartNew();
        string? activeStage = null;

        try
        {
            var roadmap = await _roadmapService.GenerateAsync(request, cancellationToken, async progress =>
            {
                activeStage = progress.Stage;
                if (progress.EventName.EndsWith("_started", StringComparison.Ordinal)) stageTimer.Restart();
                if (_environment.IsDevelopment())
                {
                    _logger.LogInformation(
                        "Generation progress {EventName} for {Stage}; TimestampUtc={TimestampUtc} StageElapsedMs={StageElapsedMs} WorkflowElapsedMs={WorkflowElapsedMs} PreviousEventGapMs={PreviousEventGapMs}.",
                        progress.EventName,
                        progress.Stage,
                        DateTimeOffset.UtcNow,
                        stageTimer.ElapsedMilliseconds,
                        workflowTimer.ElapsedMilliseconds,
                        eventGapTimer.ElapsedMilliseconds);
                }
                await WriteStreamEventAsync(progress.EventName, new { stage = progress.Stage }, cancellationToken);
                eventGapTimer.Restart();
            });

            await WriteStreamEventAsync("completed", roadmap, cancellationToken);
            if (_environment.IsDevelopment())
            {
                _logger.LogInformation("Generation stream completed in {ElapsedMs}ms.", workflowTimer.ElapsedMilliseconds);
            }
        }
        catch (OperationCanceledException) when (HttpContext.RequestAborted.IsCancellationRequested)
        {
            _logger.LogInformation("Generation stream stopped because the client disconnected after {ElapsedMs}ms.", workflowTimer.ElapsedMilliseconds);
        }
        catch (Exception exception)
        {
            var detail = GetSafeGenerationFailure(exception);
            _logger.LogWarning(
                "Generation stream failed during {Stage} after {ElapsedMs}ms: {FailureType}.",
                activeStage ?? "startup",
                workflowTimer.ElapsedMilliseconds,
                exception.GetType().Name);

            if (!HttpContext.RequestAborted.IsCancellationRequested)
            {
                await WriteStreamEventAsync("failed", new { stage = activeStage, detail }, CancellationToken.None);
            }
        }
    }

    private async ValueTask WriteStreamEventAsync(string eventName, object data, CancellationToken cancellationToken)
    {
        var json = JsonSerializer.Serialize(data, StreamJsonOptions);
        await Response.WriteAsync($"event: {eventName}\ndata: {json}\n\n", cancellationToken);
        await Response.Body.FlushAsync(cancellationToken);
    }

    private static string GetSafeGenerationFailure(Exception exception) => exception switch
    {
        ServiceConfigurationException => exception.Message,
        UpstreamServiceTimeoutException => exception.Message,
        RoadmapGenerationException => exception.Message,
        OperationCanceledException => "Roadmap generation was cancelled before it completed.",
        _ => "The AI agents could not complete the roadmap. Please try again."
    };

    [HttpPost("generate")]
    [ProducesResponseType<RoadmapResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status408RequestTimeout)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status502BadGateway)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status504GatewayTimeout)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<RoadmapResponse>> Generate(
        [FromBody] GenerateRoadmapRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _roadmapService.GenerateAsync(request, cancellationToken));
        }
        catch (ServiceConfigurationException exception)
        {
            return ConfigurationProblem(exception);
        }
        catch (UpstreamServiceTimeoutException exception)
        {
            _logger.LogWarning("Initial generation upstream request timed out.");
            return Problem(
                statusCode: StatusCodes.Status504GatewayTimeout,
                title: "The AI service took too long to respond.",
                detail: exception.Message,
                instance: HttpContext.Request.Path);
        }
        catch (OperationCanceledException) when (HttpContext.RequestAborted.IsCancellationRequested)
        {
            _logger.LogInformation("Initial generation stopped because the client disconnected.");
            return Problem(
                statusCode: 499,
                title: "The client closed the request.",
                detail: "Roadmap generation stopped after the client disconnected.",
                instance: HttpContext.Request.Path);
        }
        catch (OperationCanceledException)
        {
            _logger.LogInformation("Initial generation request was cancelled before completion.");
            return CancellationProblem();
        }
        catch (RoadmapGenerationException exception)
        {
            return Problem(
                statusCode: StatusCodes.Status502BadGateway,
                title: "Roadmap generation failed.",
                detail: exception.Message,
                instance: HttpContext.Request.Path);
        }
    }

    [HttpPost("replan")]
    [ProducesResponseType<RoadmapResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status408RequestTimeout)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status502BadGateway)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<RoadmapResponse>> Replan(
        [FromBody] ReplanRoadmapRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _replanService.ReplanAsync(request, cancellationToken));
        }
        catch (ServiceConfigurationException exception)
        {
            return ConfigurationProblem(exception);
        }
        catch (UpstreamServiceTimeoutException exception)
        {
            _logger.LogWarning("Replan upstream request timed out.");
            return Problem(
                statusCode: StatusCodes.Status504GatewayTimeout,
                title: "The AI service took too long to respond.",
                detail: exception.Message,
                instance: HttpContext.Request.Path);
        }
        catch (OperationCanceledException) when (HttpContext.RequestAborted.IsCancellationRequested)
        {
            _logger.LogInformation("Replan stopped because the client disconnected.");
            return Problem(
                statusCode: 499,
                title: "The client closed the request.",
                detail: "Replanning stopped after the client disconnected.",
                instance: HttpContext.Request.Path);
        }
        catch (OperationCanceledException)
        {
            _logger.LogInformation("Replan request was cancelled before completion.");
            return CancellationProblem();
        }
        catch (RoadmapGenerationException exception)
        {
            return Problem(
                statusCode: StatusCodes.Status502BadGateway,
                title: "Roadmap replanning failed.",
                detail: exception.Message,
                instance: HttpContext.Request.Path);
        }
    }

    [HttpPost("explain")]
    [ProducesResponseType<RoadmapExplanationResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status408RequestTimeout)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status502BadGateway)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<RoadmapExplanationResponse>> Explain(
        [FromBody] ExplainRoadmapRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _explanationService.ExplainAsync(request, cancellationToken));
        }
        catch (ServiceConfigurationException exception)
        {
            return ConfigurationProblem(exception);
        }
        catch (OperationCanceledException)
        {
            return CancellationProblem();
        }
        catch (RoadmapGenerationException exception)
        {
            return Problem(
                statusCode: StatusCodes.Status502BadGateway,
                title: "Roadmap explanation failed.",
                detail: exception.Message,
                instance: HttpContext.Request.Path);
        }
    }

    private ObjectResult ConfigurationProblem(ServiceConfigurationException exception) => Problem(
        statusCode: StatusCodes.Status503ServiceUnavailable,
        title: "AI service configuration is unavailable.",
        detail: exception.Message,
        instance: HttpContext.Request.Path);

    private ObjectResult CancellationProblem() => Problem(
        statusCode: StatusCodes.Status408RequestTimeout,
        title: "The request was cancelled.",
        detail: "The operation was cancelled before it completed. Try again when ready.",
        instance: HttpContext.Request.Path);
}
