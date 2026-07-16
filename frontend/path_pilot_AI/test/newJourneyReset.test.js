import assert from 'node:assert/strict'
import test from 'node:test'
import { createGenerationId, startNewJourney } from '../src/lib/newJourney.js'
import { getMostRecentRoadmap, roadmapSessionKeys } from '../src/lib/roadmapSession.js'
import { learnerMemoryKey } from '../src/lib/learnerMemory.js'
import { roadmapStrategyStorageKey } from '../src/services/roadmapVariants.js'
import { explanationCacheKey } from '../src/services/explanationApi.js'

class MemoryStorage {
  constructor() { this.values = new Map() }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null }
  setItem(key, value) { this.values.set(key, String(value)) }
  removeItem(key) { this.values.delete(key) }
  clear() { this.values.clear() }
}

function seedJourney() {
  const generatedAt = '2026-01-01T00:00:00.000Z'
  const roadmapState = {
    source: 'api', generationId: 'old-generation', generatedAt,
    learner: { goal: 'Old goal' }, roadmap: { id: 'old-journey', phases: [] },
  }
  sessionStorage.setItem(roadmapSessionKeys.roadmap, JSON.stringify(roadmapState))
  sessionStorage.setItem(roadmapSessionKeys.attempt, JSON.stringify({ id: 'old-attempt', status: 'failed' }))
  localStorage.setItem(roadmapStrategyStorageKey, JSON.stringify({
    journeyId: 'old-generation', selectedStrategy: 'fast',
    strategies: { fast: { replannedAt: generatedAt, replanSummary: { whatChanged: 'Old replan' } } },
  }))
  localStorage.setItem(learnerMemoryKey, JSON.stringify({
    roadmapId: 'old-journey', completedSkillIds: ['phase:1:skill:0'], completedMilestoneIds: ['phase:1:milestone:0'],
  }))
  localStorage.setItem(explanationCacheKey, JSON.stringify({
    'old-generation:item-1': { explanation: 'Old journey explanation' },
    'unrelated-generation:item-2': { explanation: 'Unrelated explanation' },
  }))
  return roadmapState
}

test.beforeEach(() => {
  globalThis.sessionStorage = new MemoryStorage()
  globalThis.localStorage = new MemoryStorage()
})

test('Create New Journey clears active roadmap, strategy replans, and learner completion state', () => {
  seedJourney()
  let navigation
  startNewJourney((...args) => { navigation = args })

  assert.equal(sessionStorage.getItem(roadmapSessionKeys.roadmap), null)
  assert.equal(sessionStorage.getItem(roadmapSessionKeys.attempt), null)
  assert.equal(localStorage.getItem(roadmapStrategyStorageKey), null)
  assert.equal(localStorage.getItem(learnerMemoryKey), null)
  assert.equal(navigation[0], '/create')
  assert.equal(navigation[1].replace, true)
  assert.ok(navigation[1].state.newJourneyResetId)
})

test('old router roadmap state is rejected after a new journey reset', () => {
  const oldState = seedJourney()
  startNewJourney(() => {})
  assert.equal(getMostRecentRoadmap(oldState), null)
})

test('new generation IDs are unique', () => {
  assert.notEqual(createGenerationId(), createGenerationId())
})

test('journey-specific explanation cache remains intact for unrelated journeys', () => {
  seedJourney()
  const before = localStorage.getItem(explanationCacheKey)
  startNewJourney(() => {})
  assert.deepEqual(JSON.parse(localStorage.getItem(explanationCacheKey)), JSON.parse(before))
})
