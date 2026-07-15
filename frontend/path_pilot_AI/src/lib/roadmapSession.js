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

export function storeGeneratedRoadmap({ learner, roadmap, generationId }) {
  const storedState = {
    learner,
    roadmap,
    generationId,
    source: 'api',
    generatedAt: new Date().toISOString(),
  }
  sessionStorage.setItem(ROADMAP_KEY, JSON.stringify(storedState))
  sessionStorage.removeItem(ATTEMPT_KEY)
  devLog('roadmap stored')
  return storedState
}

export function getStoredRoadmap() {
  try {
    const stored = sessionStorage.getItem(ROADMAP_KEY)
    const parsed = stored ? JSON.parse(stored) : null
    return parsed?.source === 'api' && parsed?.generatedAt ? parsed : null
  } catch {
    return null
  }
}

export function hasActiveGenerationAttempt() {
  return sessionStorage.getItem(ATTEMPT_KEY) !== null
}

export { devLog }
