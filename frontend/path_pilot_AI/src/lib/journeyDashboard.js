import { getMilestoneId, getProgress, getSkillId } from './learnerMemory.js'
import { formatTimeline, parseTimelineMonths } from './timelineFormat.js'

const strategyNames = { fast: 'Fast Track', balanced: 'Balanced', deep: 'Deep Mastery' }

export function estimateFinish(timeline, completionPercentage, currentDate = new Date()) {
  const timelineMonths = Math.max(0, parseTimelineMonths(timeline) ?? 0)
  const percentage = Math.min(100, Math.max(0, Number(completionPercentage) || 0))
  const remainingMonths = timelineMonths * (1 - percentage / 100)
  const roundedMonths = Math.max(0, Math.floor(remainingMonths + 0.5))
  const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + roundedMonths, 1)
  return {
    date,
    remainingMonths,
    label: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date),
  }
}

export function getNextJourneyAction(roadmap, memory) {
  const currentIndex = Math.max(0, roadmap.phases.findIndex((phase) => phase.id === memory.currentPhase))
  const currentPhase = roadmap.phases[currentIndex]
  const completedMilestones = new Set(memory.completedMilestoneIds ?? [])
  const completedSkills = new Set(memory.completedSkillIds ?? [])

  function incompleteMilestone(phase) {
    const index = phase?.milestones.findIndex((_, itemIndex) => !completedMilestones.has(getMilestoneId(phase.id, itemIndex, phase.milestoneIds?.[itemIndex]))) ?? -1
    return index >= 0 ? { type: 'milestone', title: phase.milestones[index], phaseTitle: phase.title, label: 'Continue next' } : null
  }

  function incompleteSkill(phase) {
    const index = phase?.skills.findIndex((_, itemIndex) => !completedSkills.has(getSkillId(phase.id, itemIndex, phase.skillIds?.[itemIndex]))) ?? -1
    return index >= 0 ? { type: 'skill', title: phase.skills[index], phaseTitle: phase.title, label: 'Continue next' } : null
  }

  const next = incompleteMilestone(currentPhase) || incompleteSkill(currentPhase) || incompleteMilestone(roadmap.phases[currentIndex + 1])
  if (next) return next

  for (const phase of roadmap.phases.slice(currentIndex + 1)) {
    const fallback = incompleteMilestone(phase) || incompleteSkill(phase)
    if (fallback) return fallback
  }

  return { type: 'complete', title: 'Journey complete', phaseTitle: currentPhase?.title ?? 'Roadmap', label: 'All roadmap items completed' }
}

export function buildJourneyDashboard({ roadmap, memory, strategy, currentDate = new Date() }) {
  const progress = getProgress(memory, roadmap)
  const currentPhaseIndex = Math.max(0, roadmap.phases.findIndex((phase) => phase.id === memory.currentPhase))
  return {
    progress,
    remainingCount: Math.max(0, progress.totalCount - progress.completedCount),
    currentPhase: currentPhaseIndex + 1,
    currentPhaseTitle: roadmap.phases[currentPhaseIndex]?.title ?? 'Roadmap',
    totalPhases: roadmap.phases.length,
    strategy: strategyNames[strategy] ?? strategy ?? 'Balanced',
    weeklyHours: roadmap.weeklyHours,
    timeline: formatTimeline(roadmap.timeline),
    estimatedFinish: estimateFinish(roadmap.timeline, progress.percentage, currentDate),
    nextAction: getNextJourneyAction(roadmap, memory),
    riskLevel: roadmap.criticReview?.riskLevel ?? 'Unknown',
    feasibilityScore: Math.min(100, Math.max(0, Number(roadmap.feasibilityScore) || 0)),
    startingLevel: roadmap.startingLevel,
    complete: progress.percentage === 100,
  }
}
