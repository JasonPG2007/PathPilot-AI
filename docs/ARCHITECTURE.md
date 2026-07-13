# PathPilot AI Architecture

## Overview

PathPilot AI is an AI-powered goal planning application.

Instead of answering questions like a chatbot, it uses a simple agent workflow to create and refine personalized learning roadmaps.

---

# High Level Architecture

```
React Frontend
        │
        ▼
ASP.NET Core API
        │
        ▼
Roadmap Service
        │
        ▼
Planner Agent
        │
        ▼
Critic Agent
        │
        ▼
Planner Revision
        │
        ▼
Structured JSON
        │
        ▼
Frontend UI
```

---

# User Flow

```
Landing Page

↓

Goal Form

↓

Generate Roadmap

↓

Planner Agent

↓

Critic Agent

↓

Planner Revision

↓

Final Roadmap
```

---

# Frontend

Technology

- React
- Vite
- TypeScript
- Tailwind CSS

Pages

1. Landing

2. Goal Form

3. AI Processing

4. Roadmap

---

# Backend

Technology

- ASP.NET Core
- C#

Responsibilities

- Receive user input
- Call GPT-5.6
- Orchestrate agent workflow
- Validate JSON
- Return structured response

---

# Agent Workflow

## Step 1

Planner Agent

Creates the first roadmap.

↓

## Step 2

Critic Agent

Reviews:

- workload
- timeline
- prerequisites
- milestones

↓

## Step 3

Planner Revision

Produces the final roadmap.

---

# API

POST

```
/api/roadmaps/generate
```

Request

```json
{
  "currentLevel": "",
  "goal": "",
  "timeline": "",
  "weeklyHours": 8,
  "existingSkills": []
}
```

Response

```json
{
  "goal": "",
  "summary": "",
  "phases": [],
  "criticReview": {}
}
```

---

# MVP Scope

Included

✅ Landing page

✅ Goal form

✅ Planner Agent

✅ Critic Agent

✅ Planner Revision

✅ Final roadmap

---

Excluded

❌ Login

❌ Database

❌ Progress tracking

❌ Notifications

❌ Payments

❌ Dashboard

❌ Admin Panel

---

# Future Roadmap

Future versions may include:

- Reflection Agent
- Coach Agent
- Progress tracking
- Learning analytics
- University integration
- Mentor collaboration

These are intentionally excluded from the Build Week MVP.
