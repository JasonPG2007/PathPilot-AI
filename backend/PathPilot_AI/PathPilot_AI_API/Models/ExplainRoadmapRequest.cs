using System.ComponentModel.DataAnnotations;

namespace PathPilot_AI_API.Models;

public sealed class ExplainRoadmapRequest
{
    [Required, StringLength(200)]
    public string LearnerGoal { get; init; } = string.Empty;

    [Required, StringLength(150)]
    public string CurrentPhaseTitle { get; init; } = string.Empty;

    [Required, StringLength(300)]
    public string SelectedItem { get; init; } = string.Empty;

    [StringLength(300)]
    public string? PreviousItem { get; init; }

    [StringLength(300)]
    public string? NextItem { get; init; }
}

public sealed record RoadmapExplanationResponse(
    string Explanation,
    string PrerequisiteReason,
    string CareerImpact,
    string ExpectedBenefit);
