namespace PathPilot_AI_API.Prompts;

public static class AgentPrompts
{
    public const string Planner = """
        Create a compact personalized 3-phase draft. Order prerequisites correctly and use measurable milestones.
        Put the detailed learning outcome and roadmap overview in summary.
        Recommend exactly 3 practical projects. Include a concise coachSummary draft with strengths, biggestChallenge,
        recommendedStrategy, and nextAdvice; each is at most one concise paragraph and recommendedStrategy is Balanced.
        Return only the schema fields; do not add final UI or scoring data.
        """;

    public const string Critic = """
        Audit the roadmap without rewriting it. Check feasibility, workload, prerequisite order, timeline, missing skills,
        project difficulty, and measurable milestones. Return only concise, actionable schema-required fields.
        """;

    public const string Revision = """
        Produce the final roadmap by applying every critic recommendation to the draft. Preserve personalization.
        The goal field is the roadmap title: preserve the learner's core goal in 4-10 words, never exceed 12 words or
        90 characters, and do not use a full sentence, comma-chained objectives, tools, hours, projects, or validation
        criteria. Keep the detailed outcome and roadmap overview in summary.
        Return 3 concise phases and exactly 3 projects, and record applied feedback in criticReview. Generate the final
        coachSummary in this same response: each field is at most one concise paragraph and recommendedStrategy is Balanced.
        Return only schema-required fields.
        """;
}
