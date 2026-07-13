# PathPilot AI - Coding Rules

These rules must be followed for every implementation.

---

# General Principles

This project is built for OpenAI Build Week.

Priorities:

1. Simplicity
2. Readability
3. Working software
4. Small MVP
5. Clean UI

Avoid unnecessary abstractions.

---

# Architecture

Frontend

- React
- Vite
- TypeScript
- Tailwind CSS

Backend

- ASP.NET Core Web API
- C#

Use a service-based architecture.

Controllers should only:

- receive requests
- validate input
- call services
- return responses

Never place business logic inside controllers.

---

# AI

All GPT interactions must be implemented inside

/OpenAI

or

/Services

Never inside controllers.

Prompt templates must live in

/Prompts

Each agent has its own prompt.

Planner

Critic

Planner Revision

---

# API

Every endpoint must:

- return JSON
- return meaningful errors
- never expose API keys
- use DTOs

Never return Entity objects directly.

---

# Frontend

Use functional components only.

Prefer hooks.

Use TypeScript strict mode.

Do not use any unless absolutely necessary.

Create reusable UI components.

Keep pages simple.

---

# Styling

Use Tailwind CSS.

Keep spacing consistent.

Use responsive layouts.

Avoid unnecessary animations.

Focus on usability.

---

# Error Handling

Every API call should:

- handle loading
- handle timeout
- handle failure

Display friendly messages.

Never expose raw exceptions.

---

# Naming

React

PascalCase

Example

RoadmapCard.tsx

Hooks

camelCase

Example

useRoadmap.ts

API

camelCase

Example

generateRoadmap()

C#

PascalCase

Example

RoadmapService

Private fields

\_prefix

Example

\_openAiClient

---

# JSON

Always validate AI responses.

Never assume GPT always returns valid JSON.

Retry parsing if necessary.

---

# Comments

Write comments only when necessary.

Prefer self-explanatory code.

---

# Security

Never expose

OPENAI_API_KEY

to the frontend.

Read all secrets from environment variables.

---

# Git

Make small commits.

Example

Initialize frontend

Add Planner Agent

Integrate GPT-5.6

Improve roadmap UI

Never make one giant commit.

---

# Scope

Do NOT implement:

- Login
- Registration
- Payments
- Admin panel
- Notifications
- Analytics
- Chat history

Stay focused on the MVP.

---

# AI Workflow

Always follow:

Planner Agent

↓

Critic Agent

↓

Planner Revision

Never skip the Critic Agent.

---

# Build Week Goal

The goal is NOT to build the biggest application.

The goal is to demonstrate an effective AI agent workflow powered by GPT-5.6 and accelerated by Codex.

Every implementation decision should support this goal.
