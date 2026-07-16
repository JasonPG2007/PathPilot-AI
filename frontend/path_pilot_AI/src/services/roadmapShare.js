const SUMMARY_LIMIT = 700

function clean(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ')
}

function truncateAtWord(value, limit) {
  if (value.length <= limit) return value
  const contentLimit = Math.max(1, limit - 1)
  const candidate = value.slice(0, contentLimit + 1)
  const boundary = candidate.lastIndexOf(' ')
  return `${candidate.slice(0, boundary > contentLimit * 0.7 ? boundary : contentLimit).trimEnd()}…`
}

export function getShareUrl(locationLike = window.location) {
  return `${locationLike.origin}${locationLike.pathname}${locationLike.hash || ''}`
}

export function createRoadmapShareSummary(details, liveUrl) {
  const lines = [
    'PathPilot AI Roadmap',
    `Goal: ${clean(details.goal)}`,
    `Strategy: ${clean(details.strategy)}`,
    `Timeline: ${clean(details.timeline)}`,
    `Weekly commitment: ${clean(details.weeklyHours)} hours`,
    `Progress: ${clean(details.completionPercentage)}%`,
    `Current phase: ${clean(details.currentPhase)}`,
    `Next up: ${clean(details.nextAction)}`,
    `Feasibility: ${clean(details.feasibilityScore)}% — ${clean(details.riskLevel)} risk`,
    `Explore PathPilot: ${clean(liveUrl)}`,
  ]
  return truncateAtWord(lines.join('\n'), SUMMARY_LIMIT)
}

export async function copyShareText(text, clipboard = navigator.clipboard) {
  if (!clipboard?.writeText) throw new Error('Clipboard access is unavailable.')
  await clipboard.writeText(text)
  return true
}

export async function shareNatively(data, navigatorLike = navigator) {
  if (typeof navigatorLike?.share !== 'function') return { status: 'unsupported' }
  try {
    await navigatorLike.share(data)
    return { status: 'shared' }
  } catch (error) {
    if (error?.name === 'AbortError') return { status: 'cancelled' }
    return { status: 'failed' }
  }
}

export function getSharePanelAccessibility() {
  return { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'share-roadmap-title' }
}

export { SUMMARY_LIMIT }
