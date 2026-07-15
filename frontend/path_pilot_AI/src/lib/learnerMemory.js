const LEARNER_MEMORY_KEY = 'pathpilotLearnerMemory'
const MEMORY_VERSION = 1

export function getSkillId(phaseId, index, explicitId) {
  return explicitId ?? `phase:${phaseId}:skill:${index}`
}

export function getMilestoneId(phaseId, index, explicitId) {
  return explicitId ?? `phase:${phaseId}:milestone:${index}`
}

function getTrackableIds(roadmap) {
  const skills = []
  const milestones = []
  roadmap.phases.forEach((phase) => {
    phase.skills.forEach((_, index) => skills.push(getSkillId(phase.id, index, phase.skillIds?.[index])))
    phase.milestones.forEach((_, index) => milestones.push(getMilestoneId(phase.id, index, phase.milestoneIds?.[index])))
  })
  return { skills, milestones }
}

function getCurrentPhase(roadmap, completedSkillIds, completedMilestoneIds) {
  const completedSkills = new Set(completedSkillIds)
  const completedMilestones = new Set(completedMilestoneIds)
  const activePhase = roadmap.phases.find((phase) => (
    phase.skills.some((_, index) => !completedSkills.has(getSkillId(phase.id, index, phase.skillIds?.[index]))) ||
    phase.milestones.some((_, index) => !completedMilestones.has(getMilestoneId(phase.id, index, phase.milestoneIds?.[index])))
  ))
  return activePhase?.id ?? roadmap.phases.at(-1)?.id ?? null
}

function createMemory({ learner, roadmap, generatedAt }) {
  return {
    version: MEMORY_VERSION,
    learnerProfile: learner,
    roadmapId: roadmap.id ?? generatedAt,
    generatedAt,
    currentPhase: roadmap.phases[0]?.id ?? null,
    completedSkillIds: [],
    completedMilestoneIds: [],
    weeklyHours: roadmap.weeklyHours ?? learner.hours,
    lastUpdated: new Date().toISOString(),
  }
}

function persist(memory) {
  localStorage.setItem(LEARNER_MEMORY_KEY, JSON.stringify(memory))
  return memory
}

export function loadLearnerMemory(context) {
  const roadmapId = context.roadmap.id ?? context.generatedAt
  try {
    const stored = JSON.parse(localStorage.getItem(LEARNER_MEMORY_KEY))
    if (stored?.version === MEMORY_VERSION && stored.roadmapId === roadmapId) {
      const validIds = getTrackableIds(context.roadmap)
      const validSkills = new Set(validIds.skills)
      const validMilestones = new Set(validIds.milestones)
      return {
        ...stored,
        learnerProfile: context.learner,
        completedSkillIds: [...new Set(stored.completedSkillIds ?? [])].filter((id) => validSkills.has(id)),
        completedMilestoneIds: [...new Set(stored.completedMilestoneIds ?? [])].filter((id) => validMilestones.has(id)),
        weeklyHours: context.roadmap.weeklyHours ?? context.learner.hours,
      }
    }
  } catch {
    // Invalid local memory is safely replaced below.
  }
  return persist(createMemory(context))
}

export function toggleCompletion(memory, roadmap, type, id) {
  const property = type === 'skill' ? 'completedSkillIds' : 'completedMilestoneIds'
  const completed = new Set(memory[property])
  if (completed.has(id)) completed.delete(id)
  else completed.add(id)

  const next = { ...memory, [property]: [...completed], lastUpdated: new Date().toISOString() }
  next.currentPhase = getCurrentPhase(roadmap, next.completedSkillIds, next.completedMilestoneIds)
  return persist(next)
}

export function resetLearnerProgress(context) {
  return persist(createMemory(context))
}

export function updateLearnerConstraints(memory, learner, weeklyHours) {
  return persist({
    ...memory,
    learnerProfile: learner,
    weeklyHours,
    lastUpdated: new Date().toISOString(),
  })
}

export function getProgress(memory, roadmap) {
  const trackable = getTrackableIds(roadmap)
  const completedSkills = new Set(memory.completedSkillIds)
  const completedMilestones = new Set(memory.completedMilestoneIds)
  const completedCount = trackable.skills.filter((id) => completedSkills.has(id)).length +
    trackable.milestones.filter((id) => completedMilestones.has(id)).length
  const totalCount = trackable.skills.length + trackable.milestones.length
  return { completedCount, totalCount, percentage: totalCount ? Math.round((completedCount / totalCount) * 100) : 0 }
}
