import assert from 'node:assert/strict'
import test from 'node:test'
import {
  compactRoadmapForReplan,
  REPLAN_TIMEOUT_MS,
  ReplanTimeoutError,
  requestReplan,
} from '../src/services/replanApi.js'

function fixture() {
  const project = { id: 1, title: 'Deploy a model', type: 'Portfolio', category: 'Build', description: 'Ship it.', accent: 'violet' }
  const roadmap = {
    goal: 'Become an ML engineer', summary: 'A plan', timeline: '9 Months (Balanced)', weeklyHours: 8,
    startingLevel: 'Beginner', feasibilityScore: 80,
    coachSummary: { strengths: 'Clear goal.', biggestChallenge: 'Consistency.', recommendedStrategy: 'Balanced', nextAdvice: 'Start now.' },
    phases: [{
      id: 1, title: 'Foundations', duration: 'Months 1–3', weeklyWorkload: '8 hours/week', description: 'Learn foundations.',
      skills: ['SQL'], prerequisites: ['None'], milestones: ['Query a database'], recommendedProject: project,
      resourceRecommendations: [{ id: 'sql-resource', title: 'A large UI-only resource record' }],
    }],
    criticReview: { riskLevel: 'Low', issues: [], changesMade: [], timelineAdjustments: '', prerequisiteCorrections: '' },
    skillVault: [], suggestedProjects: [project],
    strategyComparison: { label: 'UI only' },
  }
  return {
    learner: { level: 'Beginner', goal: roadmap.goal, timeline: roadmap.timeline, hours: 8, skills: [], learningStyle: 'Practice' },
    roadmap,
    memory: { currentPhase: 1, completedSkillIds: [], completedMilestoneIds: [] },
    constraints: { weeklyHours: 8, timeline: roadmap.timeline, mainDifficulty: 'Time constraints' },
  }
}

test('replan has a dedicated 180-second timeout', () => {
  assert.equal(REPLAN_TIMEOUT_MS, 180_000)
})

test('compact request roadmap excludes resource recommendation data', () => {
  const compact = compactRoadmapForReplan(fixture().roadmap)
  assert.equal(JSON.stringify(compact).includes('resourceRecommendations'), false)
  assert.equal(JSON.stringify(compact).includes('strategyComparison'), false)
})

test('duplicate submissions share one in-flight POST', async () => {
  const input = fixture()
  let calls = 0
  let release
  const fetchImpl = () => {
    calls += 1
    return new Promise((resolve) => { release = () => resolve({ ok: true, json: async () => input.roadmap }) })
  }
  const first = requestReplan({ ...input, fetchImpl })
  const second = requestReplan({ ...input, fetchImpl })
  assert.equal(first, second)
  assert.equal(calls, 1)
  release()
  await Promise.all([first, second])
})

test('timeout is distinct and keeps a concise panel-safe message', async () => {
  const input = fixture()
  const fetchImpl = (_url, options) => new Promise((resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
  })
  await assert.rejects(
    requestReplan({ ...input, fetchImpl, timeoutMs: 5 }),
    (error) => error instanceof ReplanTimeoutError && /current roadmap is unchanged/i.test(error.message),
  )
})

test('server failures are not retried automatically', async () => {
  const input = fixture()
  let calls = 0
  await assert.rejects(requestReplan({
    ...input,
    fetchImpl: async () => {
      calls += 1
      return { ok: false, json: async () => ({ detail: 'Service unavailable.' }) }
    },
  }), /Service unavailable/)
  assert.equal(calls, 1)
})
