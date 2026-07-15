using Microsoft.AspNetCore.Mvc;
using PathPilot_AI_API.Models;
using PathPilot_AI_API.Services;

namespace PathPilot_AI_API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class RoadmapsController : ControllerBase
{
    private readonly IRoadmapService _roadmapService;
    private readonly MockRoadmapService _mockRoadmapService;

    public RoadmapsController(IRoadmapService roadmapService, MockRoadmapService mockRoadmapService)
    {
        _roadmapService = roadmapService;
        _mockRoadmapService = mockRoadmapService;
    }

    [HttpPost("generate")]
    [ProducesResponseType<RoadmapResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status502BadGateway)]
    public async Task<ActionResult<RoadmapResponse>> Generate(
        [FromBody] GenerateRoadmapRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _roadmapService.GenerateAsync(request, cancellationToken));
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
    public async Task<ActionResult<RoadmapResponse>> Replan(
        [FromBody] ReplanRoadmapRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await _mockRoadmapService.ReplanAsync(request, cancellationToken));
    }
}
