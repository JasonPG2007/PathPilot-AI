export function parseTimelineMonths(timeline) {
  const match = String(timeline).match(/(\d+(?:\.\d+)?)\s*(month|week)/i)
  if (!match) return null
  const amount = Number(match[1])
  return match[2].toLowerCase() === 'week' ? amount / 4.345 : amount
}

export function roundTimelineMonths(months) {
  return Math.max(1, Math.floor(Number(months) + 0.5))
}

export function formatTimeline(timeline, suffix) {
  const months = parseTimelineMonths(timeline)
  if (months === null) return String(timeline)
  const rounded = roundTimelineMonths(months)
  const existingSuffix = String(timeline).match(/\(([^)]+)\)/)?.[1]
  const label = suffix ?? existingSuffix
  return `${rounded} Month${rounded === 1 ? '' : 's'}${label ? ` (${label})` : ''}`
}

export function normalizeReplanTimelineOption(timeline) {
  const months = parseTimelineMonths(timeline)
  if (months === null) return '6 Months (Balanced)'
  const rounded = roundTimelineMonths(months)
  const explicitLabel = String(timeline).match(/\(([^)]+)\)/)?.[1]
  const inferredLabel = rounded === 7 ? 'Fast Track' : rounded === 9 ? 'Balanced' : rounded === 11 ? 'Deep Mastery' : null
  return formatTimeline(`${rounded} Months${inferredLabel || explicitLabel ? ` (${inferredLabel ?? explicitLabel})` : ''}`)
}

export function getReplanTimelineOptions(currentTimeline) {
  const current = normalizeReplanTimelineOption(currentTimeline)
  const standards = ['3 Months (Intensive)', '6 Months (Balanced)', '9 Months (Flexible)', '12 Months (Relaxed)']
  return [...new Set([current, ...standards])]
}

export function getPhaseMonthRange(totalTimeline, phaseIndex, phaseCount) {
  const totalMonths = roundTimelineMonths(parseTimelineMonths(totalTimeline) ?? phaseCount)
  const start = Math.floor((phaseIndex * totalMonths) / phaseCount) + 1
  const end = phaseIndex === phaseCount - 1
    ? totalMonths
    : Math.max(start, Math.floor(((phaseIndex + 1) * totalMonths) / phaseCount))
  return `Months ${start}–${end}`
}

export function scaleTimelineReferences(text, multiplier, totalTimeline) {
  const totalMonths = roundTimelineMonths(parseTimelineMonths(totalTimeline) ?? Number.MAX_SAFE_INTEGER)
  const clampMonth = (value) => Math.min(totalMonths, Math.max(1, roundTimelineMonths(value)))
  return String(text)
    .replace(/\bMonth\s+(\d+(?:\.\d+)?)/gi, (_, value) => `Month ${clampMonth(Number(value) * multiplier)}`)
    .replace(/\bWeek\s+(\d+(?:\.\d+)?)/gi, (_, value) => `Month ${clampMonth((Number(value) / 4.345) * multiplier)}`)
}
