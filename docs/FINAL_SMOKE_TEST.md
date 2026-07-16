# PathPilot AI — Final Production Smoke Test

Run this checklist against Production before submission. Use a clean browser profile for routing checks and a prepared profile for persistence checks. Do not open `/processing` during cost-free testing because that route starts initial generation.

## Test record

| Field | Value |
| --- | --- |
| Tester | |
| Date and time | |
| Browser and version | |
| Operating system | |
| Frontend release/commit | |
| Overall result | [ ] PASS [ ] FAIL |

## Production endpoints

- Frontend: https://pathpilotaihackathon.vercel.app
- Backend health: https://pathpilot-ai-api-2026-agbtbaahced0aff0.centralus-01.azurewebsites.net/health

## Cost-free checks

### Frontend and health

- [ ] PASS [ ] FAIL — `GET https://pathpilotaihackathon.vercel.app` loads the landing page over HTTPS.
- [ ] PASS [ ] FAIL — The landing page has no blocking console error.
- [ ] PASS [ ] FAIL — `GET /health` returns HTTP 200.
- [ ] PASS [ ] FAIL — Health response is `{"status":"ok","service":"PathPilot API"}` and does not invoke OpenAI.

### Direct-route refresh

- [ ] PASS [ ] FAIL — Refresh `/` and confirm the landing page returns normally.
- [ ] PASS [ ] FAIL — Open and refresh `/create`; confirm the Create Journey page loads through the SPA rewrite.
- [ ] PASS [ ] FAIL — Open `/roadmap` directly in a clean browser profile; confirm the safe demo fallback or missing-roadmap handling appears without a backend request.
- [ ] PASS [ ] FAIL — Refresh a locally saved `/roadmap`; confirm the latest valid active roadmap is restored.
- [ ] PASS [ ] FAIL — Do **not** directly open or refresh `/processing` during this section.

### Production API configuration

- [ ] PASS [ ] FAIL — Inspect the production generation request URL without submitting and confirm its origin is the Azure API, not `localhost` or `127.0.0.1`.
- [ ] PASS [ ] FAIL — Search loaded production JavaScript or Network entries and confirm no request targets `http://localhost:5072`.
- [ ] PASS [ ] FAIL — No mixed-content warning appears.

### PDF export

- [ ] PASS [ ] FAIL — From a saved roadmap, select **Download PDF**.
- [ ] PASS [ ] FAIL — Button disables and shows “Preparing PDF...” during generation.
- [ ] PASS [ ] FAIL — PDF downloads without a backend or OpenAI request.
- [ ] PASS [ ] FAIL — PDF opens and includes cover, AI Coach Insights, Journey Dashboard summary, phases, projects, resources, achievements, date, and page numbers.
- [ ] PASS [ ] FAIL — PDF content matches the active strategy and saved progress.

### Strategy switching

- [ ] PASS [ ] FAIL — Balanced is canonical when no strategy override is selected.
- [ ] PASS [ ] FAIL — Fast Track visibly shortens timeline, increases intensity, and changes phase substance.
- [ ] PASS [ ] FAIL — Deep Mastery visibly expands timeline, theory, review, validation, and project rigor.
- [ ] PASS [ ] FAIL — Strategy highlight, summary metrics, timeline, projects, and resources remain consistent.
- [ ] PASS [ ] FAIL — Refresh restores the selected strategy and its latest valid roadmap.
- [ ] PASS [ ] FAIL — No backend request occurs while switching strategies.

### Local progress persistence

- [ ] PASS [ ] FAIL — Mark one unfinished skill complete.
- [ ] PASS [ ] FAIL — Mark one unfinished milestone complete.
- [ ] PASS [ ] FAIL — Dashboard percentage and completed/remaining counts update once.
- [ ] PASS [ ] FAIL — Refresh and confirm both items remain completed.
- [ ] PASS [ ] FAIL — Switch strategies and confirm completed credit remains intact.
- [ ] PASS [ ] FAIL — Undo one completion and confirm progress updates without a backend request.

### Achievements

- [ ] PASS [ ] FAIL — Completing the first item unlocks or preserves **First Step** once.
- [ ] PASS [ ] FAIL — Earned badge count and locked-badge progress are coherent.
- [ ] PASS [ ] FAIL — Refresh does not repeat an old unlock notification.
- [ ] PASS [ ] FAIL — Earned timestamps and badges remain present after strategy switching.

### Share & Export wording

- [ ] PASS [ ] FAIL — Roadmap action reads **Share & Export**.
- [ ] PASS [ ] FAIL — Panel title reads **Share & Export**.
- [ ] PASS [ ] FAIL — Actions read **Share Summary**, **Copy App Link**, **Copy Roadmap Summary**, and **Download PDF**.
- [ ] PASS [ ] FAIL — Privacy text says: “Share a summary or export a PDF. Your full roadmap and saved progress remain private on this device.”
- [ ] PASS [ ] FAIL — Privacy text says: “The copied app link opens PathPilot but does not transfer this roadmap to another browser.”
- [ ] PASS [ ] FAIL — Copied app URL contains no learner profile or serialized roadmap data.

## Single paid check: initial roadmap generation

Run this section once only. Do not submit Replan or Explain Why.

Use:

| Field | Value |
| --- | --- |
| Goal | `Become a Machine Learning Engineer` |
| Current level | `Mid-level` |
| Timeline | `9 Months (Flexible)` |
| Weekly availability | `10 hours` |
| Existing skills | `Python`, `SQL`, `Git` |
| Learning style | `Practice` |

- [ ] PASS [ ] FAIL — Clear Network log and filter by `/api/roadmaps/generate`.
- [ ] PASS [ ] FAIL — Select **Generate Roadmap** exactly once.
- [ ] PASS [ ] FAIL — Exactly one `POST /api/roadmaps/generate` is sent for the action.
- [ ] PASS [ ] FAIL — React StrictMode or rerendering does not create a duplicate POST.
- [ ] PASS [ ] FAIL — Request may remain pending beyond 120 seconds without being cancelled.
- [ ] PASS [ ] FAIL — Processing reaches 100% and displays “Finalizing your personalized roadmap...” while the API remains pending.
- [ ] PASS [ ] FAIL — No automatic frontend retry appears in Network.
- [ ] PASS [ ] FAIL — Response returns HTTP 200 before the 210-second frontend timeout.
- [ ] PASS [ ] FAIL — The response passes frontend normalization and minimum validation.
- [ ] PASS [ ] FAIL — App navigates to `/roadmap` only after the successful response.
- [ ] PASS [ ] FAIL — AI Coach Insights is present with Strengths, Biggest Challenge, Recommended Strategy, and Next Advice.
- [ ] PASS [ ] FAIL — Roadmap phases, Critic Review, projects, strategy selector, and dashboard render without a blocking error.
- [ ] PASS [ ] FAIL — Refresh `/roadmap` and confirm the generated roadmap persists.
- [ ] PASS [ ] FAIL — No stale roadmap from the previous journey replaces the new result.

Record the request outcome:

| Measurement | Result |
| --- | --- |
| Number of POST requests | |
| HTTP status | |
| Total Network duration | |
| Navigation succeeded | [ ] PASS [ ] FAIL |
| Refresh persistence succeeded | [ ] PASS [ ] FAIL |

## Optional paid checks — excluded by default

Do not perform these unless separately approved and needed for submission evidence.

- [ ] OPTIONAL — One Adaptive Replanning request
- [ ] OPTIONAL — One uncached Explain Why request

Prefer the already saved replan result and cached explanation for final recording and judging.

## Final decision

- [ ] PASS — All required cost-free checks passed and the single paid Generate check passed.
- [ ] FAIL — One or more submission-blocking checks failed.

Failure notes:

```text

```
