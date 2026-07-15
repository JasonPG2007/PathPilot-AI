const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5072').replace(/\/$/, '')
const CACHE_KEY = 'pathpilotExplanationCache:v1'
const inFlightExplanations = new Map()

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) ?? {} } catch { return {} }
}

export function getCachedExplanation(generationId, itemId) {
  return readCache()[`${generationId}:${itemId}`] ?? null
}

export function requestExplanation({ generationId, itemId, request }) {
  const cacheId = `${generationId}:${itemId}`
  const cached = getCachedExplanation(generationId, itemId)
  if (cached) return Promise.resolve(cached)
  if (inFlightExplanations.has(cacheId)) return inFlightExplanations.get(cacheId)

  const pending = fetch(`${API_BASE_URL}/api/roadmaps/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  }).then(async (response) => {
    if (!response.ok) {
      let message = 'We could not explain this roadmap item. Please try again.'
      try {
        const problem = await response.json()
        message = problem.detail || problem.title || message
      } catch { /* Keep the safe fallback message. */ }
      throw new Error(message)
    }
    const explanation = await response.json()
    if (!explanation?.explanation || !explanation?.prerequisiteReason || !explanation?.careerImpact || !explanation?.expectedBenefit) {
      throw new Error('The explanation service returned an invalid response.')
    }
    const cache = readCache()
    cache[cacheId] = explanation
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    return explanation
  }).finally(() => inFlightExplanations.delete(cacheId))

  inFlightExplanations.set(cacheId, pending)
  return pending
}
