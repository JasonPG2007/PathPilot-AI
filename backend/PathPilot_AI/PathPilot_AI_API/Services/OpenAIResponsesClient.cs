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

    public async Task<OpenAIResponseResult> CreateStructuredResponseAsync(
        string apiKey,
        string model,
        string instructions,
        string input,
        string schemaName,
        JsonNode schema,
        int maxOutputTokens,
        string? previousResponseId,
        CancellationToken cancellationToken)
    {
        var payload = new JsonObject
        {
            ["model"] = model,
            ["instructions"] = instructions,
            ["input"] = input,
            ["max_output_tokens"] = maxOutputTokens,
            ["reasoning"] = new JsonObject
            {
                ["effort"] = "none"
            },
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

        if (!string.IsNullOrWhiteSpace(previousResponseId))
        {
            payload["previous_response_id"] = previousResponseId;
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, "responses")
        {
            Content = new StringContent(payload.ToJsonString(), Encoding.UTF8, "application/json")
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        await using var responseStream = await response.Content.ReadAsStreamAsync(cancellationToken);

        try
        {
            using var document = await JsonDocument.ParseAsync(responseStream, cancellationToken: cancellationToken);
            var root = document.RootElement;
            var status = GetString(root, "status") ?? (response.IsSuccessStatusCode ? "unknown" : "failed");
            var incompleteReason = root.TryGetProperty("incomplete_details", out var incompleteDetails) &&
                incompleteDetails.ValueKind == JsonValueKind.Object
                    ? GetString(incompleteDetails, "reason")
                    : null;
            var outputTokens = root.TryGetProperty("usage", out var usage) &&
                usage.ValueKind == JsonValueKind.Object &&
                usage.TryGetProperty("output_tokens", out var outputTokenElement) &&
                outputTokenElement.TryGetInt32(out var parsedOutputTokens)
                    ? parsedOutputTokens
                    : (int?)null;

            string? outputText = null;
            var refused = false;
            if (root.TryGetProperty("output", out var output) && output.ValueKind == JsonValueKind.Array)
            {
                foreach (var outputItem in output.EnumerateArray())
                {
                    if (!outputItem.TryGetProperty("content", out var content) || content.ValueKind != JsonValueKind.Array)
                    {
                        continue;
                    }

                    foreach (var contentItem in content.EnumerateArray())
                    {
                        var contentType = GetString(contentItem, "type");
                        if (contentType == "refusal")
                        {
                            refused = true;
                        }
                        else if (contentType == "output_text")
                        {
                            outputText = GetString(contentItem, "text");
                        }
                    }
                }
            }

            return new OpenAIResponseResult(
                (int)response.StatusCode,
                GetString(root, "id"),
                status,
                incompleteReason,
                outputTokens,
                outputText,
                refused,
                EnvelopeJsonParsed: true);
        }
        catch (JsonException)
        {
            return new OpenAIResponseResult(
                (int)response.StatusCode,
                ResponseId: null,
                Status: response.IsSuccessStatusCode ? "unknown" : "failed",
                IncompleteReason: null,
                OutputTokens: null,
                OutputText: null,
                IsRefusal: false,
                EnvelopeJsonParsed: false);
        }
    }

    private static string? GetString(JsonElement element, string propertyName)
    {
        return element.TryGetProperty(propertyName, out var property) && property.ValueKind == JsonValueKind.String
            ? property.GetString()
            : null;
    }
}

public sealed record OpenAIResponseResult(
    int HttpStatus,
    string? ResponseId,
    string Status,
    string? IncompleteReason,
    int? OutputTokens,
    string? OutputText,
    bool IsRefusal,
    bool EnvelopeJsonParsed);
