import assert from 'node:assert/strict'
import test from 'node:test'
import { buildJourneyDashboard, estimateFinish, getNextJourneyAction } from '../src/lib/journeyDashboard.js'
import { buildVariants } from '../src/services/roadmapVariants.js'

function roadmap() {
  const phases = Array.from({ length: 3 }, (_, index) => {
    const project = { id: index + 1, title: `Project ${index + 1}`, type: 'Portfolio', category: 'Build', description: 'Ship a project.', accent: ['violet', 'teal', 'blue'][index] }
    return {
      id: index + 1, title: `Phase ${index + 1}`, duration: `Months ${index * 3 + 1}-${index * 3 + 3}`, weeklyWorkload: '10 hours/week', description: 'Learn and build.',
      skills: [`Skill ${index + 1}.1`, `Skill ${index + 1}.2`], prerequisites: ['None'], milestones: [`Milestone ${index + 1}.1`, `Milestone ${index + 1}.2`],
      project, recommendedProject: project,
    }
  })
  return {
    goal: 'Become an engineer', startingLevel: 'Beginner', timeline: '9 Months (Balanced)', weeklyHours: 10, feasibilityScore: 82,
    phases, criticReview: { riskLevel: 'Low', issues: [], changesMade: [], timelineAdjustments: '', prerequisiteCorrections: '' },
    suggestedProjects: phases.map((phase) => phase.project), projects: phases.map((phase) => phase.project), skillVault: [],
  }
}

function memory(overrides = {}) {
  return { currentPhase: 1, completedSkillIds: [], completedMilestoneIds: [], ...overrides }
}

test('remaining count handles zero, partial, and complete progress', () => {
  const plan = roadmap()
  const zero = buildJourneyDashboard({ roadmap: plan, memory: memory(), strategy: 'balanced' })
  const partial = buildJourneyDashboard({ roadmap: plan, memory: memory({ completedSkillIds: ['phase:1:skill:0'], completedMilestoneIds: ['phase:1:milestone:0'] }), strategy: 'balanced' })
  const allIds = plan.phases.flatMap((phase) => phase.skills.map((_, index) => `phase:${phase.id}:skill:${index}`))
  const allMilestones = plan.phases.flatMap((phase) => phase.milestones.map((_, index) => `phase:${phase.id}:milestone:${index}`))
  const complete = buildJourneyDashboard({ roadmap: plan, memory: memory({ currentPhase: 3, completedSkillIds: allIds, completedMilestoneIds: allMilestones }), strategy: 'balanced' })

  assert.equal(zero.progress.percentage, 0)
  assert.equal(zero.remainingCount, 12)
  assert.equal(partial.progress.percentage, 17)
  assert.equal(partial.remainingCount, 10)
  assert.equal(complete.progress.percentage, 100)
  assert.equal(complete.remainingCount, 0)
  assert.equal(complete.complete, true)
})

test('estimated finish uses timeline multiplied by remaining completion', () => {
  const now = new Date(2026, 0, 15)
  assert.equal(estimateFinish('9 Months', 0, now).label, 'October 2026')
  assert.equal(estimateFinish('9 Months', 50, now).label, 'June 2026')
  assert.equal(estimateFinish('9 Months', 100, now).label, 'January 2026')
})

test('Deep strategy uses its own larger denominator', () => {
  const variants = buildVariants(roadmap())
  const balanced = buildJourneyDashboard({ roadmap: variants.balanced, memory: memory(), strategy: 'balanced' })
  const deep = buildJourneyDashboard({ roadmap: variants.deep, memory: memory(), strategy: 'deep' })
  assert.ok(deep.progress.totalCount > balanced.progress.totalCount)
})

test('next action prefers the first incomplete milestone in the current phase', () => {
  const next = getNextJourneyAction(roadmap(), memory())
  assert.equal(next.type, 'milestone')
  assert.equal(next.title, 'Milestone 1.1')
})

test('next action falls back to the first incomplete current-phase skill', () => {
  const next = getNextJourneyAction(roadmap(), memory({ completedMilestoneIds: ['phase:1:milestone:0', 'phase:1:milestone:1'] }))
  assert.equal(next.type, 'skill')
  assert.equal(next.title, 'Skill 1.1')
})

test('next action reports the completed-roadmap state', () => {
  const plan = roadmap()
  const completedSkillIds = plan.phases.flatMap((phase) => phase.skills.map((_, index) => `phase:${phase.id}:skill:${index}`))
  const completedMilestoneIds = plan.phases.flatMap((phase) => phase.milestones.map((_, index) => `phase:${phase.id}:milestone:${index}`))
  const next = getNextJourneyAction(plan, memory({ currentPhase: 3, completedSkillIds, completedMilestoneIds }))
  assert.equal(next.type, 'complete')
  assert.equal(next.title, 'Journey complete')
})

test('replanned timeline and workload immediately update dashboard values', () => {
  const replanned = { ...roadmap(), timeline: '12 Months (Balanced)', weeklyHours: 6 }
  const dashboard = buildJourneyDashboard({ roadmap: replanned, memory: memory(), strategy: 'balanced', currentDate: new Date(2026, 0, 15) })
  assert.equal(dashboard.timeline, '12 Months (Balanced)')
  assert.equal(dashboard.weeklyHours, 6)
  assert.equal(dashboard.estimatedFinish.label, 'January 2027')
})
