namespace PathPilot_AI_API.Services;

public sealed class ServiceConfigurationException : Exception
{
    public ServiceConfigurationException(string message) : base(message) { }
}
