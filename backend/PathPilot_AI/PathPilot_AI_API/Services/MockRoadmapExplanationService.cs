using PathPilot_AI_API.Models;

namespace PathPilot_AI_API.Services;

public sealed class MockRoadmapExplanationService : IRoadmapExplanationService
{
    public Task<RoadmapExplanationResponse> ExplainAsync(
        ExplainRoadmapRequest request,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var prerequisite = request.PreviousItem is null
            ? $"It establishes an early foundation for {request.CurrentPhaseTitle}."
            : $"It builds directly on {request.PreviousItem} before moving to {request.NextItem ?? "the next roadmap step"}.";

        return Task.FromResult(new RoadmapExplanationResponse(
            $"{request.SelectedItem} is included because it is a practical step toward {request.LearnerGoal} during {request.CurrentPhaseTitle}.",
            prerequisite,
            $"It strengthens evidence that the learner can apply role-relevant knowledge for {request.LearnerGoal}.",
            "Completing it should improve confidence, practical fluency, and readiness for the next roadmap item."));
    }
}
