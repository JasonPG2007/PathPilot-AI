using Microsoft.AspNetCore.Mvc;
using PathPilot_AI_API.Models;
using PathPilot_AI_API.Services;

namespace PathPilot_AI_API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class RoadmapsController : ControllerBase
{
    private readonly IRoadmapService _roadmapService;

    public RoadmapsController(IRoadmapService roadmapService)
    {
        _roadmapService = roadmapService;
    }

    [HttpPost("generate")]
    [ProducesResponseType<RoadmapResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public ActionResult<RoadmapResponse> Generate([FromBody] GenerateRoadmapRequest request)
    {
        return Ok(_roadmapService.Generate(request));
    }
}
