using System.ComponentModel.DataAnnotations;

namespace PathPilot_AI_API.Models;

public sealed class ReplanRoadmapRequest
{
    [Required]
    public GenerateRoadmapRequest? LearnerProfile { get; init; }

    [Required]
    public RoadmapResponse? CurrentRoadmap { get; init; }

    [Required]
    public LearnerProgressDto? LearnerProgress { get; init; }

    [Required]
    public UpdatedConstraintsDto? UpdatedConstraints { get; init; }
}

public sealed class LearnerProgressDto
{
    [Required]
    public IReadOnlyList<string>? CompletedSkillIds { get; init; }

    [Required]
    public IReadOnlyList<string>? CompletedMilestoneIds { get; init; }

    public int? CurrentPhase { get; init; }
}

public sealed class UpdatedConstraintsDto
{
    [Range(1, 80)]
    public int WeeklyHours { get; init; }

    [Required, StringLength(60)]
    public string Timeline { get; init; } = string.Empty;

    [Required, StringLength(100)]
    public string MainDifficulty { get; init; } = string.Empty;

    [StringLength(500)]
    public string? Note { get; init; }
}
