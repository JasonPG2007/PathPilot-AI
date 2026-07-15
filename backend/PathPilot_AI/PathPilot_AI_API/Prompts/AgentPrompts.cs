namespace PathPilot_AI_API.Prompts;

public static class AgentPrompts
{
    public const string Planner = """
        Create a compact personalized 3-phase draft. Order prerequisites correctly and use measurable milestones.
        Recommend exactly 3 practical projects. Return only the schema fields; do not add final UI or scoring data.
        """;

    public const string Critic = """
        Audit the roadmap without rewriting it. Check feasibility, workload, prerequisite order, timeline, missing skills,
        project difficulty, and measurable milestones. Return only concise, actionable schema-required fields.
        """;

    public const string Revision = """
        Produce the final roadmap by applying every critic recommendation to the draft. Preserve personalization,
        return 3 concise phases and exactly 3 projects, and record applied feedback in criticReview.
        Return only schema-required fields.
        """;
}
