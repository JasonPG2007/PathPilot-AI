using PathPilot_AI_API.Models;

namespace PathPilot_AI_API.Services;

public sealed class MockRoadmapService : IRoadmapService, IReplanRoadmapService
{
    public async Task<RoadmapResponse> GenerateAsync(
        GenerateRoadmapRequest request,
        CancellationToken cancellationToken,
        Func<RoadmapGenerationProgress, ValueTask>? reportProgress = null)
    {
        await ReportAsync(reportProgress, "planner_started", "planner");
        var goal = request.Goal.Trim();
        var focus = GetFocus(goal);
        var goalPhrases = GetGoalPhrases(goal);
        var existingSkills = (request.ExistingSkills ?? [])
            .Where(skill => !string.IsNullOrWhiteSpace(skill))
            .Select(skill => skill.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
        var prerequisites = existingSkills.Length > 0 ? existingSkills : ["Basic digital literacy"];

        var roadmap = new RoadmapResponse(
            Goal: RoadmapTitleNormalizer.Normalize(goal, goal),
            Summary: $"A practical {request.Timeline.ToLowerInvariant()} roadmap for a {request.CurrentLevel.ToLowerInvariant()} learner pursuing {goalPhrases.Pursuit} through {request.LearningStyle.ToLowerInvariant()}-first study.",
            Timeline: request.Timeline,
            WeeklyHours: request.WeeklyHours,
            StartingLevel: request.CurrentLevel,
            FeasibilityScore: GetFeasibilityScore(request.WeeklyHours),
            CoachSummary: new CoachSummary(
                existingSkills.Length > 0 ? $"Your existing {string.Join(", ", existingSkills.Take(2))} foundation gives you useful momentum." : "Your clear role goal and willingness to build practical evidence provide a strong starting point.",
                $"Maintaining consistent weekly practice while progressing toward {goalPhrases.Direction} will be the main challenge.",
                "Balanced",
                "Begin with the first foundation milestone and protect a recurring weekly project block."),
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

        await ReportAsync(reportProgress, "planner_completed", "planner");
        await ReportAsync(reportProgress, "critic_started", "critic");
        await ReportAsync(reportProgress, "critic_completed", "critic");
        await ReportAsync(reportProgress, "revision_started", "revision");
        await ReportAsync(reportProgress, "revision_completed", "revision");
        return roadmap;
    }

    private static ValueTask ReportAsync(
        Func<RoadmapGenerationProgress, ValueTask>? reportProgress,
        string eventName,
        string stage) => reportProgress?.Invoke(new RoadmapGenerationProgress(eventName, stage)) ?? ValueTask.CompletedTask;

    public Task<RoadmapResponse> ReplanAsync(ReplanRoadmapRequest request, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var roadmap = request.CurrentRoadmap!;
        var constraints = request.UpdatedConstraints!;
        var (riskLevel, score) = GetReplanRisk(constraints.WeeklyHours, constraints.MainDifficulty);
        var workload = $"{constraints.WeeklyHours} hours/week";
        var phases = roadmap.Phases.Select((phase, index) => phase with
        {
            Duration = $"Stage {index + 1} of {constraints.Timeline}",
            WeeklyWorkload = workload
        }).ToArray();

        var revised = roadmap with
        {
            Summary = $"Revised for {constraints.WeeklyHours} weekly hours across {constraints.Timeline.ToLowerInvariant()}, with extra support for {constraints.MainDifficulty.ToLowerInvariant()}.",
            Timeline = constraints.Timeline,
            WeeklyHours = constraints.WeeklyHours,
            FeasibilityScore = score,
            CoachSummary = roadmap.CoachSummary with
            {
                BiggestChallenge = $"The revised plan must account for {constraints.MainDifficulty.ToLowerInvariant()} without disrupting completed work.",
                RecommendedStrategy = GetStrategy(constraints.Timeline),
                NextAdvice = $"Use the next study block to begin the first unfinished milestone at {constraints.WeeklyHours} hours per week."
            },
            Phases = phases,
            CriticReview = roadmap.CriticReview with
            {
                RiskLevel = riskLevel,
                Issues = [$"Primary learner difficulty: {constraints.MainDifficulty}"],
                ChangesMade = ["Rebalanced weekly workload", "Adjusted phase pacing while preserving completed work"],
                TimelineAdjustments = $"Updated target timeline to {constraints.Timeline}.",
                PrerequisiteCorrections = "Completed skills and milestones remain credited in their original phases."
            }
        };

        return Task.FromResult(revised);
    }

    private static string GetStrategy(string timeline) =>
        timeline.Contains("Fast Track", StringComparison.OrdinalIgnoreCase) ? "Fast" :
        timeline.Contains("Deep Mastery", StringComparison.OrdinalIgnoreCase) ? "Deep" : "Balanced";

    private static (string RiskLevel, int Score) GetReplanRisk(int weeklyHours, string difficulty)
    {
        var difficultConstraint = difficulty.Contains("time", StringComparison.OrdinalIgnoreCase) ||
            difficulty.Contains("consistency", StringComparison.OrdinalIgnoreCase);

        if (weeklyHours < 6 || (weeklyHours < 10 && difficultConstraint)) return ("High", 40);
        if (weeklyHours < 12 || difficultConstraint) return ("Medium", 68);
        return ("Low", 86);
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
