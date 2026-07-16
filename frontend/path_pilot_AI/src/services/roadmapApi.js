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

async function executeGeneration(learner, { fetchImpl, timeoutMs }) {
  const controller = new AbortController()
  const startedAt = Date.now()
  const timeout = setTimeout(() => controller.abort('generation-timeout'), timeoutMs)

  try {
    devLog('generation request started')
    const response = await fetchImpl(`${API_BASE_URL}/api/roadmaps/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toApiRequest(learner)),
      signal: controller.signal,
    })

    devLog(`generation server status ${response.status}`)
    if (!response.ok) throw await getResponseError(response)

    let normalized
    try {
      normalized = toRoadmapViewModel(await response.json())
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
    if (controller.signal.aborted) {
      devLog(`generation frontend timeout elapsed after ${Date.now() - startedAt}ms`)
      throw new GenerationTimeoutError()
    }
    if (error instanceof TypeError) {
      throw new GenerationApiError('We could not reach the PathPilot API. Check your connection and try again.', 'connection')
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export function generateRoadmap(learner, requestId, { fetchImpl = fetch, timeoutMs = GENERATION_TIMEOUT_MS } = {}) {
  if (generationRequests.has(requestId)) {
    devLog('duplicate request blocked')
    return generationRequests.get(requestId)
  }

  const request = executeGeneration(learner, { fetchImpl, timeoutMs })
  generationRequests.set(requestId, request)
  return request
}
