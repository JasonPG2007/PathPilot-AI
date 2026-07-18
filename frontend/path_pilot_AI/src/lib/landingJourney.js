import { restorePersistedRoadmap } from './roadmapHydration.js'
import { strategyDefinitions } from '../services/roadmapVariants.js'

export function getSavedJourneySummary() {
  const restored = restorePersistedRoadmap()
  if (!restored) return null
  return {
    goal: restored.learner.goal ?? restored.roadmap.goal,
    selectedStrategy: restored.selectedStrategy,
    strategyName: strategyDefinitions[restored.selectedStrategy].name,
    lastUpdated: restored.lastUpdated,
  }
}

export function continueSavedJourney(navigate) {
  navigate('/roadmap')
}
