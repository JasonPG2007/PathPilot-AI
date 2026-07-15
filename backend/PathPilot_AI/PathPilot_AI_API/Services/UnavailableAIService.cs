using PathPilot_AI_API.Models;

namespace PathPilot_AI_API.Services;

public sealed class UnavailableAIService : IRoadmapService, IReplanRoadmapService, IRoadmapExplanationService
{
    private const string Message = "The AI service is not configured. Configure OpenAI__ApiKey and OpenAI__Model in the application settings.";

    public Task<RoadmapResponse> GenerateAsync(GenerateRoadmapRequest request, CancellationToken cancellationToken) =>
        Task.FromException<RoadmapResponse>(new ServiceConfigurationException(Message));

    public Task<RoadmapResponse> ReplanAsync(ReplanRoadmapRequest request, CancellationToken cancellationToken) =>
        Task.FromException<RoadmapResponse>(new ServiceConfigurationException(Message));

    public Task<RoadmapExplanationResponse> ExplainAsync(ExplainRoadmapRequest request, CancellationToken cancellationToken) =>
        Task.FromException<RoadmapExplanationResponse>(new ServiceConfigurationException(Message));
}
