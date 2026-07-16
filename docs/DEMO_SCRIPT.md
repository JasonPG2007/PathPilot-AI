# PathPilot AI — 3-Minute Demo Script

**Target runtime:** 2:55  
**Recording note:** Preload a realistic learner profile and keep a generated roadmap available as a fallback. The AI stages are sequential workflow roles, not fully autonomous agents.

## 0:00–0:12 — Opening

**Screen/action:** Show the deployed landing page, then select **Start Journey**.

**Narration:** “Learning plans are often generic and become outdated as soon as a learner’s schedule changes. PathPilot AI is an adaptive learning coach that creates a personalized roadmap, explains its recommendations, and revises future work without erasing completed progress.”

**Transition:** Cut directly to the completed learner form.

## 0:12–0:27 — Learner profile

**Screen/action:** Briefly show the goal, current level, timeline, weekly hours, skills, and learning style. Select **Generate Roadmap**.

**Narration:** “I’ll ask PathPilot for a machine-learning-engineer journey based on this learner’s starting level, available time, existing skills, and preferred learning style.”

**Transition:** Follow the route into Processing.

## 0:27–0:47 — Planner, Critic, Revision

**Screen/action:** Show the staged processing animation: Planner, Critic, then Revision.

**Narration:** “One request runs three explicit stages. The Planner drafts the learning path. The Critic checks feasibility, workload, prerequisite order, timeline, missing skills, and project difficulty. Revision then applies that feedback. Strict structured output keeps the final response aligned with the application’s validated roadmap schema.”

**Editing:** This is the main section to speed up. Compress waiting while preserving each named stage and its completed state.

**Slow-API fallback narration:** “The production request can take longer on hosted infrastructure, so I’ll cut to a previously generated response from the same validated workflow while processing finishes.”

**Transition:** Cut on the completion state to the roadmap header.

## 0:47–1:06 — Coach insights and dashboard

**Screen/action:** Show the roadmap header, **AI Coach Insights**, and Journey Dashboard. Point to progress, current phase, next action, risk, confidence, and achievements.

**Narration:** “The result begins with concise AI Coach Insights: strengths, the biggest challenge, a recommended strategy, and next advice. The local dashboard turns the plan into an active journey with progress, current phase, next action, estimated finish, risk, confidence, and deterministic achievements.”

**Transition:** Scroll to strategy comparison.

## 1:06–1:28 — Alternative strategies

**Screen/action:** Switch from **Balanced** to **Fast Track**, then **Deep Mastery**, and back to **Balanced**. Show metrics and phase content changing.

**Narration:** “Learners can compare three genuinely different approaches. Fast Track prioritizes minimum viable job readiness, Balanced trades off speed and depth, and Deep Mastery adds stronger theory and validation. These alternatives are derived locally, so switching is immediate and preserves stable progress identities.”

**Transition:** Continue into one phase card.

## 1:28–1:48 — Explainability and trusted resources

**Screen/action:** Open **Why?** beside a skill or milestone, show the explanation panel, close it, then reveal Recommended Resources.

**Narration:** “Recommendations are explainable in context: why an item appears, its prerequisite role, career impact, and expected benefit. Each phase is also grounded in a deterministic catalog of trusted learning resources, with clear providers and external links rather than invented citations.”

**Editing:** Use a cached explanation if available; do not wait through a network call in the final video.

**Transition:** Mark one visible item complete.

## 1:48–2:02 — Progress integrity

**Screen/action:** Select **Mark complete** and show the dashboard or achievement state update.

**Narration:** “Progress persists locally and can be undone. Most importantly, completed skills and milestones are immutable during adaptive revision: they keep their identity, text, phase, and earned credit.”

**Transition:** Open **Replan My Journey**.

## 2:02–2:27 — Adaptive Replanning

**Screen/action:** Change weekly hours or timeline, add a difficulty, submit, then show the Journey Replanned summary and preserved completion.

**Narration:** “When circumstances change, Adaptive Replanning uses one focused revision call instead of rerunning the initial three-stage workflow. It updates only remaining work, workload, timeline, risk, and coach guidance while strict validation protects every completed item.”

**Editing:** Pre-record or cache the successful replan result. Speed up the request wait and retain the submission and final summary.

**Slow-API fallback narration:** “While the hosted revision completes, here is the validated result from this same journey: the new constraints are applied, and completed work remains credited.”

**Transition:** Scroll to resources and roadmap actions.

## 2:27–2:43 — Resources, achievements, and export

**Screen/action:** Briefly show trusted resources and earned badges, then select **Download PDF** and show the prepared PDF preview or saved document.

**Narration:** “Trusted resources make the next learning step actionable, while achievements reward meaningful progress. A professional multi-page PDF exports the coach summary, dashboard, phases, projects, and recommended resources.”

**Transition:** Return to the landing or roadmap hero with the production URL visible.

## 2:43–2:55 — Deployment and close

**Screen/action:** Show the deployed app URL, then a clean final PathPilot screen.

**Narration:** “PathPilot’s React frontend runs on Vercel, with its .NET 8 API on Azure App Service. PathPilot AI turns a one-time learning plan into an explainable, progress-aware journey that can adapt as the learner does.”

**Final closing statement:** “PathPilot AI: plan with rigor, learn with context, and adapt without losing progress.”

