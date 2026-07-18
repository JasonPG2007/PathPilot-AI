import { learnerMemoryKey } from './learnerMemory.js'
import { getPersistedStrategyState } from '../services/roadmapVariants.js'

const LEARNER_MEMORY_VERSION = 1

function getCanonicalGeneratedAt(strategyState) {
  return strategyState.strategies.balanced.generatedAt ??
    strategyState.canonicalBalancedRoadmap.generatedAt ??
    strategyState.updatedAt ??
    null
}

function isMatchingLearnerMemory(memory, strategyState, generatedAt) {
  if (!memory || memory.version !== LEARNER_MEMORY_VERSION || !memory.learnerProfile) return false
  if (!Array.isArray(memory.completedSkillIds) || !Array.isArray(memory.completedMilestoneIds)) return false

  const canonicalRoadmapId = strategyState.canonicalBalancedRoadmap.id ?? generatedAt
  if (!canonicalRoadmapId || memory.roadmapId !== canonicalRoadmapId) return false
  if (memory.generatedAt && generatedAt && memory.generatedAt !== generatedAt) return false
  return true
}

export function restorePersistedRoadmap(expectedJourneyId = null) {
  if (typeof localStorage === 'undefined') return null
  const strategyState = getPersistedStrategyState(expectedJourneyId)
  if (!strategyState) return null

  try {
    const memory = JSON.parse(localStorage.getItem(learnerMemoryKey))
    const generatedAt = getCanonicalGeneratedAt(strategyState)
    if (!isMatchingLearnerMemory(memory, strategyState, generatedAt)) return null

    return {
      learner: memory.learnerProfile,
      roadmap: strategyState.canonicalBalancedRoadmap,
      generationId: strategyState.journeyId,
      generatedAt,
      source: 'api',
      selectedStrategy: strategyState.selectedStrategy,
    }
  } catch {
    return null
  }
}
