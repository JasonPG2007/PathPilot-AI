# Regenerating PathPilot Remotion Screenshots

The Playwright capture script generates these 1920×1080 PNG files:

```text
landing.png
create.png
roadmap.png
dashboard.png
resources.png
pdf.png
share.png
alternative.png
explainwhy.png
processing.png
replanpanel.png
mobile.png
```

## First-time setup

From the existing frontend project:

```bash
cd frontend/path_pilot_AI
npm install
npx playwright install chromium
```

## Capture

```bash
npm run capture:video-assets
```

The script checks `http://127.0.0.1:4173`. If the frontend is not already available there, it starts Vite automatically and stops that child process after capture.

To capture a different running deployment:

```bash
CAPTURE_BASE_URL=https://pathpilotaihackathon.vercel.app npm run capture:video-assets
```

PowerShell:

```powershell
$env:CAPTURE_BASE_URL='https://pathpilotaihackathon.vercel.app'
npm run capture:video-assets
```

## Journey reuse and AI safety

- The script uses a persistent capture profile at `video-assets/.playwright-profile/`.
- If that profile already contains an active PathPilot journey, it is reused.
- If no journey exists, the script seeds a realistic, deterministic capture-only roadmap into session storage.
- It never submits Create Journey, Adaptive Replanning, or Explain Why.
- It never calls OpenAI.
- The Create Journey screenshot uses a realistic machine-learning-engineer profile but does not press Generate.
- Five visible roadmap items are completed locally to produce meaningful dashboard and achievement states.
- Alternative Roadmaps, Explain Why, and Replan panel captures reuse that same seeded journey.
- Explain Why is preloaded into the journey-specific local cache before the panel is opened.
- Processing is opened directly and its generation request is fulfilled entirely inside Playwright with the capture fixture.
- Replan fields are populated but never submitted.

## Strict network safety

- Requests to `openai.com` and every OpenAI subdomain are aborted and logged.
- `/api/roadmaps/generate` is blocked from reaching the backend and receives the deterministic capture-only fixture for the Processing shot.
- `/api/roadmaps/replan` and `/api/roadmaps/explain` are aborted and logged.
- Any attempted OpenAI-domain request makes the overall capture command fail.
- These routes and fixtures exist only in the Playwright script; normal frontend behavior is unchanged.

Delete `video-assets/.playwright-profile/` only when a completely clean capture profile is desired.

## PDF screenshot

Browser automation cannot reliably display Chromium's PDF viewer in every headless environment. The script downloads the current journey’s locally generated PDF and, when `pdftoppm` is available, converts only its first page to a temporary PNG and frames it in Playwright. This does not call the backend or OpenAI. On Windows, set `PDFTOPPM_PATH` to a working `pdftoppm.exe` to enable the cover preview. Without a converter, the script captures the current journey’s PDF export action and reports the fallback; it never substitutes a mismatched legacy roadmap.

## Capture behavior

- Viewport: 1920×1080
- Mobile viewport: 390×844 at device scale factor 2; the resulting PNG is not stretched to desktop dimensions
- Light color scheme
- Fonts and network activity are allowed to settle before capture
- Scrollbars, cursor, caret, transitions, and animations are hidden after settling
- Each screenshot is isolated; a failed shot is reported and remaining shots continue
- Roadmap-dependent shots are skipped with a clear reason if neither stored state nor the deterministic fixture can render

Set `HEADED=1` to watch the run locally:

```powershell
$env:HEADED='1'
npm run capture:video-assets
```

The Remotion asset manifest in `video/src/assetManifest.ts` points directly to these filenames.
