import assert from 'node:assert/strict'
import test from 'node:test'
import { buildVariants, restoreCompletedRoadmapItems } from '../src/services/roadmapVariants.js'
import { requestReplan } from '../src/services/replanApi.js'

function canonicalRoadmap() {
  const project = { id: 'project-1', title: 'Canonical Project', type: 'Portfolio', category: 'Build', description: 'Ship in Month 9.', accent: 'violet' }
  return {
    id: 'journey-1', goal: 'Become an engineer', startingLevel: 'Beginner', summary: 'Canonical', timeline: '9 Months (Balanced)', weeklyHours: 10,
    feasibilityScore: 80,
    phases: [{
      id: 1, title: 'Canonical Phase', duration: 'Months 1–9', weeklyWorkload: '10 hours/week', description: 'Learn well.',
      skills: ['Skill 0', 'Skill 1', 'Skill 2', 'Skill 3', 'Completed Skill 4'],
      prerequisites: ['None'],
      milestones: ['Milestone 0', 'Milestone 1', 'Milestone 2', 'Completed Milestone 3'],
      project, recommendedProject: project,
    }],
    criticReview: { riskLevel: 'Low', issuesFound: [], changesMade: [], timelineAdjustments: '', prerequisiteCorrections: '' },
    skillVault: [], suggestedProjects: [project], projects: [project],
  }
}

const progress = {
  currentPhase: 1,
  completedSkillIds: ['phase:1:skill:4'],
  completedMilestoneIds: ['phase:1:milestone:3'],
}

test('restores a completed skill Fast Track would trim', () => {
  const canonical = canonicalRoadmap()
  const fast = buildVariants(canonical).fast
  assert.equal(fast.phases[0].skills[4], undefined)
  const repaired = restoreCompletedRoadmapItems(fast, canonical, progress)
  assert.equal(repaired.valid, true)
  assert.equal(repaired.roadmap.phases[0].skills[4], 'Completed Skill 4')
})

test('restores a completed milestone Fast Track would remove', () => {
  const canonical = canonicalRoadmap()
  const repaired = restoreCompletedRoadmapItems(buildVariants(canonical).fast, canonical, progress)
  assert.equal(repaired.roadmap.phases[0].milestones[3], 'Completed Milestone 3')
})

test('replan preflight submits repaired completed items with unchanged identity and text', async () => {
  const canonical = canonicalRoadmap()
  let submitted
  const fetchImpl = async (_url, options) => {
    submitted = JSON.parse(options.body)
    return { ok: true, json: async () => canonical }
  }
  await requestReplan({
    learner: { level: 'Beginner', goal: canonical.goal, timeline: canonical.timeline, hours: 10, skills: [], learningStyle: 'Practice' },
    roadmap: buildVariants(canonical).fast,
    canonicalRoadmap: canonical,
    memory: progress,
    constraints: { weeklyHours: 10, timeline: canonical.timeline, mainDifficulty: 'Time constraints' },
    fetchImpl,
  })
  assert.equal(submitted.currentRoadmap.phases[0].skills[4], 'Completed Skill 4')
  assert.equal(submitted.currentRoadmap.phases[0].milestones[3], 'Completed Milestone 3')
})

test('does not issue a request when completed-item preflight cannot preserve identity', async () => {
  const canonical = canonicalRoadmap()
  let calls = 0
  await assert.rejects(() => requestReplan({
    learner: { level: 'Beginner', goal: canonical.goal, timeline: canonical.timeline, hours: 10, skills: [], learningStyle: 'Practice' },
    roadmap: buildVariants(canonical).fast,
    canonicalRoadmap: canonical,
    memory: { ...progress, completedSkillIds: ['phase:1:skill:99'] },
    constraints: { weeklyHours: 10, timeline: canonical.timeline, mainDifficulty: 'Time constraints' },
    fetchImpl: async () => { calls += 1 },
  }), /could not be restored/)
  assert.equal(calls, 0)
})
