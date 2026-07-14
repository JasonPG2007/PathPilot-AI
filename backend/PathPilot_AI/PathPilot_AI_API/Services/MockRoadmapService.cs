using PathPilot_AI_API.Models;

namespace PathPilot_AI_API.Services;

public sealed class MockRoadmapService : IRoadmapService
{
    public RoadmapResponse Generate(GenerateRoadmapRequest request)
    {
        var goal = request.Goal.Trim();
        var focus = GetFocus(goal);
        var goalPhrases = GetGoalPhrases(goal);
        var existingSkills = (request.ExistingSkills ?? [])
            .Where(skill => !string.IsNullOrWhiteSpace(skill))
            .Select(skill => skill.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
        var prerequisites = existingSkills.Length > 0 ? existingSkills : ["Basic digital literacy"];

        return new RoadmapResponse(
            Goal: goal,
            Summary: $"A practical {request.Timeline.ToLowerInvariant()} roadmap for a {request.CurrentLevel.ToLowerInvariant()} learner pursuing {goalPhrases.Pursuit} through {request.LearningStyle.ToLowerInvariant()}-first study.",
            Timeline: request.Timeline,
            WeeklyHours: request.WeeklyHours,
            StartingLevel: request.CurrentLevel,
            FeasibilityScore: GetFeasibilityScore(request.WeeklyHours),
            Phases:
            [
                new RoadmapPhase(
                    1,
                    "Build Core Foundations",
                    "Weeks 1-4",
                    $"{request.WeeklyHours} hours/week",
                    $"Establish the essential knowledge needed to progress confidently toward {goalPhrases.Direction}.",
                    focus.FoundationSkills,
                    prerequisites,
                    ["Complete a baseline skills review", "Build a focused practice project", "Pass the foundation milestone"],
                    new PhaseProject(focus.FoundationProject, "Foundation build", "violet")),
                new RoadmapPhase(
                    2,
                    "Develop Applied Expertise",
                    "Weeks 5-14",
                    $"{request.WeeklyHours} hours/week",
                    "Apply the foundations through realistic workflows, deliberate practice, and feedback.",
                    focus.AppliedSkills,
                    ["Build Core Foundations", "Version control basics"],
                    ["Complete two applied labs", "Document a production workflow", "Ship an end-to-end project"],
                    new PhaseProject(focus.AppliedProject, "Applied system", "teal")),
                new RoadmapPhase(
                    3,
                    "Demonstrate Role Readiness",
                    "Weeks 15-24",
                    $"{request.WeeklyHours} hours/week",
                    "Consolidate advanced skills into a polished capstone and role-ready portfolio.",
                    focus.AdvancedSkills,
                    ["Develop Applied Expertise", "Completed portfolio draft"],
                    ["Complete the capstone", "Run a peer review", "Publish the final case study"],
                    new PhaseProject(focus.CapstoneProject, "Capstone", "blue"))
            ],
            CriticReview: new CriticReview(
                "Low",
                ["Weekly project time needs protection", "Advanced work depends on completing the foundation review"],
                ["Added review buffers between phases", "Moved prerequisites ahead of advanced project work"],
                "Balanced into three phases with milestone and review weeks.",
                "Foundation skills now precede applied and advanced topics."),
            SkillVault:
            [
                new SkillVaultItem("Foundations", 88),
                new SkillVaultItem("Engineering", 74),
                new SkillVaultItem(focus.VaultLabel, 62)
            ],
            SuggestedProjects:
            [
                new SuggestedProject(1, focus.FoundationProject, "Foundation", "Demonstrate command of the core concepts with a focused build.", "violet"),
                new SuggestedProject(2, focus.AppliedProject, "Applied", "Create a realistic end-to-end workflow with documentation and tests.", "teal"),
                new SuggestedProject(3, focus.CapstoneProject, "Capstone", $"Show readiness for {goalPhrases.Role} with a polished final system.", "blue")
            ]);
    }

    private static GoalPhrases GetGoalPhrases(string goal)
    {
        const string BecomePrefix = "Become ";

        if (goal.StartsWith(BecomePrefix, StringComparison.OrdinalIgnoreCase))
        {
            var targetRole = goal[BecomePrefix.Length..].Trim();

            return new GoalPhrases(
                $"the goal of becoming {targetRole}",
                $"becoming {targetRole}",
                $"{targetRole} role");
        }

        return new GoalPhrases(goal, goal, goal);
    }

    private static int GetFeasibilityScore(int weeklyHours) => weeklyHours switch
    {
        < 5 => 76,
        <= 20 => 94,
        <= 35 => 88,
        _ => 81
    };

    private static FocusProfile GetFocus(string goal)
    {
        if (goal.Contains("machine", StringComparison.OrdinalIgnoreCase) ||
            goal.Contains(" ai", StringComparison.OrdinalIgnoreCase) ||
            goal.StartsWith("ai", StringComparison.OrdinalIgnoreCase))
        {
            return new FocusProfile(
                ["Python Mastery", "Linear Algebra", "Data Preparation"],
                ["Model Training", "Experiment Tracking", "Model APIs"],
                ["MLOps", "System Design", "Model Evaluation"],
                "Machine Learning",
                "Neural Network from Scratch",
                "Production Prediction API",
                "Intelligent ML Platform");
        }

        if (goal.Contains("data", StringComparison.OrdinalIgnoreCase))
        {
            return new FocusProfile(
                ["SQL", "Statistics", "Data Modeling"],
                ["Data Pipelines", "Analytics", "Visualization"],
                ["Warehouse Design", "Data Quality", "Orchestration"],
                "Data Systems",
                "Exploratory Analysis Toolkit",
                "Automated Analytics Pipeline",
                "Modern Data Platform");
        }

        return new FocusProfile(
            ["Core Concepts", "Problem Solving", "Professional Tooling"],
            ["Applied Workflows", "Testing", "System Design"],
            ["Advanced Practice", "Portfolio Strategy", "Interview Readiness"],
            "Role Readiness",
            "Foundations Showcase",
            "Production-Ready Workflow",
            "Role-Aligned Capstone");
    }

    private sealed record FocusProfile(
        IReadOnlyList<string> FoundationSkills,
        IReadOnlyList<string> AppliedSkills,
        IReadOnlyList<string> AdvancedSkills,
        string VaultLabel,
        string FoundationProject,
        string AppliedProject,
        string CapstoneProject);

    private sealed record GoalPhrases(string Pursuit, string Direction, string Role);
}
