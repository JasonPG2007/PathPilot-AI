import assert from 'node:assert/strict'
import test from 'node:test'
import { restoreCompletedRoadmapItems } from '../src/services/roadmapVariants.js'

const requiredRoadmapProperties = [
  'goal', 'summary', 'timeline', 'weeklyHours', 'startingLevel', 'feasibilityScore', 'coachSummary',
  'phases', 'criticReview', 'skillVault', 'suggestedProjects',
]

function representativeRoadmap() {
  const phases = Array.from({ length: 3 }, (_, phaseIndex) => ({
    id: phaseIndex + 1,
    title: `Phase ${phaseIndex + 1}`,
    duration: `Months ${phaseIndex * 3 + 1}–${phaseIndex * 3 + 3}`,
    weeklyWorkload: '10 hours/week',
    description: 'Build focused knowledge through practical work and concise review.',
    skills: Array.from({ length: 8 }, (_, index) => `Skill ${phaseIndex + 1}.${index + 1}`),
    prerequisites: Array.from({ length: 4 }, (_, index) => `Prerequisite ${phaseIndex + 1}.${index + 1}`),
    milestones: Array.from({ length: 6 }, (_, index) => `Complete milestone ${phaseIndex + 1}.${index + 1} with verifiable evidence.`),
    recommendedProject: { title: `Project ${phaseIndex + 1}`, type: 'Portfolio', accent: 'violet' },
  }))

  return {
    goal: 'Become a Machine Learning Engineer',
    summary: 'Revise the remaining journey around the learner’s updated capacity while preserving completed work.',
    timeline: '9 Months (Balanced)',
    weeklyHours: 10,
    startingLevel: 'Beginner',
    feasibilityScore: 68,
    coachSummary: {
      strengths: 'The learner has a clear role target and a practical learning orientation.',
      biggestChallenge: 'Maintaining consistent project practice alongside prerequisite study will require discipline.',
      recommendedStrategy: 'Balanced',
      nextAdvice: 'Begin the first unfinished foundation milestone and reserve a recurring weekly project block.',
    },
    phases,
    criticReview: {
      riskLevel: 'Medium',
      issues: ['The schedule is demanding.', 'Project scope needs control.', 'Review time is limited.'],
      changesMade: ['Reduced future scope.', 'Moved validation earlier.', 'Protected prerequisites.', 'Balanced weekly work.'],
      timelineAdjustments: 'The remaining phases now fit the updated nine-month target.',
      prerequisiteCorrections: 'Required foundations remain before dependent skills.',
    },
    skillVault: Array.from({ length: 12 }, (_, index) => ({ label: `Skill ${index + 1}`, score: 50 + index })),
    suggestedProjects: Array.from({ length: 3 }, (_, index) => ({
      id: index + 1,
      title: `Portfolio Project ${index + 1}`,
      category: 'Portfolio',
      description: 'Deliver a tested, documented artifact with measurable results.',
      accent: 'violet',
    })),
  }
}

test('representative concise three-phase replan round-trips with every required property', () => {
  const original = representativeRoadmap()
  const serialized = JSON.stringify(original)
  const restored = JSON.parse(serialized)

  assert.equal(restored.phases.length, 3)
  for (const property of requiredRoadmapProperties) assert.ok(Object.hasOwn(restored, property), property)
  assert.equal(restored.criticReview.issues.length, 3)
  assert.equal(restored.criticReview.changesMade.length, 4)
  assert.ok(restored.phases.every((phase) => phase.description.length <= 120))
  assert.ok(restored.phases.flatMap((phase) => phase.milestones).every((item) => item.length <= 120))
  assert.ok(restored.suggestedProjects.every((project) => project.description.length <= 120))
})

test('representative replan preserves immutable completed skill and milestone text', () => {
  const original = representativeRoadmap()
  const roundTripped = JSON.parse(JSON.stringify(original))
  const progress = {
    currentPhase: 1,
    completedSkillIds: ['phase:1:skill:7'],
    completedMilestoneIds: ['phase:1:milestone:5'],
  }
  const result = restoreCompletedRoadmapItems(roundTripped, original, progress)

  assert.equal(result.valid, true)
  assert.equal(result.roadmap.phases[0].skills[7], original.phases[0].skills[7])
  assert.equal(result.roadmap.phases[0].milestones[5], original.phases[0].milestones[5])
})
