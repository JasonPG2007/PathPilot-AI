using PathPilot_AI_API.Models;

namespace PathPilot_AI_API.Services;

public interface IReplanRoadmapService
{
    Task<RoadmapResponse> ReplanAsync(
        ReplanRoadmapRequest request,
        CancellationToken cancellationToken);
}
