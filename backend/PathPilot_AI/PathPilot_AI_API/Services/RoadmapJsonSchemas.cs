using System.Text.Json.Nodes;

namespace PathPilot_AI_API.Services;

public static class RoadmapJsonSchemas
{
    public static JsonNode Roadmap { get; } = JsonNode.Parse("""
        {
          "type": "object",
          "additionalProperties": false,
          "required": ["goal", "summary", "timeline", "weeklyHours", "startingLevel", "feasibilityScore", "phases", "criticReview", "skillVault", "suggestedProjects"],
          "properties": {
            "goal": { "type": "string" },
            "summary": { "type": "string" },
            "timeline": { "type": "string" },
            "weeklyHours": { "type": "integer", "minimum": 1, "maximum": 80 },
            "startingLevel": { "type": "string" },
            "feasibilityScore": { "type": "integer", "minimum": 0, "maximum": 100 },
            "phases": {
              "type": "array",
              "minItems": 1,
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
                  "skills": { "type": "array", "minItems": 1, "items": { "type": "string" } },
                  "prerequisites": { "type": "array", "items": { "type": "string" } },
                  "milestones": { "type": "array", "minItems": 1, "items": { "type": "string" } },
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
                "issues": { "type": "array", "items": { "type": "string" } },
                "changesMade": { "type": "array", "items": { "type": "string" } },
                "timelineAdjustments": { "type": "string" },
                "prerequisiteCorrections": { "type": "string" }
              }
            },
            "skillVault": {
              "type": "array",
              "minItems": 1,
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
              "minItems": 1,
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

    public static JsonNode Critic { get; } = JsonNode.Parse("""
        {
          "type": "object",
          "additionalProperties": false,
          "required": ["riskLevel", "issues", "recommendedChanges", "timelineAdjustments", "prerequisiteCorrections"],
          "properties": {
            "riskLevel": { "type": "string", "enum": ["Low", "Medium", "High"] },
            "issues": { "type": "array", "items": { "type": "string" } },
            "recommendedChanges": { "type": "array", "items": { "type": "string" } },
            "timelineAdjustments": { "type": "string" },
            "prerequisiteCorrections": { "type": "string" }
          }
        }
        """)!;
}
