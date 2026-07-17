import { devLog } from '../lib/roadmapSession.js'

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5072').replace(/\/$/, '')
export const GENERATION_TIMEOUT_MS = 210_000
const generationRequests = new Map()

export class GenerationTimeoutError extends Error {
  constructor() {
    super('Roadmap generation timed out after 210 seconds. Your learner profile is still available—please retry when ready.')
    this.name = 'GenerationTimeoutError'
  }
}

export class GenerationApiError extends Error {
  constructor(message, kind, status = null) {
    super(message)
    this.name = 'GenerationApiError'
    this.kind = kind
    this.status = status
  }
}

function toApiRequest(learner) {
  return {
    currentLevel: learner.level,
    goal: learner.goal,
    timeline: learner.timeline,
    weeklyHours: learner.hours,
    existingSkills: learner.skills,
    learningStyle: learner.learningStyle,
  }
}

function toRoadmapViewModel(response) {
  return {
    ...response,
    confidenceScore: response.feasibilityScore,
    phases: response.phases.map((phase) => ({ ...phase, project: phase.recommendedProject })),
    projects: response.suggestedProjects,
  }
}

function isValidRoadmap(roadmap) {
  return Boolean(
    roadmap &&
    typeof roadmap.goal === 'string' && roadmap.goal.trim() &&
    Number.isInteger(roadmap.feasibilityScore) &&
    roadmap.feasibilityScore >= 0 && roadmap.feasibilityScore <= 100 &&
    Array.isArray(roadmap.phases) && roadmap.phases.length > 0 &&
    roadmap.phases.every((phase) => phase?.recommendedProject && Array.isArray(phase.skills)) &&
    roadmap.criticReview && typeof roadmap.criticReview.riskLevel === 'string' &&
    roadmap.coachSummary && typeof roadmap.coachSummary.strengths === 'string' &&
    Array.isArray(roadmap.skillVault) &&
    Array.isArray(roadmap.suggestedProjects)
  )
}

async function getErrorMessage(response) {
  try {
    const problem = await response.json()
    return problem.detail || problem.title || 'The roadmap service could not process this request.'
  } catch {
    return 'The roadmap service returned an unexpected response.'
  }
}

async function getResponseError(response) {
  const detail = await getErrorMessage(response)
  if (response.status === 504) {
    return new GenerationApiError(detail || 'The AI service took too long to finish the roadmap.', 'server-timeout', 504)
  }
  if (response.status === 502) {
    return new GenerationApiError(detail || 'The AI service could not complete the roadmap.', 'upstream-failure', 502)
  }
  if (response.status === 400) {
    return new GenerationApiError(detail, 'validation', 400)
  }
  return new GenerationApiError(detail, 'server', response.status)
}

async function readProgressStream(response, emitProgress) {
  if (!response.body?.getReader) {
    throw new GenerationApiError('The roadmap progress stream was unavailable. Please try again.', 'connection')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let finalRoadmap = null

  function consumeEvent(block) {
    const lines = block.split(/\r?\n/)
    const eventName = lines.find((line) => line.startsWith('event:'))?.slice(6).trim()
    const dataText = lines.filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trimStart()).join('\n')
    if (!eventName || !dataText) return

    let data
    try {
      data = JSON.parse(dataText)
    } catch (error) {
      throw new GenerationApiError('The roadmap service sent invalid progress data.', 'validation', null, { cause: error })
    }

    emitProgress({ type: eventName, ...data })
    if (eventName === 'failed') {
      throw new GenerationApiError(data.detail || 'The AI agents could not complete the roadmap.', 'upstream-failure', 502)
    }
    if (eventName === 'completed') finalRoadmap = data
  }

  while (true) {
    const { done, value } = await reader.read()
    buffer += decoder.decode(value, { stream: !done })
    const blocks = buffer.split(/\r?\n\r?\n/)
    buffer = blocks.pop() ?? ''
    blocks.forEach(consumeEvent)
    if (done) break
  }
  if (buffer.trim()) consumeEvent(buffer)
  if (!finalRoadmap) throw new GenerationApiError('The roadmap progress stream ended before completion. Please try again.', 'connection')
  return finalRoadmap
}

async function executeGeneration(learner, { fetchImpl, timeoutMs, emitProgress, controller }) {
  const startedAt = Date.now()
  const timeout = setTimeout(() => controller.abort('generation-timeout'), timeoutMs)

  try {
    devLog('generation request started')
    const response = await fetchImpl(`${API_BASE_URL}/api/roadmaps/generate/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify(toApiRequest(learner)),
      signal: controller.signal,
    })

    devLog(`generation server status ${response.status}`)
    if (!response.ok) throw await getResponseError(response)

    const contentType = response.headers?.get?.('content-type') || ''
    const result = contentType.includes('text/event-stream')
      ? await readProgressStream(response, emitProgress)
      : await response.json()

    let normalized
    try {
      normalized = toRoadmapViewModel(result)
    } catch (error) {
      devLog('response validation failed')
      throw new Error('The roadmap service returned an invalid roadmap. Please try again.', { cause: error })
    }
    if (!isValidRoadmap(normalized)) {
      devLog('response validation failed')
      throw new Error('The roadmap service returned an invalid roadmap. Please try again.')
    }
    devLog('API response accepted')
    devLog(`generation completed in ${Date.now() - startedAt}ms`)
    return normalized
  } catch (error) {
    if (controller.signal.aborted && controller.signal.reason === 'generation-timeout') {
      devLog(`generation frontend timeout elapsed after ${Date.now() - startedAt}ms`)
      throw new GenerationTimeoutError()
    }
    if (controller.signal.aborted) throw new GenerationApiError('Roadmap generation was cancelled.', 'cancelled')
    if (error instanceof TypeError) {
      throw new GenerationApiError('We could not reach the PathPilot API. Check your connection and try again.', 'connection')
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export function generateRoadmap(learner, requestId, { fetchImpl = fetch, timeoutMs = GENERATION_TIMEOUT_MS, onProgress } = {}) {
  if (generationRequests.has(requestId)) {
    devLog('duplicate request blocked')
    const existing = generationRequests.get(requestId)
    if (onProgress) existing.listeners.add(onProgress)
    return existing.promise
  }

  const listeners = new Set(onProgress ? [onProgress] : [])
  const emitProgress = (progress) => listeners.forEach((listener) => listener(progress))
  const controller = new AbortController()
  const entry = { listeners, controller, settled: false, promise: null }
  const promise = executeGeneration(learner, { fetchImpl, timeoutMs, emitProgress, controller })
    .finally(() => { entry.settled = true })
  entry.promise = promise
  generationRequests.set(requestId, entry)
  return promise
}

export function releaseGenerationRequest(requestId, onProgress) {
  const entry = generationRequests.get(requestId)
  if (!entry) return
  entry.listeners.delete(onProgress)
  window.setTimeout(() => {
    if (!entry.settled && entry.listeners.size === 0) {
      entry.controller.abort('component-unmounted')
      generationRequests.delete(requestId)
      devLog('generation stream closed after processing page unmounted')
    }
  }, 0)
}
