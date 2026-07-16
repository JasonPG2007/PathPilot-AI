import { getMilestoneId, getProgress, getSkillId } from '../lib/learnerMemory.js'

const STORAGE_KEY = 'pathpilotAchievements:v1'
const VERSION = 1

function ratioProgress(current, target, label) {
  return { current, target, percentage: target ? Math.min(100, Math.round((current / target) * 100)) : 0, label }
}

function phaseCounts(roadmap, memory) {
  const skills = new Set(memory.completedSkillIds ?? [])
  const milestones = new Set(memory.completedMilestoneIds ?? [])
  return roadmap.phases.map((phase) => {
    const completedSkills = phase.skills.filter((_, index) => skills.has(getSkillId(phase.id, index, phase.skillIds?.[index]))).length
    const completedMilestones = phase.milestones.filter((_, index) => milestones.has(getMilestoneId(phase.id, index, phase.milestoneIds?.[index]))).length
    return {
      phase,
      completedSkills,
      completedMilestones,
      completed: completedSkills + completedMilestones,
      total: phase.skills.length + phase.milestones.length,
    }
  })
}

export const achievementCatalog = [
  { id: 'first-step', title: 'First Step', description: 'Complete your first roadmap skill or milestone.', icon: 'shoe-prints', category: 'Progress', rarity: 'Starter', condition: ({ progress }) => ({ earned: progress.completedCount >= 1, progress: ratioProgress(progress.completedCount, 1, 'Complete 1 item') }) },
  { id: 'foundation-builder', title: 'Foundation Builder', description: 'Complete at least half of your Phase 1 work.', icon: 'layer-group', category: 'Learning', rarity: 'Bronze', condition: ({ phases }) => { const phase = phases[0] ?? { completed: 0, total: 0 }; const target = Math.ceil(phase.total / 2); return { earned: phase.total > 0 && phase.completed >= target, progress: ratioProgress(phase.completed, target, `${phase.completed} of ${target} foundation items`) } } },
  { id: 'phase-finisher', title: 'Phase Finisher', description: 'Complete every visible item in any phase.', icon: 'flag-checkered', category: 'Progress', rarity: 'Silver', condition: ({ phases }) => { const best = [...phases].sort((a, b) => (b.completed / Math.max(1, b.total)) - (a.completed / Math.max(1, a.total)))[0] ?? { completed: 0, total: 1 }; return { earned: phases.some((phase) => phase.total > 0 && phase.completed === phase.total), progress: ratioProgress(best.completed, best.total, `${best.completed} of ${best.total} phase items`) } } },
  { id: 'project-ready', title: 'Project Ready', description: 'Complete every milestone in a phase with a project.', icon: 'folder-open', category: 'Portfolio', rarity: 'Silver', condition: ({ phases }) => { const eligible = phases.filter(({ phase }) => phase.project || phase.recommendedProject); const best = [...eligible].sort((a, b) => (b.completedMilestones / Math.max(1, b.phase.milestones.length)) - (a.completedMilestones / Math.max(1, a.phase.milestones.length)))[0]; const current = best?.completedMilestones ?? 0; const target = best?.phase.milestones.length ?? 1; return { earned: eligible.some(({ phase, completedMilestones }) => phase.milestones.length > 0 && completedMilestones === phase.milestones.length), progress: ratioProgress(current, target, `${current} of ${target} project milestones`) } } },
  { id: 'consistent-learner', title: 'Consistent Learner', description: 'Complete at least five roadmap items.', icon: 'chart-line', category: 'Habit', rarity: 'Bronze', condition: ({ progress }) => ({ earned: progress.completedCount >= 5, progress: ratioProgress(progress.completedCount, 5, `${Math.min(progress.completedCount, 5)} of 5 items`) }) },
  { id: 'halfway-there', title: 'Halfway There', description: 'Reach at least 50% overall completion.', icon: 'circle-half-stroke', category: 'Progress', rarity: 'Silver', condition: ({ progress }) => ({ earned: progress.percentage >= 50, progress: ratioProgress(progress.percentage, 50, `${progress.percentage}% of 50%`) }) },
  { id: 'strategy-explorer', title: 'Strategy Explorer', description: 'View Fast Track, Balanced, and Deep Mastery.', icon: 'route', category: 'Exploration', rarity: 'Gold', condition: ({ state }) => ({ earned: state.strategyHistory.length >= 3, progress: ratioProgress(state.strategyHistory.length, 3, `${state.strategyHistory.length} of 3 strategies`) }) },
  { id: 'adaptive-learner', title: 'Adaptive Learner', description: 'Successfully adapt your journey at least once.', icon: 'arrows-rotate', category: 'Adaptability', rarity: 'Gold', condition: ({ state, hasReplan }) => { const current = state.replanCount > 0 || hasReplan ? 1 : 0; return { earned: current === 1, progress: ratioProgress(current, 1, current ? 'Replan completed' : 'Complete a replan') } } },
  { id: 'curious-mind', title: 'Curious Mind', description: 'Open Explain Why for three unique roadmap items.', icon: 'circle-question', category: 'Exploration', rarity: 'Silver', condition: ({ state }) => ({ earned: state.explanationItemIds.length >= 3, progress: ratioProgress(state.explanationItemIds.length, 3, `${Math.min(state.explanationItemIds.length, 3)} of 3 explanations`) }) },
  { id: 'journey-complete', title: 'Journey Complete', description: 'Complete every visible roadmap item.', icon: 'trophy', category: 'Mastery', rarity: 'Platinum', condition: ({ progress }) => ({ earned: progress.percentage === 100, progress: ratioProgress(progress.percentage, 100, `${progress.percentage}% complete`) }) },
]

function freshState(journeyId) {
  return { version: VERSION, journeyId, earnedBadgeIds: [], earnedAt: {}, strategyHistory: [], explanationItemIds: [], replanCount: 0, lastUpdated: new Date().toISOString() }
}

function persist(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  return state
}

export function loadAchievementState(journeyId) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (stored?.version === VERSION && stored.journeyId === journeyId) {
      return { ...freshState(journeyId), ...stored, earnedBadgeIds: [...new Set(stored.earnedBadgeIds ?? [])], strategyHistory: [...new Set(stored.strategyHistory ?? [])], explanationItemIds: [...new Set(stored.explanationItemIds ?? [])] }
    }
  } catch {
    // Invalid achievement state is replaced for this journey.
  }
  return freshState(journeyId)
}

export function addStrategyView(state, strategy) {
  return { ...state, strategyHistory: [...new Set([...state.strategyHistory, strategy])], lastUpdated: new Date().toISOString() }
}

export function addExplanationView(state, itemId) {
  return { ...state, explanationItemIds: [...new Set([...state.explanationItemIds, itemId])], lastUpdated: new Date().toISOString() }
}

export function addSuccessfulReplan(state) {
  return { ...state, replanCount: Math.max(1, state.replanCount + 1), lastUpdated: new Date().toISOString() }
}

export function evaluateAchievements({ state, roadmap, memory, hasReplan = false, now = new Date() }) {
  const progress = getProgress(memory, roadmap)
  const context = { state, roadmap, memory, progress, phases: phaseCounts(roadmap, memory), hasReplan }
  const earnedAt = { ...state.earnedAt }
  const newlyEarned = []
  const badges = achievementCatalog.map((badge) => {
    const result = badge.condition(context)
    const wasEarned = Boolean(earnedAt[badge.id])
    if (result.earned && !wasEarned) {
      earnedAt[badge.id] = now.toISOString()
      newlyEarned.push(badge.id)
    }
    return { ...badge, condition: undefined, earned: wasEarned || result.earned, earnedAt: earnedAt[badge.id] ?? null, progress: result.progress }
  })
  const nextState = {
    ...state,
    earnedAt,
    earnedBadgeIds: achievementCatalog.filter((badge) => earnedAt[badge.id]).map((badge) => badge.id),
    lastUpdated: newlyEarned.length ? now.toISOString() : state.lastUpdated,
  }
  return { state: nextState, badges, newlyEarned }
}

export function evaluateAndStoreAchievements(context) {
  const result = evaluateAchievements(context)
  persist(result.state)
  return result
}

export function clearAchievementState(journeyId) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!stored || !journeyId || stored.journeyId === journeyId) localStorage.removeItem(STORAGE_KEY)
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export const achievementStorageKey = STORAGE_KEY
