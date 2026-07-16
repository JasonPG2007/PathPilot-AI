import assert from 'node:assert/strict'
import test from 'node:test'
import { addExplanationView, addStrategyView, evaluateAchievements, loadAchievementState } from '../src/services/achievements.js'

function roadmap() {
  return {
    phases: [1, 2].map((id) => {
      const project = { title: `Project ${id}`, type: 'Portfolio', accent: 'violet' }
      return { id, title: `Phase ${id}`, skills: [`Skill ${id}.1`, `Skill ${id}.2`], milestones: [`Milestone ${id}.1`, `Milestone ${id}.2`], project, recommendedProject: project }
    }),
  }
}

function memory(overrides = {}) {
  return { currentPhase: 1, completedSkillIds: [], completedMilestoneIds: [], ...overrides }
}

function badge(result, id) {
  return result.badges.find((item) => item.id === id)
}

test.beforeEach(() => {
  globalThis.localStorage = { value: null, getItem() { return this.value }, setItem(_key, value) { this.value = value }, removeItem() { this.value = null } }
})

test('First Step unlocks after one completion', () => {
  const result = evaluateAchievements({ state: loadAchievementState('journey'), roadmap: roadmap(), memory: memory({ completedSkillIds: ['phase:1:skill:0'] }) })
  assert.equal(badge(result, 'first-step').earned, true)
})

test('phase completion unlocks Phase Finisher', () => {
  const result = evaluateAchievements({ state: loadAchievementState('journey'), roadmap: roadmap(), memory: memory({ completedSkillIds: ['phase:1:skill:0', 'phase:1:skill:1'], completedMilestoneIds: ['phase:1:milestone:0', 'phase:1:milestone:1'] }) })
  assert.equal(badge(result, 'phase-finisher').earned, true)
  assert.equal(badge(result, 'project-ready').earned, true)
})

test('50 percent overall unlocks Halfway There', () => {
  const result = evaluateAchievements({ state: loadAchievementState('journey'), roadmap: roadmap(), memory: memory({ completedSkillIds: ['phase:1:skill:0', 'phase:1:skill:1'], completedMilestoneIds: ['phase:1:milestone:0', 'phase:1:milestone:1'] }) })
  assert.equal(badge(result, 'halfway-there').earned, true)
})

test('viewing all strategies unlocks Strategy Explorer', () => {
  let state = loadAchievementState('journey')
  for (const strategy of ['balanced', 'fast', 'deep']) state = addStrategyView(state, strategy)
  assert.equal(badge(evaluateAchievements({ state, roadmap: roadmap(), memory: memory() }), 'strategy-explorer').earned, true)
})

test('successful replan metadata unlocks Adaptive Learner', () => {
  const result = evaluateAchievements({ state: loadAchievementState('journey'), roadmap: roadmap(), memory: memory(), hasReplan: true })
  assert.equal(badge(result, 'adaptive-learner').earned, true)
})

test('three unique explanations unlock Curious Mind', () => {
  let state = loadAchievementState('journey')
  for (const item of ['one', 'two', 'three', 'three']) state = addExplanationView(state, item)
  const result = evaluateAchievements({ state, roadmap: roadmap(), memory: memory() })
  assert.equal(state.explanationItemIds.length, 3)
  assert.equal(badge(result, 'curious-mind').earned, true)
})

test('100 percent unlocks Journey Complete', () => {
  const completedSkillIds = ['phase:1:skill:0', 'phase:1:skill:1', 'phase:2:skill:0', 'phase:2:skill:1']
  const completedMilestoneIds = ['phase:1:milestone:0', 'phase:1:milestone:1', 'phase:2:milestone:0', 'phase:2:milestone:1']
  const result = evaluateAchievements({ state: loadAchievementState('journey'), roadmap: roadmap(), memory: memory({ completedSkillIds, completedMilestoneIds }) })
  assert.equal(badge(result, 'journey-complete').earned, true)
})

test('earnedAt persists and badges never unlock twice', () => {
  const first = evaluateAchievements({ state: loadAchievementState('journey'), roadmap: roadmap(), memory: memory({ completedSkillIds: ['phase:1:skill:0'] }), now: new Date('2026-01-01T00:00:00Z') })
  const second = evaluateAchievements({ state: first.state, roadmap: roadmap(), memory: memory({ completedSkillIds: ['phase:1:skill:0'] }), now: new Date('2026-02-01T00:00:00Z') })
  assert.equal(second.state.earnedAt['first-step'], '2026-01-01T00:00:00.000Z')
  assert.equal(second.newlyEarned.includes('first-step'), false)
  assert.equal(second.state.earnedBadgeIds.filter((id) => id === 'first-step').length, 1)
})
