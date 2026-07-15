using System.Text.Json;
using System.Text.Json.Nodes;
using PathPilot_AI_API.Models;

namespace PathPilot_AI_API.Services;

public sealed class OpenAIRoadmapExplanationService : IRoadmapExplanationService
{
    public const int MaxOutputTokens = 450;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private static readonly JsonNode ExplanationSchema = JsonNode.Parse("""
        {
          "type": "object",
          "additionalProperties": false,
          "required": ["explanation", "prerequisiteReason", "careerImpact", "expectedBenefit"],
          "properties": {
            "explanation": { "type": "string" },
            "prerequisiteReason": { "type": "string" },
            "careerImpact": { "type": "string" },
            "expectedBenefit": { "type": "string" }
          }
        }
        """)!;

    private readonly IConfiguration _configuration;
    private readonly OpenAIResponsesClient _responsesClient;

    public OpenAIRoadmapExplanationService(
        IConfiguration configuration,
        OpenAIResponsesClient responsesClient)
    {
        _configuration = configuration;
        _responsesClient = responsesClient;
    }

    public async Task<RoadmapExplanationResponse> ExplainAsync(
        ExplainRoadmapRequest request,
        CancellationToken cancellationToken)
    {
        var apiKey = _configuration["OpenAI:ApiKey"]!;
        var model = _configuration["OpenAI:Model"];
        if (string.IsNullOrWhiteSpace(model))
        {
            throw new RoadmapGenerationException("The explanation model is not configured.");
        }

        var result = await _responsesClient.CreateStructuredResponseAsync(
            apiKey,
            model,
            "Explain concisely why the selected roadmap item is sequenced here. Use one short sentence per field. Return only the schema fields.",
            JsonSerializer.Serialize(request, JsonOptions),
            "roadmap_explanation",
            ExplanationSchema,
            MaxOutputTokens,
            previousResponseId: null,
            cancellationToken);

        if (result.HttpStatus is < 200 or >= 300 || result.Status != "completed" ||
            result.IsRefusal || string.IsNullOrWhiteSpace(result.OutputText))
        {
            throw new RoadmapGenerationException("The explanation service could not complete this request. Please try again.");
        }

        try
        {
            var explanation = JsonSerializer.Deserialize<RoadmapExplanationResponse>(result.OutputText, JsonOptions);
            if (explanation is null || string.IsNullOrWhiteSpace(explanation.Explanation))
            {
                throw new JsonException();
            }
            return explanation;
        }
        catch (JsonException exception)
        {
            throw new RoadmapGenerationException("The explanation service returned invalid structured data.", exception);
        }
    }
}
