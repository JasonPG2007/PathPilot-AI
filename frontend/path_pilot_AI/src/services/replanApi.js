import { restoreCompletedRoadmapItems } from './roadmapVariants.js'

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5072').replace(/\/$/, '')
export const REPLAN_TIMEOUT_MS = 180_000
let activeReplanRequest = null

export class ReplanTimeoutError extends Error {
  constructor() {
    super('Replanning timed out after 180 seconds. Your current roadmap is unchanged. Please try again.')
    this.name = 'ReplanTimeoutError'
  }
}

function toLearnerProfile(learner) {
  return {
    currentLevel: learner.level,
    goal: learner.goal,
    timeline: learner.timeline,
    weeklyHours: learner.hours,
    existingSkills: learner.skills,
    learningStyle: learner.learningStyle,
  }
}

function normalizeRoadmap(response) {
  if (!response || !Array.isArray(response.phases) || !response.criticReview || !Array.isArray(response.suggestedProjects)) {
    throw new Error('The replan service returned an invalid roadmap.')
  }
  return {
    ...response,
    confidenceScore: response.feasibilityScore,
    phases: response.phases.map((phase) => ({ ...phase, project: phase.recommendedProject })),
    projects: response.suggestedProjects,
  }
}

// Keep the public request contract, but omit client-only resource and strategy presentation data.
export function compactRoadmapForReplan(roadmap) {
  return {
    goal: roadmap.goal,
    summary: roadmap.summary,
    timeline: roadmap.timeline,
    weeklyHours: roadmap.weeklyHours,
    startingLevel: roadmap.startingLevel,
    feasibilityScore: roadmap.feasibilityScore,
    phases: (roadmap.phases || []).map((phase) => ({
      id: phase.id,
      title: phase.title,
      duration: phase.duration,
      weeklyWorkload: phase.weeklyWorkload,
      description: phase.description,
      skills: phase.skills,
      prerequisites: phase.prerequisites,
      milestones: phase.milestones,
      recommendedProject: phase.recommendedProject || phase.project,
    })),
    criticReview: roadmap.criticReview,
    skillVault: roadmap.skillVault || [],
    suggestedProjects: roadmap.suggestedProjects || roadmap.projects || [],
  }
}

async function executeReplan({ learner, roadmap, canonicalRoadmap, memory, constraints, fetchImpl, timeoutMs }) {
  const preflight = restoreCompletedRoadmapItems(roadmap, canonicalRoadmap, memory)
  if (!preflight.valid) {
    if (import.meta.env?.DEV) console.info('[PathPilot] Replan preservation preflight failed.')
    throw new Error(preflight.reason)
  }
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort('replan-timeout'), timeoutMs)
  let response
  try {
    response = await fetchImpl(`${API_BASE_URL}/api/roadmaps/replan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        learnerProfile: toLearnerProfile(learner),
        currentRoadmap: compactRoadmapForReplan(preflight.roadmap),
        learnerProgress: {
          currentPhase: memory.currentPhase,
          completedSkillIds: memory.completedSkillIds,
          completedMilestoneIds: memory.completedMilestoneIds,
        },
        updatedConstraints: constraints,
      }),
    })
  } catch (error) {
    if (controller.signal.aborted) throw new ReplanTimeoutError()
    throw error
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    let message = 'We could not revise your roadmap. Please try again.'
    try {
      const problem = await response.json()
      message = problem.detail || problem.title || message
    } catch {
      // Keep the safe fallback message.
    }
    throw new Error(message)
  }

  return normalizeRoadmap(await response.json())
}

export function requestReplan({ learner, roadmap, canonicalRoadmap = roadmap, memory, constraints, fetchImpl = fetch, timeoutMs = REPLAN_TIMEOUT_MS }) {
  if (activeReplanRequest) {
    if (import.meta.env?.DEV) console.info('[PathPilot] Duplicate replan submission blocked.')
    return activeReplanRequest
  }

  activeReplanRequest = executeReplan({ learner, roadmap, canonicalRoadmap, memory, constraints, fetchImpl, timeoutMs })
    .finally(() => { activeReplanRequest = null })
  return activeReplanRequest
}
