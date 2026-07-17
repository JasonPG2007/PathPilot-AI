namespace PathPilot_AI_API.Services;

public static class RoadmapTitleNormalizer
{
    public const int MaximumWords = 12;
    public const int MaximumCharacters = 90;
    private const string FallbackTitle = "Personalized Learning Roadmap";

    public static string Normalize(string? generatedTitle, string? learnerGoal)
    {
        var goal = Clean(learnerGoal);
        var candidate = Clean(generatedTitle);

        if (IsConcise(goal)) return goal;
        if (IsConcise(candidate)) return candidate;
        return DeriveFromGoal(goal);
    }

    public static bool IsConcise(string? value)
    {
        var cleaned = Clean(value);
        return cleaned.Length is > 0 and <= MaximumCharacters &&
            CountWords(cleaned) <= MaximumWords &&
            !cleaned.Contains(',') &&
            !cleaned.EndsWith('.') &&
            !cleaned.EndsWith('!') &&
            !cleaned.EndsWith('?');
    }

    private static string DeriveFromGoal(string goal)
    {
        if (string.IsNullOrWhiteSpace(goal)) return FallbackTitle;

        var shortened = goal
            .Replace("I want to ", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Replace("My goal is to ", string.Empty, StringComparison.OrdinalIgnoreCase);
        shortened = shortened.Split([',', ';', ':', '.', '!', '?'], 2)[0].Trim();
        shortened = string.Join(' ', shortened.Split(' ', StringSplitOptions.RemoveEmptyEntries).Take(MaximumWords));

        while (shortened.Length > MaximumCharacters && shortened.Contains(' '))
        {
            shortened = shortened[..shortened.LastIndexOf(' ')];
        }

        return string.IsNullOrWhiteSpace(shortened) ? FallbackTitle : shortened.TrimEnd('-', '–', '—').Trim();
    }

    private static string Clean(string? value) =>
        string.Join(' ', (value ?? string.Empty).Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries)).Trim();

    private static int CountWords(string value) => value.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
}

