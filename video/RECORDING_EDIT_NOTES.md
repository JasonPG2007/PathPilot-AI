# PathPilot recording review and edit decisions

All four recordings in `video-assets/recordings/` were reviewed at regular intervals and again around feature transitions. Times below are source-video timecodes, not final-timeline timecodes.

## `2026-07-17 22-45-14.mp4` — 00:51.017

| Source range | Feature | Decision |
| --- | --- | --- |
| 00:00–00:17.5 | Create Journey form, constraint changes, live summary | Keep 00:00.5–00:14.5. It is the cleanest live form interaction. |
| 00:17.5–00:42.5 | Processing opens; mostly waiting state | Remove. The next recording has the complete three-stage progression. |
| 00:42.5–00:49.5 | Planner completes and Critic becomes active | Optional backup only. Useful if the longer generation recording is replaced. |
| 00:49.5–00:51.017 | Returns to Create Journey | Remove; it breaks story continuity. |

## `2026-07-17 22-46-12.mp4` — 02:40.000

| Source range | Feature | Decision |
| --- | --- | --- |
| 00:00–00:16 | Create Journey form | Remove as a duplicate of the cleaner first recording. |
| 00:16–00:39 | Planner stage | Keep inside the accelerated 00:20–01:37 workflow montage. |
| 00:39–01:08 | Critic stage | Keep inside the accelerated workflow montage. |
| 01:08–01:37.5 | Revision stage | Keep inside the accelerated workflow montage. |
| 01:37.5–01:47.5 | Roadmap reveal, coach/dashboard, first roadmap movement | Keep at near-real speed. This is the strongest generated-result reveal. |
| 01:47.5–01:56.5 | Strategy and phase scrolling | Remove from the final cut; the `alternative.png` screenshot is clearer. |
| 01:56.5–02:08 | Explain Why panel opens and resolves | Keep. It shows the interaction and the explanation in context. |
| 02:08–02:29.5 | Coach, achievements, phases, and resources scrolling | Use only as backup; dedicated screenshots are easier to read. |
| 02:29.5–02:32 | External resource site | Remove; leaving PathPilot weakens the product story. |
| 02:32–02:40 | Return to roadmap/footer | Remove as redundant. |

## `2026-07-17 22-50-03.mp4` — 01:13.850

| Source range | Feature | Decision |
| --- | --- | --- |
| 00:00–00:12.5 | Strategy/resources area and footer | Remove; static strategy and resource shots are stronger. |
| 00:12.5–00:30 | Replan panel opens; weekly availability changes to six hours | Keep, accelerated to 1.5×. It clearly communicates changed circumstances. |
| 00:30–00:44.5 | Replan request waiting | Remove. No information changes during this interval. |
| 00:44.5–01:00 | Revised roadmap and Journey Replanned summary | Keep 00:45–00:54.5, accelerated to 1.5×. |
| 01:00–01:10 | Strategy switching after replan | Remove from this scene; the dedicated strategy scene is clearer. |
| 01:10–01:13.850 | Roadmap scroll | Remove as an incomplete transition. |

## `2026-07-17 22-51-38.mp4` — 00:46.200

| Source range | Feature | Decision |
| --- | --- | --- |
| 00:00–00:06 | Resources and footer actions | Remove; the resources screenshot is cleaner. |
| 00:06–00:17.5 | External Microsoft/MDN resource pages | Remove; they are off-product and visually inconsistent. |
| 00:17.5–00:21 | Download PDF action | Keep. |
| 00:21–00:31 | Multi-page PDF preview | Keep with the action, accelerated to 1.5×. |
| 00:31–00:33 | Return to roadmap | Keep only as the natural bridge into Share. |
| 00:33–00:39 | Share & Export modal and copy action | Keep at real speed. |
| 00:39–00:46.200 | Clipboard/browser feedback and idle footer | Remove after the useful modal action completes. |

## Final edit timeline — 02:15

| Final time | Duration | Scene | Media choice |
| --- | ---: | --- | --- |
| 00:00–00:06 | 6s | Hook | Motion typography |
| 00:06–00:14 | 8s | Landing | `screenshots/landing.png` |
| 00:14–00:28 | 14s | Create Journey | Recording 1, 00:00.5–00:14.5 |
| 00:28–00:44 | 16s | Planner → Critic → Revision | Recording 2, 00:17–01:37 at 5× |
| 00:44–00:54 | 10s | Roadmap and AI Coach reveal | Recording 2, 01:37.5–01:48 at 1.05× |
| 00:54–01:04 | 10s | Alternative strategies | `screenshots/alternative.png` |
| 01:04–01:15 | 11s | Explain Why | Recording 2, 01:56.5–02:07.5 |
| 01:15–01:33 | 18s | Adaptive Replanning | Recording 3, two trims with the wait removed |
| 01:33–01:43 | 10s | Dashboard and achievements | `screenshots/dashboard.png` |
| 01:43–01:52 | 9s | Trusted resources | `screenshots/resources.png` |
| 01:52–02:08 | 16s | PDF and Share & Export | Recording 4, two trims |
| 02:08–02:15 | 7s | Ending | Motion typography |

The composition is 4,050 frames at 30 FPS. Long API waits, duplicate form footage, off-product browser pages, idle cursor time, and repeated roadmap scrolling are excluded.
