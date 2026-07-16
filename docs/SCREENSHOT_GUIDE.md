# PathPilot AI — Screenshot Capture Guide

Capture all images from the production deployment in Chrome using light mode. Keep one prepared roadmap in local browser storage so most screenshots can be taken without new AI requests.

**Production base URL:** https://pathpilotaihackathon.vercel.app

## 01 — Landing

- **Title:** PathPilot AI Landing Page
- **Purpose:** Establish the product vision, visual identity, AI workflow, and primary call to action.
- **Production URL:** https://pathpilotaihackathon.vercel.app/
- **Recommended browser size:** 1440 × 1000 px viewport
- **Suggested browser width:** 1440 px
- **Suggested zoom level:** 100%; use 90% only if the workflow visual or CTA is clipped.
- **What should be visible:** Header and logo, hero headline and copy, primary CTA, Watch Demo action, and Planner/Critic/Revision workflow visual.
- **Preparation:** Refresh at the top and wait for fonts and hero visuals to settle.
- **What should be hidden:** Bookmarks, DevTools, extensions, download shelf, notifications, taskbar, and unrelated tabs.
- **Login/API required:** No login; no API request.
- **AI generation required:** No.
- **Suggested filename:** `01_landing.png`
- **Suggested crop:** From top navigation through the complete hero and workflow visual; remove browser chrome unless showing the production URL intentionally.
- **Approximate aspect ratio:** 16:10 or 3:2.

## 02 — Create Journey

- **Title:** Personalized Journey Setup
- **Purpose:** Show the learner inputs and immediate live summary.
- **Production URL:** https://pathpilotaihackathon.vercel.app/create
- **Recommended browser size:** 1440 × 1050 px viewport
- **Suggested browser width:** 1440 px
- **Suggested zoom level:** 90–100%; prefer 90% if the primary button is below the fold.
- **What should be visible:** Goal, level, timeline, hours slider, skill chips, learning styles, Live Summary, and Generate Roadmap button in the two-column layout.
- **Preparation:** Use `Become a Machine Learning Engineer`, Mid-level, 9 Months (Flexible), 10 hours, Python/SQL/Git, and Practice. Do not submit.
- **What should be hidden:** Validation errors, autocomplete menus, tooltips, cursor over copy, and personal autofill suggestions.
- **Login/API required:** No login; no API request.
- **AI generation required:** No.
- **Suggested filename:** `02_create_journey.png`
- **Suggested crop:** Include the full form and Live Summary with equal outer margins; trim empty space below the button.
- **Approximate aspect ratio:** 4:3 or 16:10.

## 03 — Processing

- **Title:** Planner → Critic → Revision Workflow
- **Purpose:** Visualize the staged AI orchestration used for initial generation.
- **Production URL:** https://pathpilotaihackathon.vercel.app/processing
- **Recommended browser size:** 1440 × 900 px viewport
- **Suggested browser width:** 1440 px
- **Suggested zoom level:** 100%.
- **What should be visible:** Processing headline, progress, Planner, Critic, Revision, connectors, and distinct active/completed/waiting states. Prefer Planner complete with Critic or Revision active.
- **Preparation:** Start one approved Generate request from the prepared form and capture during the animation. A frame from the final video is acceptable.
- **What should be hidden:** DevTools, Network details, timeout/error UI, Retry, API payloads, and diagnostic data.
- **Login/API required:** No login; normal Generate initiates the backend request.
- **AI generation required:** Yes for a genuine production capture; do not make extra requests for retakes.
- **Suggested filename:** `03_processing.png`
- **Suggested crop:** Center the hero and entire workflow panel, retaining progress and all three cards.
- **Approximate aspect ratio:** 16:9.

## 04 — Roadmap Overview

- **Title:** Personalized Roadmap and AI Coach
- **Purpose:** Present the generated experience and actionable learner status.
- **Production URL:** https://pathpilotaihackathon.vercel.app/roadmap
- **Recommended browser size:** 1440 × 1200 px viewport
- **Suggested browser width:** 1440 px
- **Suggested zoom level:** 90%.
- **What should be visible:** Goal and summary metrics, feasibility ring, AI Coach Insights, and Journey Dashboard with progress, current phase, estimated finish, and next action.
- **Preparation:** Restore a valid roadmap with partial progress. Select Balanced unless another strategy is central to the story.
- **What should be hidden:** Open panels, toasts, loading indicators, errors, and personally identifying notes.
- **Login/API required:** No login; no API request with saved local state.
- **AI generation required:** A roadmap must already exist, but no generation is needed during capture.
- **Suggested filename:** `04_roadmap_overview.png`
- **Suggested crop:** Begin at the roadmap header and end after the complete Journey Dashboard; do not cut a card row.
- **Approximate aspect ratio:** 6:5 or 4:3.

## 05 — Alternative Roadmaps

- **Title:** Compare Your Paths
- **Purpose:** Show trade-offs among Fast Track, Balanced, and Deep Mastery.
- **Production URL:** https://pathpilotaihackathon.vercel.app/roadmap
- **Recommended browser size:** 1440 × 900 px viewport
- **Suggested browser width:** 1440 px
- **Suggested zoom level:** 90–100%.
- **What should be visible:** All three cards with timeline, workload, risk, confidence, trade-off text, and a clear active strategy.
- **Preparation:** Select Balanced for the recommended state and verify highlight, metrics, and visible roadmap agree.
- **What should be hidden:** Replan or explanation panels, stale summaries, unrelated phases, and tooltips.
- **Login/API required:** No login; no API request.
- **AI generation required:** No during capture; variants derive from saved state.
- **Suggested filename:** `05_alternative_roadmaps.png`
- **Suggested crop:** Frame the heading and all three complete cards with balanced margins.
- **Approximate aspect ratio:** 16:9 or 3:2.

## 06 — Explain Why

- **Title:** Explainable Recommendation
- **Purpose:** Show why a selected roadmap item appears.
- **Production URL:** https://pathpilotaihackathon.vercel.app/roadmap
- **Recommended browser size:** 1440 × 900 px viewport
- **Suggested browser width:** 1440 px
- **Suggested zoom level:** 100%.
- **What should be visible:** Relevant phase behind the open panel, selected item, explanation, prerequisite reason, career impact, expected benefit, and close control.
- **Preparation:** Use the cached first Phase 1 skill (`phase:1:skill:0`) when available and verify no new request occurs.
- **What should be hidden:** Spinner, error/Retry state, Network panel, other modals, and excessively long titles.
- **Login/API required:** No login; no API request when cached.
- **AI generation required:** No during capture; explanation must already be cached.
- **Suggested filename:** `06_explain_why.png`
- **Suggested crop:** Keep the full panel and enough phase context to show where **Why?** was selected.
- **Approximate aspect ratio:** 16:9.

## 07 — Dashboard and Achievements

- **Title:** Progress Dashboard and Achievements
- **Purpose:** Show the roadmap as a persistent, motivating journey.
- **Production URL:** https://pathpilotaihackathon.vercel.app/roadmap
- **Recommended browser size:** 1440 × 1000 px viewport
- **Suggested browser width:** 1440 px
- **Suggested zoom level:** 90–100%.
- **What should be visible:** Progress, completed/remaining counts, current phase, strategy, estimated finish, next action, earned count, earned badges, locked progress, and Next Achievement.
- **Preparation:** Use meaningful partial progress with First Step and at least one additional badge earned.
- **What should be hidden:** Unlock toast covering content, reset confirmation, empty state, and unrelated sections.
- **Login/API required:** No login; no API request.
- **AI generation required:** No during capture.
- **Suggested filename:** `07_dashboard.png`
- **Suggested crop:** Include the complete Dashboard and first full Achievements row without cutting shadows.
- **Approximate aspect ratio:** 4:3 or 3:2.

## 08 — Trusted Resources

- **Title:** Trusted Learning Resources
- **Purpose:** Demonstrate deterministic grounding in reputable providers.
- **Production URL:** https://pathpilotaihackathon.vercel.app/roadmap
- **Recommended browser size:** 1440 × 900 px viewport
- **Suggested browser width:** 1440 px
- **Suggested zoom level:** 100%.
- **What should be visible:** Resource title, provider, type, estimated time, Free/Paid badge, match label, reason, and external-link action for two or three resources.
- **Preparation:** Choose a phase with recognizable providers such as Microsoft Learn, Kaggle, Google Developers, Fast.ai, or MIT OpenCourseWare.
- **What should be hidden:** Link-preview bubble, broken resources, open panels, and provider tabs.
- **Login/API required:** No login; no API request.
- **AI generation required:** No; matching is deterministic.
- **Suggested filename:** `08_resources.png`
- **Suggested crop:** Include the section heading and complete cards; retain the phase title for in-phase resources.
- **Approximate aspect ratio:** 16:9 or 3:2.

## 09 — Adaptive Replanning

- **Title:** Adaptive Replanning
- **Purpose:** Show changed constraints and preservation of completed progress.
- **Production URL:** https://pathpilotaihackathon.vercel.app/roadmap
- **Recommended browser size:** 1440 × 900 px viewport
- **Suggested browser width:** 1440 px
- **Suggested zoom level:** 100%.
- **What should be visible:** Open Replan panel with hours, exact strategy timeline, completed context, difficulty, note, and submit action; alternatively show the saved Journey Replanned summary beside a completed item.
- **Preparation:** Use an already saved successful replan. Open without submitting, or restore its summary after refresh. Confirm the selected strategy owns it.
- **What should be hidden:** Loading/error state, private notes, another strategy’s summary, and Network details.
- **Login/API required:** No login; no request to open or restore saved state.
- **AI generation required:** No during capture; do not submit a paid replan.
- **Suggested filename:** `09_replan.png`
- **Suggested crop:** Keep the entire panel and narrow roadmap context, or frame the summary with preserved progress.
- **Approximate aspect ratio:** 16:9.

## 10 — Professional PDF

- **Title:** Professional Roadmap PDF Export
- **Purpose:** Show a structured, multi-page document rather than a webpage screenshot.
- **Production URL:** Generated locally from https://pathpilotaihackathon.vercel.app/roadmap
- **Recommended browser size:** 1440 × 1000 px PDF viewer
- **Suggested browser width:** 1440 px
- **Suggested zoom level:** Fit to page or 80–90%.
- **What should be visible:** Full cover with branding, goal, strategy, timeline, weekly availability, feasibility, and date; optional thumbnails may suggest multiple pages.
- **Preparation:** Generate from final saved state and inspect every page. Use only the generic demo profile.
- **What should be hidden:** Local path, download shelf, personal filename, unrelated tabs, and OS controls.
- **Login/API required:** No login; no API request.
- **AI generation required:** No during capture.
- **Suggested filename:** `10_pdf.png`
- **Suggested crop:** Show the complete page with only a minimal neutral viewer frame.
- **Approximate aspect ratio:** 4:3 capture with a portrait A4/Letter page.

## 11 — Share & Export

- **Title:** Privacy-Conscious Share & Export
- **Purpose:** Present sharing actions and honest local-persistence messaging.
- **Production URL:** https://pathpilotaihackathon.vercel.app/roadmap
- **Recommended browser size:** 1440 × 900 px viewport
- **Suggested browser width:** 1440 px
- **Suggested zoom level:** 100%.
- **What should be visible:** Dialog title, roadmap title, strategy, completion, Share Summary, Copy App Link, Copy Roadmap Summary, Download PDF, and both privacy statements.
- **Preparation:** Open from saved state. Use the neutral state or capture “Summary copied” as a second variation.
- **What should be hidden:** Native OS share sheet, clipboard manager, permission prompt, personal URL, and unrelated toast.
- **Login/API required:** No login; no API request.
- **AI generation required:** No during capture.
- **Suggested filename:** `11_share.png`
- **Suggested crop:** Center the complete dialog with a softly visible roadmap background and room for its shadow.
- **Approximate aspect ratio:** 16:9.

## 12 — Mobile Experience

- **Title:** Responsive Mobile Roadmap
- **Purpose:** Demonstrate coherent use on a narrow screen.
- **Production URL:** https://pathpilotaihackathon.vercel.app/roadmap
- **Recommended browser size:** 390 × 844 px viewport, ideally captured at 2× scale
- **Suggested browser width:** 390 px; acceptable range 375–430 px.
- **Suggested zoom level:** 100%.
- **What should be visible:** Mobile navigation, goal or AI Coach Insights, one complete dashboard/progress section, and a clear action. The mobile Create Journey form is an acceptable alternate.
- **Preparation:** Set Chrome responsive mode, then hide DevTools for the final capture if possible. Choose a scroll position with complete cards.
- **What should be hidden:** Emulation toolbar, touch overlay, debug dimensions, OS notifications, and any horizontal overflow.
- **Login/API required:** No login; no API request with saved state.
- **AI generation required:** No during capture.
- **Suggested filename:** `12_mobile.png`
- **Suggested crop:** Exactly the mobile viewport with no desktop whitespace and intact page padding.
- **Approximate aspect ratio:** 9:19.5.

## Photography Tips

- Hide bookmarks.
- Hide browser extensions.
- Use light mode.
- Use 125% browser zoom if text becomes clearer, after checking for clipping and overflow.
- Hide the OS taskbar if possible.
- Use Chrome.
- Use the production deployment.
- Wait until fonts finish loading.
- Avoid capturing loading states, except for the intentional Processing screenshot.
- Keep the learner profile, strategy, and progress consistent across related images.
- Save as PNG for sharp UI text.
- Check every capture at 100% for clipped shadows, blurred text, personal data, and cursor placement.
- Capture a wider master image before making README- or Devpost-specific crops.
