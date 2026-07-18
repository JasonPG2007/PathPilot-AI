import { clearLearnerMemory } from './learnerMemory.js'
import { clearRoadmapSession, devLog, markNewJourneyReset } from './roadmapSession.js'
import { clearRoadmapStrategyState } from '../services/roadmapVariants.js'
import { clearAchievementState } from '../services/achievements.js'
import { restorePersistedRoadmap } from './roadmapHydration.js'

const REPLACE_JOURNEY_MESSAGE = 'Starting a new journey will replace your current saved roadmap. Continue?'

export function createGenerationId() {
  return crypto.randomUUID()
}

export function startNewJourney(navigate) {
  devLog('new journey reset started')
  const active = clearRoadmapSession()
  const roadmapId = active?.roadmap?.id ?? active?.generatedAt ?? active?.generationId
  clearLearnerMemory(roadmapId)
  devLog('learner memory cleared')
  clearRoadmapStrategyState()
  devLog('strategy state cleared')
  clearAchievementState(active?.generationId ?? active?.generatedAt)

  const resetId = createGenerationId()
  markNewJourneyReset(resetId)
  devLog('navigation to /create')
  navigate('/create', { replace: true, state: { newJourneyResetId: resetId } })
  return resetId
}

export function confirmAndStartNewJourney(navigate, options = {}) {
  const savedRoadmap = options.savedRoadmap === undefined ? restorePersistedRoadmap() : options.savedRoadmap
  const confirmReplacement = options.confirmReplacement ?? ((message) => window.confirm(message))
  if (savedRoadmap && !confirmReplacement(REPLACE_JOURNEY_MESSAGE)) return null
  return startNewJourney(navigate)
}

export const newJourneyReplacementMessage = REPLACE_JOURNEY_MESSAGE
