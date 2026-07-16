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

    public RoadmapsController(IRoadmapService roadmapService, IReplanRoadmapService replanService, IRoadmapExplanationService explanationService, ILogger<RoadmapsController> logger)
    {
        _roadmapService = roadmapService;
        _replanService = replanService;
        _explanationService = explanationService;
        _logger = logger;
    }

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
