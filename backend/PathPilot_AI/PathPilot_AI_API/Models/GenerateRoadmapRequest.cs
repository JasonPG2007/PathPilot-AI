using System.ComponentModel.DataAnnotations;

namespace PathPilot_AI_API.Models;

public sealed class GenerateRoadmapRequest
{
    [Required(ErrorMessage = "Current level is required.")]
    [StringLength(50, ErrorMessage = "Current level must be 50 characters or fewer.")]
    public string CurrentLevel { get; init; } = string.Empty;

    [Required(ErrorMessage = "A learning or career goal is required.")]
    [StringLength(200, MinimumLength = 3, ErrorMessage = "Goal must be between 3 and 200 characters.")]
    public string Goal { get; init; } = string.Empty;

    [Required(ErrorMessage = "Timeline is required.")]
    [StringLength(60, ErrorMessage = "Timeline must be 60 characters or fewer.")]
    public string Timeline { get; init; } = string.Empty;

    [Range(1, 80, ErrorMessage = "Weekly hours must be between 1 and 80.")]
    public int WeeklyHours { get; init; }

    [Required(ErrorMessage = "Existing skills are required. Use an empty array when there are none.")]
    public IReadOnlyList<string>? ExistingSkills { get; init; }

    [Required(ErrorMessage = "Learning style is required.")]
    [StringLength(50, ErrorMessage = "Learning style must be 50 characters or fewer.")]
    public string LearningStyle { get; init; } = string.Empty;
}
