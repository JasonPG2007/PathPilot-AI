namespace PathPilot_AI_API.Models;

public sealed record RoadmapResponse(
    string Goal,
    string Summary,
    string Timeline,
    int WeeklyHours,
    string StartingLevel,
    int FeasibilityScore,
    IReadOnlyList<RoadmapPhase> Phases,
    CriticReview CriticReview,
    IReadOnlyList<SkillVaultItem> SkillVault,
    IReadOnlyList<SuggestedProject> SuggestedProjects);

public sealed record RoadmapPhase(
    int Id,
    string Title,
    string Duration,
    string WeeklyWorkload,
    string Description,
    IReadOnlyList<string> Skills,
    IReadOnlyList<string> Prerequisites,
    IReadOnlyList<string> Milestones,
    PhaseProject RecommendedProject);

public sealed record PhaseProject(string Title, string Type, string Accent);

public sealed record CriticReview(
    string RiskLevel,
    IReadOnlyList<string> Issues,
    IReadOnlyList<string> ChangesMade,
    string TimelineAdjustments,
    string PrerequisiteCorrections);

public sealed record SkillVaultItem(string Label, int Score);

public sealed record SuggestedProject(
    int Id,
    string Title,
    string Category,
    string Description,
    string Accent);
