using PathPilot_AI_API.Models;

namespace PathPilot_AI_API.Services;

public interface IRoadmapExplanationService
{
    Task<RoadmapExplanationResponse> ExplainAsync(
        ExplainRoadmapRequest request,
        CancellationToken cancellationToken);
}
