const ROADMAP_KEY = 'pathpilotRoadmap'
const ATTEMPT_KEY = 'pathpilotGenerationAttempt'

function devLog(message) {
  if (import.meta.env.DEV) console.info(`[PathPilot] ${message}`)
}

export function beginGenerationAttempt(id) {
  sessionStorage.removeItem(ROADMAP_KEY)
  sessionStorage.setItem(ATTEMPT_KEY, JSON.stringify({ id, status: 'active' }))
  devLog('stale roadmap cleared')
}

export function failGenerationAttempt(id) {
  sessionStorage.removeItem(ROADMAP_KEY)
  sessionStorage.setItem(ATTEMPT_KEY, JSON.stringify({ id, status: 'failed' }))
}

export function storeGeneratedRoadmap({ learner, roadmap, generationId, generatedAt }) {
  const storedState = {
    learner,
    roadmap,
    generationId,
    source: 'api',
    generatedAt: generatedAt ?? new Date().toISOString(),
  }
  sessionStorage.setItem(ROADMAP_KEY, JSON.stringify(storedState))
  sessionStorage.removeItem(ATTEMPT_KEY)
  devLog('roadmap stored')
  return storedState
}

export function storeReplannedRoadmap({ learner, roadmap, generationId, generatedAt, replanSummary, replannedAt = new Date().toISOString(), strategy }) {
  const storedState = {
    learner,
    roadmap,
    generationId,
    source: 'replan',
    generatedAt,
    replannedAt,
    replanSummary,
    strategy,
    updatedWeeklyHours: roadmap.weeklyHours,
    updatedTimeline: roadmap.timeline,
    updatedRiskLevel: roadmap.criticReview.riskLevel,
    updatedFeasibilityScore: roadmap.feasibilityScore,
  }
  sessionStorage.setItem(ROADMAP_KEY, JSON.stringify(storedState))
  sessionStorage.removeItem(ATTEMPT_KEY)
  devLog('replanned roadmap stored')
  return storedState
}

function isValidRoadmapState(state) {
  const commonFieldsAreValid = Boolean(
    state &&
    (state.source === 'api' || state.source === 'replan') &&
    state.generatedAt &&
    state.learner &&
    state.roadmap &&
    Array.isArray(state.roadmap.phases),
  )
  if (!commonFieldsAreValid) return false
  if (state.source === 'replan') {
    return Boolean(state.replannedAt && state.replanSummary)
  }
  return true
}

function getVersionTime(state) {
  const timestamp = state.source === 'replan' ? state.replannedAt : state.generatedAt
  const parsed = Date.parse(timestamp)
  return Number.isNaN(parsed) ? 0 : parsed
}

export function getMostRecentRoadmap(...states) {
  return states.filter(isValidRoadmapState).sort((left, right) => getVersionTime(right) - getVersionTime(left))[0] ?? null
}

export function getStoredRoadmap() {
  try {
    const stored = sessionStorage.getItem(ROADMAP_KEY)
    const parsed = stored ? JSON.parse(stored) : null
    return isValidRoadmapState(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function hasActiveGenerationAttempt() {
  return sessionStorage.getItem(ATTEMPT_KEY) !== null
}

export { devLog }
