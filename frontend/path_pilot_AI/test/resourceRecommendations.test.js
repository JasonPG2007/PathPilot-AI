import assert from 'node:assert/strict'
import test from 'node:test'
import { recommendResourcesForPhase, recommendResourcesForRoadmap } from '../src/services/resourceRecommendations.js'
import { getProgress } from '../src/lib/learnerMemory.js'
import { buildVariants } from '../src/services/roadmapVariants.js'

const baseContext = { goal: 'Become a Machine Learning Engineer', level: 'Intermediate', phaseTitle: 'Applied Practice', projectTitle: 'Production Model', strategy: 'balanced' }

test('SQL skill returns a relevant SQL resource', () => {
  const resources = recommendResourcesForPhase({ ...baseContext, goal: 'Become a Backend Developer', skills: ['SQL foundations'] })
  assert.ok(resources.some((resource) => resource.supportedSkills.some((skill) => /sql|relational/i.test(skill))))
})

test('machine learning skill returns a trusted ML provider', () => {
  const resources = recommendResourcesForPhase({ ...baseContext, skills: ['Machine learning'] })
  assert.ok(resources.some((resource) => ['Kaggle Learn', 'Google Developers', 'Fast.ai', 'Hugging Face'].includes(resource.provider)))
})

test('Fast Track prefers practical resources', () => {
  const [first] = recommendResourcesForPhase({ ...baseContext, strategy: 'fast', skills: ['Machine learning'] })
  assert.ok(['Hands-on tutorial', 'Project-based course', 'Digital course', 'Official documentation'].includes(first.resourceType))
})

test('Deep Mastery prefers theory or deeper resources', () => {
  const [first] = recommendResourcesForPhase({ ...baseContext, goal: 'Become a Software Engineer', strategy: 'deep', skills: ['Algorithms'] })
  assert.ok(['Full university course', 'Full course', 'Technical course', 'Official documentation'].includes(first.resourceType))
})

test('one phase never contains duplicate resource IDs', () => {
  const resources = recommendResourcesForPhase({ ...baseContext, skills: ['Python', 'Machine learning', 'Model evaluation'] })
  assert.equal(new Set(resources.map((resource) => resource.id)).size, resources.length)
})

test('roadmap recommendations are deterministic across repeated runs', () => {
  const project = { title: 'Model API' }
  const roadmap = { phases: [{ id: 1, title: 'Foundations', skills: ['Python'], project }, { id: 2, title: 'Machine Learning', skills: ['Machine learning'], project }] }
  const input = { roadmap, learner: { goal: baseContext.goal, level: baseContext.level }, strategy: 'balanced' }
  assert.deepEqual(recommendResourcesForRoadmap(input), recommendResourcesForRoadmap(input))
})

function strategyFixture() {
  const project = { id: 'p1', title: 'Model Service', type: 'Build', category: 'Portfolio', description: 'Build and deploy a model.', accent: 'blue' }
  return {
    goal: 'Become a Machine Learning Engineer', timeline: '9 Months (Balanced)', weeklyHours: 10, feasibilityScore: 80,
    phases: [1, 2, 3].map((id) => ({ id, title: `Phase ${id}`, duration: `Months ${id}–${id + 2}`, weeklyWorkload: '10 hours/week', description: 'Learn.', skills: [`Canonical skill ${id}`, 'Machine learning'], prerequisites: ['Python'], milestones: [`Canonical milestone ${id}`], project, recommendedProject: project })),
    criticReview: { riskLevel: 'Low', changesMade: [] }, suggestedProjects: [project], projects: [project], skillVault: [],
  }
}

test('Deep adds deterministic IDs and more trackable items without changing Balanced', () => {
  const balanced = strategyFixture()
  const deep = buildVariants(balanced).deep
  const balancedTotal = balanced.phases.reduce((total, phase) => total + phase.skills.length + phase.milestones.length, 0)
  const deepTotal = deep.phases.reduce((total, phase) => total + phase.skills.length + phase.milestones.length, 0)
  assert.ok(deepTotal > balancedTotal)
  assert.ok(deep.phases.every((phase) => phase.skillIds.some((id) => id?.includes(':deep:skill:')) && phase.milestoneIds.some((id) => id?.includes(':deep:milestone:'))))
  assert.ok(balanced.phases.every((phase) => !phase.skillIds && !phase.milestoneIds))
})

test('strategy-aware progress preserves canonical completions and changes denominator', () => {
  const balanced = strategyFixture()
  const deep = buildVariants(balanced).deep
  const memory = { completedSkillIds: ['phase:1:skill:0'], completedMilestoneIds: ['phase:1:milestone:0'] }
  const balancedProgress = getProgress(memory, balanced)
  const deepProgress = getProgress(memory, deep)
  assert.equal(deepProgress.completedCount, balancedProgress.completedCount)
  assert.ok(deepProgress.totalCount > balancedProgress.totalCount)
  assert.ok(deepProgress.percentage < balancedProgress.percentage)
})

test('Deep recommendations materially differ from Balanced and remain deterministic', () => {
  const variants = buildVariants(strategyFixture())
  const learner = { goal: variants.balanced.goal, level: 'Intermediate' }
  const balanced = recommendResourcesForRoadmap({ roadmap: variants.balanced, learner, strategy: 'balanced' })
  const deepInput = { roadmap: variants.deep, learner, strategy: 'deep' }
  const deep = recommendResourcesForRoadmap(deepInput)
  assert.notDeepEqual(deep.byPhase[1].map(({ id }) => id), balanced.byPhase[1].map(({ id }) => id))
  assert.notDeepEqual(deep.byPhase[2].map(({ id }) => id), balanced.byPhase[2].map(({ id }) => id))
  assert.deepEqual(deep, recommendResourcesForRoadmap(deepInput))
})
