# PathPilot AI

## Product Goal

PathPilot AI helps learners transform career or education goals into realistic, personalized learning roadmaps.

## Core Differentiator

The system does not generate a roadmap in one pass.

It uses an agentic workflow:

1. Planner Agent creates an initial roadmap.
2. Critic Agent reviews workload, prerequisites, sequencing, and feasibility.
3. Planner Agent revises the roadmap using the Critic's feedback.

## Target User

Students, self-learners, and career changers who know their goal but do not know how to reach it.

## User Inputs

- Current level
- Goal
- Target timeline
- Weekly available hours
- Existing skills

## Final Output

- Learning phases
- Skills
- Milestones
- Projects
- Weekly workload
- Risks
- Recommended adjustments

## MVP Screens

1. Landing page
2. Goal input form
3. Agent progress screen
4. Final roadmap page

## Tech Stack

Frontend:

- React
- Vite
- TypeScript
- Tailwind CSS

Backend:

- ASP.NET Core Web API
- C#

AI:

- OpenAI GPT-5.6
- OpenAI Responses API

## API

POST /api/roadmaps/generate

## Agent Workflow

Planner Agent
→ Critic Agent
→ Planner Revision
→ Structured JSON response

## Non-Goals

- Authentication
- Database
- Payments
- Chat
- Progress tracking
- Admin panel
