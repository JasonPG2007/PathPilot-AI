using PathPilot_AI_API.Models;

namespace PathPilot_AI_API.Services;

public interface IRoadmapService
{
    Task<RoadmapResponse> GenerateAsync(GenerateRoadmapRequest request, CancellationToken cancellationToken);
}
