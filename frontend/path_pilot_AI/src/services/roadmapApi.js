const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5072').replace(/\/$/, '')
const REQUEST_TIMEOUT_MS = 120000

function toApiRequest(learner) {
  return {
    currentLevel: learner.level,
    goal: learner.goal,
    timeline: learner.timeline,
    weeklyHours: learner.hours,
    existingSkills: learner.skills,
    learningStyle: learner.learningStyle,
  }
}

function toRoadmapViewModel(response) {
  return {
    ...response,
    confidenceScore: response.feasibilityScore,
    phases: response.phases.map((phase) => ({ ...phase, project: phase.recommendedProject })),
    projects: response.suggestedProjects,
  }
}

async function getErrorMessage(response) {
  try {
    const problem = await response.json()
    return problem.detail || problem.title || 'The roadmap service could not process this request.'
  } catch {
    return 'The roadmap service returned an unexpected response.'
  }
}

export async function generateRoadmap(learner) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE_URL}/api/roadmaps/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toApiRequest(learner)),
      signal: controller.signal,
    })

    if (!response.ok) throw new Error(await getErrorMessage(response))
    return toRoadmapViewModel(await response.json())
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('The roadmap request timed out. Check that the API is running, then try again.', { cause: error })
    }
    if (error instanceof TypeError) {
      throw new Error('We could not reach the PathPilot API. Check the backend connection and try again.', { cause: error })
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}
