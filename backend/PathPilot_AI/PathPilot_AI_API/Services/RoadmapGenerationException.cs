namespace PathPilot_AI_API.Services;

public sealed class RoadmapGenerationException : Exception
{
    public RoadmapGenerationException(string message)
        : base(message)
    {
    }

    public RoadmapGenerationException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
