import assert from 'node:assert/strict'
import test from 'node:test'
import { copyShareText, createRoadmapShareSummary, getSharePanelAccessibility, getShareUrl, shareNatively, SUMMARY_LIMIT } from '../src/services/roadmapShare.js'

const details = {
  goal: 'Become a Data Analyst', strategy: 'Balanced', timeline: '9 Months', weeklyHours: 7,
  completionPercentage: 19, currentPhase: 'Foundations', nextAction: 'Complete SQL milestone',
  feasibilityScore: 82, riskLevel: 'Low',
}

test('share summary contains current roadmap details', () => {
  const summary = createRoadmapShareSummary(details, 'https://pathpilot.example/roadmap')
  assert.match(summary, /Goal: Become a Data Analyst/)
  assert.match(summary, /Strategy: Balanced/)
  assert.match(summary, /Progress: 19%/)
  assert.match(summary, /Next up: Complete SQL milestone/)
  assert.match(summary, /Feasibility: 82% — Low risk/)
})

test('share summary never exceeds 700 characters', () => {
  const summary = createRoadmapShareSummary({ ...details, goal: 'A very long private goal '.repeat(100) }, 'https://pathpilot.example/roadmap')
  assert.ok(summary.length <= SUMMARY_LIMIT)
})

test('share URL preserves route without query-string learner data', () => {
  const url = getShareUrl({ origin: 'https://pathpilot.example', pathname: '/roadmap', search: '?goal=private', hash: '#current' })
  assert.equal(url, 'https://pathpilot.example/roadmap#current')
  assert.equal(url.includes('private'), false)
})

test('native share uses the supported browser path', async () => {
  let shared
  const result = await shareNatively({ title: 'Roadmap', url: 'https://example.com/roadmap' }, { share: async (data) => { shared = data } })
  assert.equal(result.status, 'shared')
  assert.equal(shared.title, 'Roadmap')
})

test('native share reports the unsupported fallback path', async () => {
  assert.deepEqual(await shareNatively({}, {}), { status: 'unsupported' })
})

test('clipboard success writes the requested text', async () => {
  let copied
  assert.equal(await copyShareText('summary', { writeText: async (value) => { copied = value } }), true)
  assert.equal(copied, 'summary')
})

test('clipboard failure is surfaced to the caller', async () => {
  await assert.rejects(copyShareText('summary', { writeText: async () => { throw new Error('Denied') } }), /Denied/)
})

test('share panel exposes modal dialog accessibility state', () => {
  assert.deepEqual(getSharePanelAccessibility(), { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'share-roadmap-title' })
})
