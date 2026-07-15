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

    public RoadmapsController(IRoadmapService roadmapService, IReplanRoadmapService replanService, IRoadmapExplanationService explanationService)
    {
        _roadmapService = roadmapService;
        _replanService = replanService;
        _explanationService = explanationService;
    }

    [HttpPost("generate")]
    [ProducesResponseType<RoadmapResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status408RequestTimeout)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status502BadGateway)]
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
        catch (OperationCanceledException)
        {
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
        catch (OperationCanceledException)
        {
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
