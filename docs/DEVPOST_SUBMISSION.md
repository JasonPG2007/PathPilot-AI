# OpenAI Build Week — Devpost Submission

## 1. Project Name

**PathPilot AI**

## 2. One-line tagline

**An adaptive AI learning coach that plans, explains, tracks, and revises your journey.**

## 3. Elevator pitch

PathPilot AI turns a learner’s goal, experience, schedule, and preferences into an explainable learning journey. A GPT-5.6 Planner drafts the roadmap, a Critic audits feasibility and prerequisites, and a Revision stage produces the validated result. Learners can compare strategies, track progress, understand why each item matters, and adapt remaining work without losing completed achievements. Trusted resources, local persistence, accessible interactions, and professional PDF export make the roadmap practical beyond its initial generation.

## 4. Inspiration

Learning advice is easy to find but difficult to execute. Learners often receive generic course lists that ignore their starting point, weekly availability, prerequisite gaps, and preferred way of learning. Even a useful plan quickly becomes outdated when a schedule changes. Completed work may be lost during replanning, and recommendations rarely explain why a particular skill or project matters.

We built PathPilot AI to address that gap: not as a guaranteed route to a career outcome, but as an adaptive coach that connects planning, critical review, explanation, progress, and revision in one understandable journey.

## 5. What it does

A learner enters a goal, current level, target timeline, weekly hours, existing skills, and learning style. PathPilot then runs a sequential Planner → Critic → Revision workflow:

1. The **Planner** creates a compact initial learning plan.
2. The **Critic** reviews feasibility, workload, prerequisite order, timeline, missing skills, and project difficulty.
3. The **Revision** stage applies the critique and returns the complete roadmap as strict structured data.

The final experience includes phased learning work, practical projects, critic findings, feasibility and risk, and AI Coach Insights. From there, learners can:

- compare Fast Track, Balanced, and Deep Mastery strategies;
- mark skills and milestones complete and retain progress across refreshes;
- see a Journey Dashboard, next action, estimated finish, and achievements;
- request contextual Explain Why guidance;
- adapt remaining work when time or circumstances change while preserving completed items;
- use deterministically matched resources from trusted providers;
- export a professional multi-page PDF; and
- share a concise summary while keeping the full roadmap and progress private to the device.

## 6. How we built it

The frontend is a responsive **React** application written in JavaScript and JSX, bundled with **Vite**, routed with React Router, and styled with regular CSS. It is deployed on **Vercel**. Browser storage separates the active roadmap session from persistent learner progress, achievements, strategy history, and cached explanations.

The backend is an **ASP.NET Core .NET 8 Web API** deployed to **Azure App Service**. Its public roadmap endpoints retain stable request and response contracts and return safe `ProblemDetails` errors for validation, configuration, timeout, and AI failures.

The AI workflow uses the **GPT-5.6 Responses API**. Planner, Critic, and Revision are explicit sequential stages within the initial generation request—not autonomous background agents. Each stage has a focused contract, concise instructions, bounded output, safe diagnostics, and strict validation. **Structured Outputs** constrain the model response to the application schema, followed by JSON, schema, semantic, risk-score, and completed-item preservation checks.

Adaptive Replanning uses one focused GPT-5.6 revision call rather than rerunning the original three stages. Explain Why uses one contextual call and caches successful results by journey and stable item ID.

Predictable product behavior stays deterministic and local: strategy derivation, progress calculations, achievements, resource matching, PDF generation, sharing summaries, and persistence do not call AI.

## 7. Challenges

### Preserving completed roadmap items

Alternative strategies may omit lower-priority work, but a completed item cannot disappear during replanning. We added deterministic repair before an AI request and strict validation afterward so completed skill and milestone IDs, text, phase ownership, and earned credit remain immutable.

### Adaptive replanning without starting over

Replanning needed enough context to revise future work while avoiding a large, expensive payload. We created a compact replan context containing the learner’s constraints, phase structure, remaining work, projects, and immutable completed items, then used a single revision call.

### Strict JSON validation

Structured output can still be incomplete or semantically inconsistent. The backend distinguishes invalid JSON, schema failures, incomplete output, refusal, cancellation, and service errors. It also normalizes feasibility scores to remain consistent with the returned risk level without another AI request.

### Deterministic local features

Strategy variants, trusted-resource recommendations, dashboard metrics, achievements, and PDF export needed to remain stable across refreshes and strategy switching. We implemented them as deterministic frontend services with stable identities and cost-free tests.

### Timeout and cancellation handling

Initial generation and replan requests can take longer on hosted infrastructure. We separated timeouts by workflow, reduced request context and response verbosity, propagated cancellation tokens, prevented duplicate submissions, and surfaced timeout errors distinctly without automatic paid retries.

### Frontend persistence

Roadmap sessions, strategy-specific replans, progress, achievements, and explanations have different lifecycles. Separating session and local storage—and choosing the newest valid roadmap version—prevented stale data from overwriting an active journey.

## 8. Accomplishments

- Built an explainable, critic-audited roadmap rather than displaying an unchecked first response.
- Added Adaptive Replanning that revises unfinished work while preserving completed progress.
- Generated AI Coach Insights within existing generation and replan responses, without extra requests.
- Created materially different Fast Track, Balanced, and Deep Mastery learning strategies.
- Grounded phases in a deterministic catalog of real resources from trusted providers.
- Connected the roadmap to persistent progress, next actions, achievements, and PDF export.
- Added keyboard support, visible focus, accessible panels, status announcements, and reduced-motion handling.
- Deployed the React frontend on Vercel and the .NET API on Azure App Service.
- Added cost-free validation for core deterministic behavior and production builds.

## 9. What we learned

Structured Outputs are most effective when paired with compact, stage-specific schemas and application-side semantic validation. A valid JSON shape does not automatically guarantee a feasible roadmap, consistent risk score, or preserved learner progress.

Prompt engineering was less about adding instructions and more about removing duplication, limiting each stage to its responsibility, and making immutable constraints explicit. Safe diagnostics also mattered: stage status, elapsed time, validation results, and token usage were useful without logging prompts, learner data, or model output.

Most importantly, not every feature benefits from AI. GPT-5.6 handles planning judgment, critique, explanation, and revision. Stable calculations, persistence, resources, achievements, strategy transformations, sharing, and exports are faster, cheaper, and more predictable as deterministic logic.

## 10. Current Limitations

- Roadmaps, learner progress, strategy selection, and related journey state are currently stored in the user's browser using `localStorage`.
- Saved data persists across refreshes and browser restarts on the same browser and device.
- Journey data does not currently synchronize across browsers or devices.
- Clearing browser storage, using private browsing, changing domains, or switching devices may make saved journey data unavailable.
- PathPilot does not currently require user accounts or use cloud storage for learner journeys.
- PDF export is a human-readable document only; it cannot restore roadmap or progress state.

## 11. What's Next

- Optional account-based synchronization
- Multi-device access
- Portable journey backup and restore using structured JSON
- Cloud persistence with user-controlled privacy settings
- Improved collaboration and sharing controls

## 12. AI Usage

PathPilot uses **GPT-5.6 through the OpenAI Responses API** for a small set of judgment-heavy workflows:

- **Planner:** drafts the initial compact learning plan.
- **Critic:** evaluates feasibility, workload, prerequisite order, timeline, missing skills, and project difficulty.
- **Revision:** applies critic feedback and returns the final strict `RoadmapResponse`, including AI Coach Insights.
- **Explain Why:** provides a concise contextual explanation for one selected roadmap item using one request; results are cached locally.
- **Adaptive Replanning:** uses one revision request to update remaining work and coach guidance under changed constraints while completed items remain immutable.

The product does not present these stages as fully autonomous agents. They are explicit, orchestrated request stages with structured contracts and application validation.

The following features are **not AI-generated**: learner-memory persistence, completion tracking, Journey Dashboard calculations, achievement evaluation, Fast/Balanced/Deep strategy derivation, resource matching, PDF export, sharing summaries, and reset behavior. These run deterministically in the browser and make no OpenAI request.

## 13. Open Source

### Repository map

```text
PathPilot-AI/
├── frontend/
│   └── path_pilot_AI/          # React + Vite frontend
├── backend/
│   └── PathPilot_AI/
│       ├── PathPilot_AI.sln
│       └── PathPilot_AI_API/   # ASP.NET Core .NET 8 API
├── docs/                       # Specifications, architecture, demo, and submission docs
└── README.md                   # Project overview and setup
```

### Setup summary

Frontend:

```bash
cd frontend/path_pilot_AI
npm install
npm run dev
```

Configure `VITE_API_BASE_URL` in the frontend `.env` file.

Backend:

```bash
cd backend/PathPilot_AI/PathPilot_AI_API
dotnet restore
dotnet user-secrets set "OpenAI:ApiKey" "YOUR_API_KEY"
dotnet user-secrets set "OpenAI:Model" "gpt-5.6"
dotnet run --launch-profile http
```

Production uses Azure App Settings such as `OpenAI__ApiKey`, `OpenAI__Model`, and `AllowedOrigins__0`. Secrets are not committed to the repository. Development can use deterministic fallback data when no API key is configured; Production returns a configuration error instead of silently using mock AI.

### Production

- Frontend: https://pathpilotaihackathon.vercel.app
- Backend health: https://pathpilot-ai-api-2026-agbtbaahced0aff0.centralus-01.azurewebsites.net/health
