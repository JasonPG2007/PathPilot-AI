const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5072').replace(/\/$/, '')
const CACHE_KEY = 'pathpilotExplanationCache:v1'
export const explanationCacheKey = CACHE_KEY
const inFlightExplanations = new Map()

export const explanationTextLimits = {
  learnerGoal: 200,
  currentPhaseTitle: 150,
  selectedItem: 300,
  previousItem: 300,
  nextItem: 300,
  panelTitle: 120,
}

function truncateAtWord(value, limit, ellipsis = '') {
  if (value.length <= limit) return value
  const contentLimit = Math.max(1, limit - ellipsis.length)
  const candidate = value.slice(0, contentLimit + 1)
  const boundary = candidate.lastIndexOf(' ')
  const shortened = boundary > contentLimit * 0.6 ? candidate.slice(0, boundary) : value.slice(0, contentLimit)
  return `${shortened.trimEnd()}${ellipsis}`
}

export function normalizeExplanationText(value, limit) {
  if (value === null || value === undefined) return null
  return truncateAtWord(String(value).trim().replace(/\s+/g, ' '), limit)
}

export function normalizeExplanationRequest(request) {
  return {
    learnerGoal: normalizeExplanationText(request.learnerGoal, explanationTextLimits.learnerGoal),
    currentPhaseTitle: normalizeExplanationText(request.currentPhaseTitle, explanationTextLimits.currentPhaseTitle),
    selectedItem: normalizeExplanationText(request.selectedItem, explanationTextLimits.selectedItem),
    previousItem: normalizeExplanationText(request.previousItem, explanationTextLimits.previousItem),
    nextItem: normalizeExplanationText(request.nextItem, explanationTextLimits.nextItem),
  }
}

export function formatExplanationPanelTitle(item) {
  const normalized = normalizeExplanationText(item, Number.MAX_SAFE_INTEGER) ?? 'Roadmap item'
  return truncateAtWord(normalized, explanationTextLimits.panelTitle, '…')
}

export function getExplanationCacheId(generationId, itemId) {
  return `${generationId}:${itemId}`
}

export function getValidationProblemMessage(problem, fallback) {
  if (problem?.errors && typeof problem.errors === 'object') {
    for (const messages of Object.values(problem.errors)) {
      if (Array.isArray(messages) && messages.length && typeof messages[0] === 'string') return messages[0]
    }
  }
  return problem?.detail || problem?.title || fallback
}

function readCache() {
  if (typeof localStorage === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) ?? {} } catch { return {} }
}

export function getCachedExplanation(generationId, itemId) {
  return readCache()[getExplanationCacheId(generationId, itemId)] ?? null
}

export function requestExplanation({ generationId, itemId, request, fetchImpl = fetch }) {
  const cacheId = getExplanationCacheId(generationId, itemId)
  const cached = getCachedExplanation(generationId, itemId)
  if (cached) return Promise.resolve(cached)
  if (inFlightExplanations.has(cacheId)) return inFlightExplanations.get(cacheId)

  const pending = fetchImpl(`${API_BASE_URL}/api/roadmaps/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalizeExplanationRequest(request)),
  }).then(async (response) => {
    if (!response.ok) {
      const fallback = 'We could not explain this roadmap item. Please try again.'
      let message = fallback
      try { message = getValidationProblemMessage(await response.json(), fallback) } catch { /* Keep the safe fallback. */ }
      throw new Error(message)
    }
    const explanation = await response.json()
    if (!explanation?.explanation || !explanation?.prerequisiteReason || !explanation?.careerImpact || !explanation?.expectedBenefit) throw new Error('The explanation service returned an invalid response.')
    const cache = readCache()
    cache[cacheId] = explanation
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    return explanation
  }).finally(() => inFlightExplanations.delete(cacheId))

  inFlightExplanations.set(cacheId, pending)
  return pending
}
