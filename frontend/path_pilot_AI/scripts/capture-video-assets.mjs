import {spawn} from 'node:child_process'
import {readFile, writeFile, mkdir, access} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {chromium} from 'playwright'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const frontendDirectory = path.resolve(scriptDirectory, '..')
const repositoryRoot = path.resolve(frontendDirectory, '../..')
const outputDirectory = path.join(repositoryRoot, 'video-assets', 'screenshots')
const profileDirectory = path.join(repositoryRoot, 'video-assets', '.playwright-profile')
const baseUrl = (process.env.CAPTURE_BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '')
const viewport = {width: 1920, height: 1080}
let serverProcess = null
let openAiRequestAttempted = false

const captureJourney = {
  learner: {
    goal: 'Become a Machine Learning Engineer',
    level: 'Mid-level',
    timeline: '9 Months (Flexible)',
    hours: 10,
    skills: ['Python', 'SQL', 'Git'],
    learningStyle: 'Practice',
  },
  generationId: 'capture-demo-machine-learning-engineer',
  generatedAt: '2026-07-16T12:00:00.000Z',
  source: 'api',
  roadmap: {
    goal: 'Become a Machine Learning Engineer',
    summary: 'A balanced path from Python and SQL foundations to evaluated, deployed machine-learning systems and portfolio evidence.',
    timeline: '9 Months',
    weeklyHours: 15,
    startingLevel: 'Mid-level',
    feasibilityScore: 82,
    confidenceScore: 82,
    coachSummary: {
      strengths: 'Your Python and SQL experience provides a strong base for practical model development and data workflows.',
      biggestChallenge: 'Building consistent production, evaluation, and deployment habits alongside model-development practice.',
      recommendedStrategy: 'Balanced',
      nextAdvice: 'Begin with one reproducible baseline project and document every experiment, decision, and result.',
    },
    phases: [
      {
        id: 'phase:1', title: 'Machine Learning Foundations', duration: 'Months 1–3', weeklyWorkload: '10 hours/week',
        description: 'Strengthen the mathematical, data, and experimentation foundations required for reliable model development.',
        prerequisites: ['Working Python knowledge', 'Basic SQL querying'],
        skills: ['NumPy and pandas workflows', 'Probability and statistics', 'Feature preparation', 'Model evaluation'],
        milestones: ['Build a reproducible data-preparation pipeline', 'Compare baseline classification models', 'Document evaluation trade-offs'],
        recommendedProject: {id: 'project:foundations', title: 'Customer Churn Baseline', description: 'Create and evaluate a reproducible churn-classification baseline.', type: 'Portfolio project'},
        project: {id: 'project:foundations', title: 'Customer Churn Baseline', description: 'Create and evaluate a reproducible churn-classification baseline.', type: 'Portfolio project'},
      },
      {
        id: 'phase:2', title: 'Applied Model Engineering', duration: 'Months 4–6', weeklyWorkload: '10 hours/week',
        description: 'Build stronger training, testing, tracking, and delivery practices around practical machine-learning systems.',
        prerequisites: ['Model-evaluation fundamentals', 'Reproducible Python environments'],
        skills: ['Scikit-learn pipelines', 'Experiment tracking', 'Model testing', 'API deployment'],
        milestones: ['Package a tested training pipeline', 'Track and compare experiments', 'Deploy a prediction API'],
        recommendedProject: {id: 'project:engineering', title: 'Production Prediction Service', description: 'Ship a tested model behind a documented prediction API.', type: 'Engineering project'},
        project: {id: 'project:engineering', title: 'Production Prediction Service', description: 'Ship a tested model behind a documented prediction API.', type: 'Engineering project'},
      },
      {
        id: 'phase:3', title: 'Portfolio and Role Readiness', duration: 'Months 7–9', weeklyWorkload: '10 hours/week',
        description: 'Demonstrate end-to-end judgment through monitoring, documentation, portfolio communication, and interview practice.',
        prerequisites: ['Deployed model service', 'Testing and experiment history'],
        skills: ['Model monitoring', 'Technical documentation', 'System design communication', 'ML interview practice'],
        milestones: ['Add drift and performance monitoring', 'Publish a complete technical case study', 'Complete three interview simulations'],
        recommendedProject: {id: 'project:capstone', title: 'Monitored ML Capstone', description: 'Deliver an end-to-end system with evaluation, deployment, monitoring, and documentation.', type: 'Capstone'},
        project: {id: 'project:capstone', title: 'Monitored ML Capstone', description: 'Deliver an end-to-end system with evaluation, deployment, monitoring, and documentation.', type: 'Capstone'},
      },
    ],
    criticReview: {
      riskLevel: 'Low',
      issues: ['Production practice can be deferred too late without explicit milestones.', 'Evaluation evidence must remain consistent across projects.'],
      changesMade: ['Moved deployment into Phase 2.', 'Added reproducibility, testing, monitoring, and documentation milestones.'],
      timelineAdjustments: 'Balanced nine-month sequence retained with clearer delivery checkpoints.',
      prerequisiteCorrections: 'Evaluation and reproducibility now precede deployment and monitoring.',
    },
    skillVault: [
      {label: 'Python & Data', score: 78},
      {label: 'Model Engineering', score: 64},
      {label: 'Production ML', score: 52},
    ],
    suggestedProjects: [
      {id: 'project:foundations', title: 'Customer Churn Baseline', description: 'Reproducible classification baseline.', type: 'Portfolio project'},
      {id: 'project:engineering', title: 'Production Prediction Service', description: 'Tested prediction API.', type: 'Engineering project'},
      {id: 'project:capstone', title: 'Monitored ML Capstone', description: 'Evaluated and monitored end-to-end system.', type: 'Capstone'},
    ],
    projects: [
      {id: 'project:foundations', title: 'Customer Churn Baseline', description: 'Reproducible classification baseline.', type: 'Portfolio project'},
      {id: 'project:engineering', title: 'Production Prediction Service', description: 'Tested prediction API.', type: 'Engineering project'},
      {id: 'project:capstone', title: 'Monitored ML Capstone', description: 'Evaluated and monitored end-to-end system.', type: 'Capstone'},
    ],
  },
}

async function isServerReady() {
  try {
    const response = await fetch(baseUrl, {signal: AbortSignal.timeout(1500)})
    return response.ok
  } catch {
    return false
  }
}

async function ensureServer() {
  if (await isServerReady()) {
    console.info(`[capture] Reusing application at ${baseUrl}`)
    return
  }
  if (process.env.CAPTURE_BASE_URL) throw new Error(`CAPTURE_BASE_URL is unavailable: ${baseUrl}`)

  console.info(`[capture] Starting Vite at ${baseUrl}`)
  const viteEntry = path.join(frontendDirectory, 'node_modules', 'vite', 'bin', 'vite.js')
  serverProcess = spawn(process.execPath, [viteEntry, '--host', '127.0.0.1', '--port', '4173'], {
    cwd: frontendDirectory,
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  serverProcess.stdout.on('data', (chunk) => process.stdout.write(`[vite] ${chunk}`))
  serverProcess.stderr.on('data', (chunk) => process.stderr.write(`[vite] ${chunk}`))

  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    if (await isServerReady()) return
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  throw new Error('Vite did not become ready within 30 seconds.')
}

async function stabilize(page) {
  await page.waitForLoadState('domcontentloaded')
  await page.evaluate(() => document.fonts?.ready)
  await page.waitForLoadState('networkidle', {timeout: 8_000}).catch(() => {})
  await page.waitForTimeout(1_200)
  await page.addStyleTag({content: `
    html {scroll-behavior: auto !important; scrollbar-width: none !important;}
    html::-webkit-scrollbar, body::-webkit-scrollbar, *::-webkit-scrollbar {display: none !important; width: 0 !important; height: 0 !important;}
    *, *::before, *::after {cursor: none !important; animation: none !important; transition: none !important; caret-color: transparent !important;}
  `})
  await page.mouse.move(-100, -100)
}

async function go(page, route) {
  await page.goto(`${baseUrl}${route}`, {waitUntil: 'domcontentloaded'})
  await stabilize(page)
}

async function fileExists(target) {
  try { await access(target); return true } catch { return false }
}

async function capture(page, filename, prepare, {skipExisting = false} = {}) {
  const target = path.join(outputDirectory, filename)
  if (skipExisting && await fileExists(target)) {
    console.info(`[capture] ↷ ${filename} already exists; left unchanged.`)
    return true
  }
  try {
    await prepare()
    await stabilize(page)
    const image = await page.screenshot({type: 'png', animations: 'disabled'})
    try {
      await writeFile(target, image)
    } catch (writeError) {
      const existing = await readFile(target).catch(() => null)
      if (!existing?.length) throw writeError
      console.warn(`[capture] ${filename} could not be overwritten (${writeError.message}); retained the existing non-empty capture.`)
    }
    console.info(`[capture] ✓ ${filename}`)
    return true
  } catch (error) {
    console.warn(`[capture] ✗ ${filename}: ${error.message}`)
    return false
  }
}

async function installNetworkSafety(context) {
  await context.route('**/*', async (route) => {
    const url = route.request().url()
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()
    const apiPath = parsed.pathname.toLowerCase()

    if (host === 'openai.com' || host.endsWith('.openai.com')) {
      openAiRequestAttempted = true
      console.error(`[network] BLOCKED OpenAI request: ${route.request().method()} ${url}`)
      await route.abort('blockedbyclient')
      return
    }

    if (apiPath.endsWith('/api/roadmaps/generate')) {
      console.warn(`[network] BLOCKED backend generation; fulfilled with capture-only fixture: ${route.request().method()} ${url}`)
      await route.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(captureJourney.roadmap)})
      return
    }

    if (apiPath.endsWith('/api/roadmaps/replan') || apiPath.endsWith('/api/roadmaps/explain')) {
      console.warn(`[network] BLOCKED AI-backed endpoint: ${route.request().method()} ${url}`)
      await route.abort('blockedbyclient')
      return
    }

    await route.continue()
  })
}

async function prepareCreateJourney(page) {
  await go(page, '/create')
  await page.getByLabel('Career Goal').fill('Become a Machine Learning Engineer')
  const selects = page.locator('select')
  await selects.nth(0).selectOption({label: 'Mid-level'})
  await selects.nth(1).selectOption({label: '9 Months (Flexible)'})
  await page.locator('input[type="range"]').fill('10')
  await page.getByLabel('Practice').check()
  const skillInput = page.getByLabel('Add a skill')
  await skillInput.fill('Git')
  await skillInput.press('Enter')
}

async function ensureRoadmap(page) {
  await go(page, '/roadmap')
  if (await page.getByText('NO ROADMAP FOUND').count()) {
    console.info('[capture] No existing journey in the capture profile; using the deterministic capture-only journey fixture.')
    await page.evaluate((state) => {
      sessionStorage.removeItem('pathpilotGenerationAttempt')
      sessionStorage.setItem('pathpilotRoadmap', JSON.stringify(state))
    }, captureJourney)
    await page.reload({waitUntil: 'domcontentloaded'})
    await stabilize(page)
  } else {
    console.info('[capture] Reusing the existing journey from the persistent capture profile.')
  }
  await page.getByRole('heading', {name: /Become .* Engineer/i}).first().waitFor({timeout: 10_000})
}

async function seedCaptureExplanation(page) {
  await page.evaluate(({generationId}) => {
    const cacheKey = 'pathpilotExplanationCache:v1'
    let cache = {}
    try { cache = JSON.parse(localStorage.getItem(cacheKey)) || {} } catch { cache = {} }
    const explanation = {
      explanation: 'NumPy and pandas workflows appear first because dependable data preparation supports every later modeling and evaluation task.',
      prerequisiteReason: 'They build directly on the learner’s existing Python knowledge and prepare structured inputs for model training.',
      careerImpact: 'Reliable data workflows are expected in practical machine-learning engineering and reduce errors in production pipelines.',
      expectedBenefit: 'The learner can create reproducible datasets and move into model development with clearer, testable assumptions.',
    }
    cache[`${generationId}:phase:phase:1:skill:0`] = explanation
    cache[`${generationId}:phase:1:skill:0`] = explanation
    localStorage.setItem(cacheKey, JSON.stringify(cache))
  }, {generationId: captureJourney.generationId})
}

async function addDemoProgress(page) {
  const buttons = page.getByRole('button', {name: /Mark complete/i})
  const count = await buttons.count()
  for (let index = 0; index < Math.min(5, count); index += 1) {
    await buttons.nth(0).click()
    await page.waitForTimeout(100)
  }
}

async function centerHeading(page, name) {
  const heading = page.getByRole('heading', {name}).first()
  await heading.waitFor({timeout: 10_000})
  await heading.evaluate((element) => element.scrollIntoView({block: 'start'}))
  await page.evaluate(() => window.scrollBy(0, -90))
}

async function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {shell: false, stdio: 'ignore'})
    child.on('error', reject)
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with code ${code}`)))
  })
}

async function showImageInViewport(page, sourcePath) {
  const buffer = await readFile(sourcePath)
  const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`
  await page.setContent(`<style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#f6f7fb;cursor:none}body{display:grid;place-items:center}img{width:100%;height:100%;object-fit:contain}</style><img alt="PathPilot PDF preview" src="${dataUrl}">`)
  await page.locator('img').waitFor()
}

async function capturePdfPreview(page) {
  const downloadsDirectory = path.join(repositoryRoot, 'video-assets', 'downloads')
  const pdfPath = path.join(downloadsDirectory, 'pathpilot-capture-roadmap.pdf')
  const coverPrefix = path.join(downloadsDirectory, 'pathpilot-capture-cover')
  const coverPath = `${coverPrefix}.png`
  try {
    await mkdir(downloadsDirectory, {recursive: true})
    await ensureRoadmap(page)
    const downloadPromise = page.waitForEvent('download', {timeout: 20_000})
    await page.getByRole('button', {name: 'Download roadmap PDF'}).click()
    const download = await downloadPromise
    await download.saveAs(pdfPath)
    const pdfConverter = process.env.PDFTOPPM_PATH || (process.platform === 'win32' ? null : 'pdftoppm')
    if (!pdfConverter) throw new Error('Set PDFTOPPM_PATH to a working pdftoppm executable to capture the PDF cover on Windows.')
    await runCommand(pdfConverter, ['-png', '-f', '1', '-singlefile', '-r', '150', pdfPath, coverPrefix])
    await showImageInViewport(page, coverPath)
    console.info('[capture] Generated and framed the current journey PDF cover locally; no API request was made.')
  } catch (error) {
    await ensureRoadmap(page)
    await centerHeading(page, 'Your future starts now.')
    console.warn(`[capture] PDF cover conversion was unavailable (${error.message}); captured the current journey's PDF export action instead.`)
  }
}

async function run() {
  await mkdir(outputDirectory, {recursive: true})
  await ensureServer()

  const context = await chromium.launchPersistentContext(profileDirectory, {
    headless: process.env.HEADED !== '1',
    viewport,
    screen: viewport,
    deviceScaleFactor: 1,
    acceptDownloads: true,
    colorScheme: 'light',
    reducedMotion: 'reduce',
  })
  await installNetworkSafety(context)
  const page = context.pages()[0] || await context.newPage()
  page.on('console', (message) => {
    if (message.type() === 'error') console.warn(`[browser] ${message.text()}`)
  })

  try {
    await capture(page, 'landing.png', async () => { await go(page, '/'); await page.evaluate(() => window.scrollTo(0, 0)) }, {skipExisting: true})
    await capture(page, 'create.png', async () => { await prepareCreateJourney(page); await page.evaluate(() => window.scrollTo(0, 0)) }, {skipExisting: true})

    let roadmapReady = false
    try {
      await ensureRoadmap(page)
      await addDemoProgress(page)
      roadmapReady = true
    } catch (error) {
      console.warn(`[capture] Roadmap-dependent captures will be skipped: ${error.message}`)
    }

    if (roadmapReady) {
      await capture(page, 'roadmap.png', async () => { await ensureRoadmap(page); await page.evaluate(() => window.scrollTo(0, 0)) }, {skipExisting: true})
      await capture(page, 'dashboard.png', async () => { await ensureRoadmap(page); await centerHeading(page, 'Journey Dashboard') }, {skipExisting: true})
      await capture(page, 'resources.png', async () => { await ensureRoadmap(page); await centerHeading(page, 'Trusted Learning Resources') }, {skipExisting: true})
      await capture(page, 'share.png', async () => {
        await ensureRoadmap(page)
        await page.getByRole('button', {name: 'Open Share & Export'}).click()
        await page.getByRole('dialog', {name: 'Share & Export'}).waitFor()
      }, {skipExisting: true})

      await capture(page, 'alternative.png', async () => {
        await ensureRoadmap(page)
        await centerHeading(page, 'Compare your paths')
        await page.getByText('Fast Track', {exact: true}).first().waitFor()
        await page.getByText('Balanced', {exact: true}).first().waitFor()
        await page.getByText('Deep Mastery', {exact: true}).first().waitFor()
      })

      await capture(page, 'explainwhy.png', async () => {
        await ensureRoadmap(page)
        await seedCaptureExplanation(page)
        await page.getByRole('heading', {name: 'Learning Journey Timeline'}).scrollIntoViewIfNeeded()
        await page.getByRole('button', {name: 'Why?'}).first().click()
        await page.getByRole('dialog').waitFor()
      })

      await capture(page, 'replanpanel.png', async () => {
        await ensureRoadmap(page)
        await page.getByRole('button', {name: /Replan My Journey/i}).click()
        const panel = page.getByRole('dialog')
        await panel.waitFor()
        await panel.getByLabel('Updated weekly hours').fill('6')
        await panel.getByLabel('Main difficulty encountered').selectOption({label: 'Time constraints'})
        await panel.getByLabel('Optional note').fill('Work commitments reduced my weekly study availability.')
      })
    }

    await capture(page, 'pdf.png', async () => capturePdfPreview(page), {skipExisting: true})

    await capture(page, 'processing.png', async () => {
      await go(page, '/processing')
      await page.waitForTimeout(1_700)
      await page.getByText('Planner Agent').first().waitFor()
      await page.getByText('Critic Agent').first().waitFor()
      await page.getByText('Planner Revision').first().waitFor()
    })

    const mobileBrowser = await chromium.launch({headless: process.env.HEADED !== '1'})
    const mobileContext = await mobileBrowser.newContext({
      viewport: {width: 390, height: 844},
      screen: {width: 390, height: 844},
      deviceScaleFactor: 2,
      colorScheme: 'light',
      reducedMotion: 'reduce',
    })
    await installNetworkSafety(mobileContext)
    const mobilePage = await mobileContext.newPage()
    await capture(mobilePage, 'mobile.png', async () => {
      await go(mobilePage, '/')
      await mobilePage.evaluate(() => window.scrollTo(0, 0))
    })
    await mobileContext.close()
    await mobileBrowser.close()

    if (openAiRequestAttempted) throw new Error('Capture failed because an OpenAI network request was attempted and blocked.')
  } finally {
    await context.close()
    if (serverProcess) serverProcess.kill()
  }
}

run().catch((error) => {
  console.error(`[capture] Fatal setup error: ${error.stack || error.message}`)
  if (serverProcess) serverProcess.kill()
  process.exitCode = 1
})
