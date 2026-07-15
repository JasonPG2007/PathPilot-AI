using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace PathPilot_AI_API.Services;

public sealed class OpenAIResponsesClient
{
    private readonly HttpClient _httpClient;

    public OpenAIResponsesClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<string> CreateStructuredResponseAsync(
        string apiKey,
        string model,
        string instructions,
        string input,
        string schemaName,
        JsonNode schema,
        CancellationToken cancellationToken)
    {
        var payload = new JsonObject
        {
            ["model"] = model,
            ["instructions"] = instructions,
            ["input"] = input,
            ["text"] = new JsonObject
            {
                ["format"] = new JsonObject
                {
                    ["type"] = "json_schema",
                    ["name"] = schemaName,
                    ["strict"] = true,
                    ["schema"] = schema.DeepClone()
                }
            }
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "responses")
        {
            Content = new StringContent(payload.ToJsonString(), Encoding.UTF8, "application/json")
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            throw new RoadmapGenerationException(
                "The AI service could not generate a roadmap right now. Please try again shortly.");
        }

        await using var responseStream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var document = await JsonDocument.ParseAsync(responseStream, cancellationToken: cancellationToken);

        foreach (var outputItem in document.RootElement.GetProperty("output").EnumerateArray())
        {
            if (!outputItem.TryGetProperty("content", out var contentItems))
            {
                continue;
            }

            foreach (var contentItem in contentItems.EnumerateArray())
            {
                if (contentItem.TryGetProperty("type", out var type) &&
                    type.GetString() == "output_text" &&
                    contentItem.TryGetProperty("text", out var text))
                {
                    return text.GetString()
                        ?? throw new RoadmapGenerationException("The AI service returned an empty roadmap.");
                }
            }
        }

        throw new RoadmapGenerationException("The AI service did not return a usable roadmap.");
    }
}
