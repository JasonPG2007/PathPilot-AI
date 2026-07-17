import test from 'node:test'
import assert from 'node:assert/strict'

import {
  GENERATION_TIMEOUT_MS,
  GenerationApiError,
  GenerationTimeoutError,
  generateRoadmap,
} from '../src/services/roadmapApi.js'
import { REPLAN_TIMEOUT_MS } from '../src/services/replanApi.js'

const learner = {
  level: 'Beginner',
  goal: 'Learn SQL',
  timeline: '6 Months',
  hours: 5,
  skills: [],
  learningStyle: 'Project-based',
}

const responseRoadmap = {
  goal: 'Learn SQL',
  summary: 'A concise plan.',
  timeline: '6 Months',
  weeklyHours: 5,
  startingLevel: 'Beginner',
  feasibilityScore: 82,
  coachSummary: { strengths: 'Consistency.', biggestChallenge: 'Practice.', recommendedStrategy: 'Balanced', nextAdvice: 'Start small.' },
  phases: [{ id: 'phase:1', title: 'Foundations', skills: ['SQL'], prerequisites: ['None'], milestones: ['Query data'], recommendedProject: { id: 'project:1', title: 'SQL project', description: 'Build it.' } }],
  criticReview: { riskLevel: 'Low', issues: [], changesMade: [], timelineAdjustments: 'None', prerequisiteCorrections: 'None' },
  skillVault: ['SQL'],
  suggestedProjects: [{ id: 'project:1', title: 'SQL project', description: 'Build it.' }],
}

function jsonResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body }
}

function streamResponse(events) {
  const body = events.map(({ type, data }) => `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`).join('')
  return new Response(body, { status: 200, headers: { 'Content-Type': 'text/event-stream' } })
}

test('initial generation uses a dedicated 210-second timeout', () => {
  assert.equal(GENERATION_TIMEOUT_MS, 210_000)
  assert.notEqual(GENERATION_TIMEOUT_MS, REPLAN_TIMEOUT_MS)
})

test('replan remains independently configured at 180 seconds', () => {
  assert.equal(REPLAN_TIMEOUT_MS, 180_000)
})

test('Explain Why has no shared generation or replan timeout constant', async () => {
  const source = await import('node:fs/promises').then((fs) => fs.readFile(new URL('../src/services/explanationApi.js', import.meta.url), 'utf8'))
  assert.doesNotMatch(source, /GENERATION_TIMEOUT_MS|REPLAN_TIMEOUT_MS/)
})

test('duplicate generation requests share exactly one POST', async () => {
  let calls = 0
  const fetchImpl = async () => { calls += 1; return jsonResponse(responseRoadmap) }
  const requestId = `duplicate:${crypto.randomUUID()}`
  const first = generateRoadmap(learner, requestId, { fetchImpl })
  const second = generateRoadmap(learner, requestId, { fetchImpl })
  assert.strictEqual(first, second)
  await first
  assert.equal(calls, 1)
})

test('generation does not automatically retry a failed request', async () => {
  let calls = 0
  const fetchImpl = async () => { calls += 1; return jsonResponse({ detail: 'Upstream failed.' }, 502) }
  await assert.rejects(generateRoadmap(learner, `no-retry:${crypto.randomUUID()}`, { fetchImpl }), GenerationApiError)
  assert.equal(calls, 1)
})

test('frontend timeout is distinct and does not mutate learner input', async () => {
  const snapshot = structuredClone(learner)
  const fetchImpl = (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
  })
  await assert.rejects(
    generateRoadmap(learner, `timeout:${crypto.randomUUID()}`, { fetchImpl, timeoutMs: 1 }),
    GenerationTimeoutError,
  )
  assert.deepEqual(learner, snapshot)
})

test('server 504 is not mislabeled as a frontend timeout', async () => {
  const fetchImpl = async () => jsonResponse({ detail: 'The upstream AI request timed out.' }, 504)
  await assert.rejects(
    generateRoadmap(learner, `server-504:${crypto.randomUUID()}`, { fetchImpl }),
    (error) => error instanceof GenerationApiError && error.kind === 'server-timeout' && error.status === 504 && !(error instanceof GenerationTimeoutError),
  )
})

test('a successful response before timeout is accepted once', async () => {
  let calls = 0
  const fetchImpl = async () => { calls += 1; return jsonResponse(responseRoadmap) }
  const result = await generateRoadmap(learner, `success:${crypto.randomUUID()}`, { fetchImpl, timeoutMs: 50 })
  assert.equal(calls, 1)
  assert.equal(result.goal, responseRoadmap.goal)
  assert.equal(result.confidenceScore, responseRoadmap.feasibilityScore)
})

test('streamed generation reports validated backend stages in order', async () => {
  const received = []
  const events = [
    { type: 'planner_started', data: { stage: 'planner' } },
    { type: 'planner_completed', data: { stage: 'planner' } },
    { type: 'critic_started', data: { stage: 'critic' } },
    { type: 'critic_completed', data: { stage: 'critic' } },
    { type: 'revision_started', data: { stage: 'revision' } },
    { type: 'revision_completed', data: { stage: 'revision' } },
    { type: 'completed', data: responseRoadmap },
  ]
  const result = await generateRoadmap(learner, `stream:${crypto.randomUUID()}`, {
    fetchImpl: async () => streamResponse(events),
    onProgress: (event) => received.push(event.type),
  })
  assert.deepEqual(received, events.map((event) => event.type))
  assert.equal(result.goal, responseRoadmap.goal)
})

test('stream failure preserves prior stage completion and does not retry', async () => {
  let calls = 0
  const received = []
  const fetchImpl = async () => {
    calls += 1
    return streamResponse([
      { type: 'planner_started', data: { stage: 'planner' } },
      { type: 'planner_completed', data: { stage: 'planner' } },
      { type: 'critic_started', data: { stage: 'critic' } },
      { type: 'failed', data: { stage: 'critic', detail: 'Critic validation failed.' } },
    ])
  }
  await assert.rejects(
    generateRoadmap(learner, `stream-failure:${crypto.randomUUID()}`, { fetchImpl, onProgress: (event) => received.push(event) }),
    (error) => error instanceof GenerationApiError && error.message === 'Critic validation failed.',
  )
  assert.equal(calls, 1)
  assert.equal(received.at(-1).stage, 'critic')
})

test('StrictMode duplicate subscriber receives progress from the single POST', async () => {
  let calls = 0
  const firstEvents = []
  const secondEvents = []
  const requestId = `strict-mode:${crypto.randomUUID()}`
  const fetchImpl = async () => {
    calls += 1
    await Promise.resolve()
    return streamResponse([
      { type: 'planner_started', data: { stage: 'planner' } },
      { type: 'completed', data: responseRoadmap },
    ])
  }
  const first = generateRoadmap(learner, requestId, { fetchImpl, onProgress: (event) => firstEvents.push(event.type) })
  const second = generateRoadmap(learner, requestId, { fetchImpl, onProgress: (event) => secondEvents.push(event.type) })
  await Promise.all([first, second])
  assert.equal(calls, 1)
  assert.deepEqual(firstEvents, ['planner_started', 'completed'])
  assert.deepEqual(secondEvents, ['planner_started', 'completed'])
})
