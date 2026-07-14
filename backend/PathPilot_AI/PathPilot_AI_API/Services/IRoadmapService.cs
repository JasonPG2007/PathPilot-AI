using PathPilot_AI_API.Models;

namespace PathPilot_AI_API.Services;

public interface IRoadmapService
{
    RoadmapResponse Generate(GenerateRoadmapRequest request);
}
