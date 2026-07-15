import { restoreCompletedRoadmapItems } from './roadmapVariants.js'

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5072').replace(/\/$/, '')

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

export async function requestReplan({ learner, roadmap, canonicalRoadmap = roadmap, memory, constraints, fetchImpl = fetch }) {
  const preflight = restoreCompletedRoadmapItems(roadmap, canonicalRoadmap, memory)
  if (!preflight.valid) {
    if (import.meta.env?.DEV) console.info('[PathPilot] Replan preservation preflight failed.')
    throw new Error(preflight.reason)
  }
  const response = await fetchImpl(`${API_BASE_URL}/api/roadmaps/replan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      learnerProfile: toLearnerProfile(learner),
      currentRoadmap: preflight.roadmap,
      learnerProgress: {
        currentPhase: memory.currentPhase,
        completedSkillIds: memory.completedSkillIds,
        completedMilestoneIds: memory.completedMilestoneIds,
      },
      updatedConstraints: constraints,
    }),
  })

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
