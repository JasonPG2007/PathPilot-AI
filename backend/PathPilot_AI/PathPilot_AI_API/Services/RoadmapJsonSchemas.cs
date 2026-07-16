using System.Text.Json.Nodes;

namespace PathPilot_AI_API.Services;

public static class RoadmapJsonSchemas
{
    public static JsonNode Roadmap { get; } = JsonNode.Parse("""
        {
          "type": "object",
          "additionalProperties": false,
          "required": ["goal", "summary", "timeline", "weeklyHours", "startingLevel", "feasibilityScore", "coachSummary", "phases", "criticReview", "skillVault", "suggestedProjects"],
          "properties": {
            "goal": { "type": "string" },
            "summary": { "type": "string" },
            "timeline": { "type": "string" },
            "weeklyHours": { "type": "integer", "minimum": 1, "maximum": 80 },
            "startingLevel": { "type": "string" },
            "feasibilityScore": { "type": "integer", "minimum": 0, "maximum": 100 },
            "coachSummary": {
              "type": "object",
              "additionalProperties": false,
              "required": ["strengths", "biggestChallenge", "recommendedStrategy", "nextAdvice"],
              "properties": {
                "strengths": { "type": "string" },
                "biggestChallenge": { "type": "string" },
                "recommendedStrategy": { "type": "string", "enum": ["Fast", "Balanced", "Deep"] },
                "nextAdvice": { "type": "string" }
              }
            },
            "phases": {
              "type": "array",
              "minItems": 3,
              "maxItems": 4,
              "items": {
                "type": "object",
                "additionalProperties": false,
                "required": ["id", "title", "duration", "weeklyWorkload", "description", "skills", "prerequisites", "milestones", "recommendedProject"],
                "properties": {
                  "id": { "type": "integer", "minimum": 1 },
                  "title": { "type": "string" },
                  "duration": { "type": "string" },
                  "weeklyWorkload": { "type": "string" },
                  "description": { "type": "string" },
                  "skills": { "type": "array", "minItems": 1, "maxItems": 5, "items": { "type": "string" } },
                  "prerequisites": { "type": "array", "maxItems": 4, "items": { "type": "string" } },
                  "milestones": { "type": "array", "minItems": 1, "maxItems": 4, "items": { "type": "string" } },
                  "recommendedProject": {
                    "type": "object",
                    "additionalProperties": false,
                    "required": ["title", "type", "accent"],
                    "properties": {
                      "title": { "type": "string" },
                      "type": { "type": "string" },
                      "accent": { "type": "string", "enum": ["violet", "teal", "blue"] }
                    }
                  }
                }
              }
            },
            "criticReview": {
              "type": "object",
              "additionalProperties": false,
              "required": ["riskLevel", "issues", "changesMade", "timelineAdjustments", "prerequisiteCorrections"],
              "properties": {
                "riskLevel": { "type": "string", "enum": ["Low", "Medium", "High"] },
                "issues": { "type": "array", "maxItems": 4, "items": { "type": "string" } },
                "changesMade": { "type": "array", "maxItems": 4, "items": { "type": "string" } },
                "timelineAdjustments": { "type": "string" },
                "prerequisiteCorrections": { "type": "string" }
              }
            },
            "skillVault": {
              "type": "array",
              "minItems": 3,
              "maxItems": 4,
              "items": {
                "type": "object",
                "additionalProperties": false,
                "required": ["label", "score"],
                "properties": {
                  "label": { "type": "string" },
                  "score": { "type": "integer", "minimum": 0, "maximum": 100 }
                }
              }
            },
            "suggestedProjects": {
              "type": "array",
              "minItems": 3,
              "maxItems": 3,
              "items": {
                "type": "object",
                "additionalProperties": false,
                "required": ["id", "title", "category", "description", "accent"],
                "properties": {
                  "id": { "type": "integer", "minimum": 1 },
                  "title": { "type": "string" },
                  "category": { "type": "string" },
                  "description": { "type": "string" },
                  "accent": { "type": "string", "enum": ["violet", "teal", "blue"] }
                }
              }
            }
          }
        }
        """)!;

    public static JsonNode Planner { get; } = JsonNode.Parse("""
        {
          "type": "object",
          "additionalProperties": false,
          "required": ["summary", "coachSummary", "phases", "recommendedProjects"],
          "properties": {
            "summary": { "type": "string" },
            "coachSummary": {
              "type": "object",
              "additionalProperties": false,
              "required": ["strengths", "biggestChallenge", "recommendedStrategy", "nextAdvice"],
              "properties": {
                "strengths": { "type": "string" },
                "biggestChallenge": { "type": "string" },
                "recommendedStrategy": { "type": "string", "enum": ["Fast", "Balanced", "Deep"] },
                "nextAdvice": { "type": "string" }
              }
            },
            "phases": {
              "type": "array",
              "minItems": 3,
              "maxItems": 3,
              "items": {
                "type": "object",
                "additionalProperties": false,
                "required": ["title", "skills", "prerequisites", "milestones"],
                "properties": {
                  "title": { "type": "string" },
                  "skills": { "type": "array", "minItems": 1, "maxItems": 5, "items": { "type": "string" } },
                  "prerequisites": { "type": "array", "maxItems": 4, "items": { "type": "string" } },
                  "milestones": { "type": "array", "minItems": 1, "maxItems": 4, "items": { "type": "string" } }
                }
              }
            },
            "recommendedProjects": {
              "type": "array",
              "minItems": 3,
              "maxItems": 3,
              "items": { "type": "string" }
            }
          }
        }
        """)!;

    public static JsonNode Critic { get; } = JsonNode.Parse("""
        {
          "type": "object",
          "additionalProperties": false,
          "required": ["riskLevel", "issues", "recommendedChanges", "timelineAdjustments", "prerequisiteCorrections"],
          "properties": {
            "riskLevel": { "type": "string", "enum": ["Low", "Medium", "High"] },
            "issues": { "type": "array", "maxItems": 4, "items": { "type": "string" } },
            "recommendedChanges": { "type": "array", "maxItems": 4, "items": { "type": "string" } },
            "timelineAdjustments": { "type": "string" },
            "prerequisiteCorrections": { "type": "string" }
          }
        }
        """)!;

}
