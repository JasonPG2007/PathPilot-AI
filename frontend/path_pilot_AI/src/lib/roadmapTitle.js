export const roadmapTitleLimits = Object.freeze({ words: 12, characters: 90 })

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

export function isConciseRoadmapTitle(value) {
  const title = clean(value)
  const words = title ? title.split(' ') : []
  return Boolean(title) && title.length <= roadmapTitleLimits.characters && words.length <= roadmapTitleLimits.words && !title.includes(',') && !/[.!?]$/.test(title)
}

function deriveFromGoal(value) {
  const cleaned = clean(value).replace(/^I want to\s+/i, '').replace(/^My goal is to\s+/i, '')
  let title = cleaned.split(/[,;:.!?]/, 1)[0].trim().split(' ').slice(0, roadmapTitleLimits.words).join(' ')
  while (title.length > roadmapTitleLimits.characters && title.includes(' ')) title = title.slice(0, title.lastIndexOf(' '))
  return title.replace(/[-–—]+$/, '').trim() || 'Personalized Learning Roadmap'
}

export function getRoadmapDisplayTitle(roadmapGoal, learnerGoal) {
  if (isConciseRoadmapTitle(learnerGoal)) return clean(learnerGoal)
  if (isConciseRoadmapTitle(roadmapGoal)) return clean(roadmapGoal)
  return deriveFromGoal(learnerGoal || roadmapGoal)
}

export function getRoadmapOutcome(summary, roadmapGoal, displayTitle) {
  const detailedSummary = clean(summary)
  if (detailedSummary) return detailedSummary
  const originalGoal = clean(roadmapGoal)
  return originalGoal && originalGoal !== displayTitle ? originalGoal : ''
}

