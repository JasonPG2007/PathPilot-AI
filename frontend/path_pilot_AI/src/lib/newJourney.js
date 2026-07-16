import { clearLearnerMemory } from './learnerMemory.js'
import { clearRoadmapSession, devLog, markNewJourneyReset } from './roadmapSession.js'
import { clearRoadmapStrategyState } from '../services/roadmapVariants.js'

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

  const resetId = createGenerationId()
  markNewJourneyReset(resetId)
  devLog('navigation to /create')
  navigate('/create', { replace: true, state: { newJourneyResetId: resetId } })
  return resetId
}
