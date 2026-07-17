using System.Text.RegularExpressions;

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

        if (IsConcise(goal)) return CorrectIndefiniteArticle(goal);
        if (IsConcise(candidate)) return CorrectIndefiniteArticle(candidate);
        return CorrectIndefiniteArticle(DeriveFromGoal(goal));
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

    private static string CorrectIndefiniteArticle(string title) => Regex.Replace(
        title,
        @"\b(a)\s+([A-Za-z][A-Za-z-]*)",
        match =>
        {
            var nextWord = match.Groups[2].Value;
            if (!StartsWithVowel(nextWord) || HasConsonantSoundException(nextWord)) return match.Value;
            var article = match.Groups[1].Value == "A" ? "An" : "an";
            return $"{article} {nextWord}";
        },
        RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);

    private static bool StartsWithVowel(string word) => "aeiou".Contains(char.ToLowerInvariant(word[0]));

    private static bool HasConsonantSoundException(string word)
    {
        var normalized = word.ToLowerInvariant();
        return normalized.StartsWith("university") ||
            normalized.StartsWith("user") ||
            normalized.StartsWith("european") ||
            normalized.StartsWith("one") ||
            normalized is "ux" or "ui";
    }
}
