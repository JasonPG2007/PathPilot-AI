# PathPilot AI — Final Recording Checklist

Use this checklist for the final hackathon capture. Record at 1080p or higher in a 16:9 frame. Make only one paid initial-generation request during the final session.

## Production URLs

- Frontend: https://pathpilotaihackathon.vercel.app
- Backend health: https://pathpilot-ai-api-2026-agbtbaahced0aff0.centralus-01.azurewebsites.net/health

- [ ] PASS [ ] FAIL — Frontend URL opens over HTTPS.
- [ ] PASS [ ] FAIL — Health URL returns HTTP 200 with `{"status":"ok","service":"PathPilot API"}`.

## Browser preparation

- [ ] PASS [ ] FAIL — Use a current Chrome or Edge desktop window at 100% zoom.
- [ ] PASS [ ] FAIL — Set the viewport to 1920×1080 or 1440×900 with no horizontal overflow.
- [ ] PASS [ ] FAIL — Hide bookmarks, downloads, notifications, password prompts, and personal browser data.
- [ ] PASS [ ] FAIL — Close DevTools before recording unless capturing the single Generate Network request.
- [ ] PASS [ ] FAIL — Confirm the address bar shows the production Vercel origin, never localhost.
- [ ] PASS [ ] FAIL — Use **Create New Journey** once before the clean form shot.
- [ ] PASS [ ] FAIL — Keep a separate backup browser profile or tab containing the final saved roadmap, cached explanation, saved replan result, achievements, and progress.
- [ ] PASS [ ] FAIL — Disable extensions that alter page styling or inject overlays.
- [ ] PASS [ ] FAIL — Disable automatic browser translation.

## Exact learner profile

Use these values consistently in the form, narration, cached state, and backup capture:

| Field | Value |
| --- | --- |
| Goal | `Become a Machine Learning Engineer` |
| Current level | `Mid-level` |
| Target timeline | `9 Months (Flexible)` |
| Weekly availability | `10 hours` |
| Existing skills | `Python`, `SQL`, `Git` |
| Learning style | `Practice` |

- [ ] PASS [ ] FAIL — The goal has no typo or trailing whitespace.
- [ ] PASS [ ] FAIL — All three skill chips are visible before submission.
- [ ] PASS [ ] FAIL — The Live Summary matches the profile.

## Cost-free scenes to record first

Record these from an already saved roadmap or deterministic browser state. They require no new API request:

- [ ] PASS [ ] FAIL — Landing page and **Start Journey** CTA.
- [ ] PASS [ ] FAIL — Completed Create Journey form before submission.
- [ ] PASS [ ] FAIL — Roadmap header and AI Coach Insights from saved state.
- [ ] PASS [ ] FAIL — Journey Dashboard, progress, current phase, next action, and achievements.
- [ ] PASS [ ] FAIL — Fast Track, Balanced, and Deep Mastery switching.
- [ ] PASS [ ] FAIL — Skill and milestone completion, undo, refresh, and restored progress.
- [ ] PASS [ ] FAIL — Trusted Resource cards and external-link affordances; do not open provider sites unless needed.
- [ ] PASS [ ] FAIL — Cached Explain Why panel.
- [ ] PASS [ ] FAIL — Already saved Adaptive Replanning result and Journey Replanned summary.
- [ ] PASS [ ] FAIL — PDF export and Share & Export panel.

## Single final Generate recording

Perform this only after every cost-free scene and backup is secured.

- [ ] PASS [ ] FAIL — Open DevTools Network only if needed to prove request count; filter by `generate`.
- [ ] PASS [ ] FAIL — Start from the exact profile above.
- [ ] PASS [ ] FAIL — Select **Generate Roadmap** exactly once.
- [ ] PASS [ ] FAIL — Confirm exactly one `POST /api/roadmaps/generate` appears.
- [ ] PASS [ ] FAIL — Do not double-click, refresh, press Back, or use Retry while it is pending.
- [ ] PASS [ ] FAIL — Capture Planner → Critic → Revision and the finalizing state.
- [ ] PASS [ ] FAIL — Allow up to 210 seconds for the frontend request.
- [ ] PASS [ ] FAIL — Confirm HTTP 200 and automatic navigation to `/roadmap`.
- [ ] PASS [ ] FAIL — Confirm AI Coach Insights and the complete roadmap render.
- [ ] PASS [ ] FAIL — Refresh once and confirm the successful roadmap remains active.

## Editing the Processing wait

- [ ] PASS [ ] FAIL — Preserve the beginning and completion of Planner, Critic, and Revision; do not remove a stage.
- [ ] PASS [ ] FAIL — Keep the visible “Finalizing your personalized roadmap...” state.
- [ ] PASS [ ] FAIL — Remove dead waiting time with a clean cut, cross-dissolve, or moderate speed ramp.
- [ ] PASS [ ] FAIL — Add a small “Processing time shortened” caption if the edit could otherwise imply real-time completion.
- [ ] PASS [ ] FAIL — Do not claim a faster response time than the captured request.
- [ ] PASS [ ] FAIL — Keep the edited Processing section near 20 seconds.

## Cached Explain Why shot

Use the **first skill in Phase 1**, expected stable identity `phase:1:skill:0` (typically the Python foundations item for this profile).

- [ ] PASS [ ] FAIL — Open it once before recording and confirm the explanation is cached for the active generation ID.
- [ ] PASS [ ] FAIL — During the final take, open **Why?** for that same item without a new Network request.
- [ ] PASS [ ] FAIL — Show explanation, prerequisite reason, career impact, and expected benefit.
- [ ] PASS [ ] FAIL — Keep the roadmap visible and close the panel with its normal control.

If the generated item IDs differ, use the actual first Phase 1 skill’s stable ID and record that ID in the production notes before filming.

## Saved Adaptive Replanning shot

Do not submit a paid replan during the final recording.

- [ ] PASS [ ] FAIL — Prepare and retain a successful Balanced replan in advance.
- [ ] PASS [ ] FAIL — Saved result shows `9 Months`, `5 hours/week`, `Medium` risk, and `68%` confidence, or another clearly documented valid result.
- [ ] PASS [ ] FAIL — The selected strategy is Balanced and its Journey Replanned summary is visible.
- [ ] PASS [ ] FAIL — At least one completed Phase 1 item remains visibly completed.
- [ ] PASS [ ] FAIL — Record opening the Replan panel and its fields separately without submitting.
- [ ] PASS [ ] FAIL — Cut to the already saved result and narrate that only unfinished work changed.
- [ ] PASS [ ] FAIL — Do not imply the cached result was produced live in that take.

## PDF and Share & Export shots

- [ ] PASS [ ] FAIL — Select **Download PDF** once and capture the disabled “Preparing PDF...” state.
- [ ] PASS [ ] FAIL — Open the generated PDF and show its cover, AI Coach Insights, dashboard summary, one phase, resources, achievements, and page footer.
- [ ] PASS [ ] FAIL — Verify the PDF contains no unintended personal or browser data.
- [ ] PASS [ ] FAIL — Open **Share & Export** near the roadmap actions.
- [ ] PASS [ ] FAIL — Show **Share Summary**, **Copy App Link**, **Copy Roadmap Summary**, and **Download PDF**.
- [ ] PASS [ ] FAIL — Capture the privacy notice explaining that the roadmap and progress remain on this device.
- [ ] PASS [ ] FAIL — Capture one non-blocking “Summary copied” or “Link copied” status.
- [ ] PASS [ ] FAIL — Do not imply that Copy App Link transfers the saved roadmap.

## Audio and screen-recording checks

- [ ] PASS [ ] FAIL — Microphone input is the intended device and does not clip.
- [ ] PASS [ ] FAIL — Record a 10-second voice test and check noise, echo, plosives, and keyboard sound.
- [ ] PASS [ ] FAIL — Narration is intelligible at normal laptop and headphone volume.
- [ ] PASS [ ] FAIL — System notification sounds and communication apps are muted.
- [ ] PASS [ ] FAIL — Cursor, text, badges, and focus states are readable in the test capture.
- [ ] PASS [ ] FAIL — Frame rate is stable and no recording controls overlap the product.
- [ ] PASS [ ] FAIL — The final narration is under three minutes.
- [ ] PASS [ ] FAIL — The recording contains no API key, prompt, request body, personal path, or full model response.

## Fallback if final Generate fails

- [ ] PASS [ ] FAIL — Do not press Retry repeatedly; preserve the failed take for diagnosis.
- [ ] PASS [ ] FAIL — Record the form and early Processing states separately if they are clean.
- [ ] PASS [ ] FAIL — Use the backup saved roadmap for all post-generation scenes.
- [ ] PASS [ ] FAIL — In narration, say: “The hosted workflow can take longer under load, so I’ll continue with a previously generated result from the same validated Planner, Critic, and Revision flow.”
- [ ] PASS [ ] FAIL — Do not present a cached result as the response to the failed request.
- [ ] PASS [ ] FAIL — Attempt another paid Generate only in a separate approved session, never automatically.

## Final files and backup

Recommended names:

```text
pathpilot-build-week-demo-master-YYYY-MM-DD.mp4
pathpilot-build-week-demo-final-1080p-YYYY-MM-DD.mp4
pathpilot-build-week-voiceover-YYYY-MM-DD.wav
pathpilot-build-week-pdf-sample-YYYY-MM-DD.pdf
```

- [ ] PASS [ ] FAIL — Keep the untouched master recording separate from the edited export.
- [ ] PASS [ ] FAIL — Watch the final export from start to finish with headphones.
- [ ] PASS [ ] FAIL — Confirm duration, resolution, audio sync, and readable UI text.
- [ ] PASS [ ] FAIL — Create one local backup and one private cloud or external-drive backup.
- [ ] PASS [ ] FAIL — Verify both backup files open and report the expected duration.
- [ ] PASS [ ] FAIL — Store the final PDF sample and narration script beside the video deliverables.

