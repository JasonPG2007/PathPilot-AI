import assert from 'node:assert/strict'
import test from 'node:test'
import { learnerMemoryKey } from '../src/lib/learnerMemory.js'
import { restorePersistedRoadmap } from '../src/lib/roadmapHydration.js'
import { roadmapStrategyStorageKey } from '../src/services/roadmapVariants.js'

class MemoryStorage {
  #items = new Map()

  getItem(key) { return this.#items.has(key) ? this.#items.get(key) : null }
  removeItem(key) { this.#items.delete(key) }
  setItem(key, value) { this.#items.set(key, String(value)) }
  clear() { this.#items.clear() }
}

globalThis.localStorage = new MemoryStorage()

const generatedAt = '2026-07-18T12:00:00.000Z'
const roadmap = {
  id: 'roadmap-123',
  goal: 'Become an Industrial Engineer',
  timeline: '9 Months',
  weeklyHours: 8,
  phases: [{ id: 1, skills: ['Process analysis'], milestones: ['Map a workflow'] }],
}

function entry(strategyId, source = 'deterministic') {
  return { strategyId, source, roadmap, generatedAt }
}

function seed({ journeyId = 'journey-123', selectedStrategy = 'balanced', memoryRoadmapId = roadmap.id, version = 3 } = {}) {
  localStorage.setItem(roadmapStrategyStorageKey, JSON.stringify({
    version,
    journeyId,
    selectedStrategy,
    canonicalBalancedRoadmap: roadmap,
    strategies: {
      balanced: entry('balanced', 'canonical'),
      fast: entry('fast'),
      deep: entry('deep'),
    },
    updatedAt: generatedAt,
  }))
  localStorage.setItem(learnerMemoryKey, JSON.stringify({
    version: 1,
    learnerProfile: { goal: roadmap.goal, level: 'Beginner', hours: 8, timeline: roadmap.timeline },
    roadmapId: memoryRoadmapId,
    generatedAt,
    currentPhase: 1,
    completedSkillIds: [],
    completedMilestoneIds: [],
    weeklyHours: 8,
    lastUpdated: generatedAt,
  }))
}

test.beforeEach(() => localStorage.clear())

test('direct /roadmap load restores a valid persisted canonical roadmap', () => {
  seed()
  const restored = restorePersistedRoadmap()
  assert.equal(restored.generationId, 'journey-123')
  assert.deepEqual(restored.roadmap, roadmap)
  assert.equal(restored.learner.goal, roadmap.goal)
})

test('browser-style reload restores the same saved journey repeatedly', () => {
  seed()
  const beforeReload = restorePersistedRoadmap()
  const afterReload = restorePersistedRoadmap()
  assert.deepEqual(afterReload, beforeReload)
})

test('missing saved roadmap returns no restoration candidate', () => {
  assert.equal(restorePersistedRoadmap(), null)
})

test('malformed or incompatible saved roadmap fails safely', () => {
  localStorage.setItem(roadmapStrategyStorageKey, '{not-json')
  assert.equal(restorePersistedRoadmap(), null)

  seed({ version: 99 })
  assert.equal(restorePersistedRoadmap(), null)
})

test('journeyId and learner-memory identity mismatches are rejected', () => {
  seed()
  assert.equal(restorePersistedRoadmap('different-journey'), null)

  seed({ memoryRoadmapId: 'different-roadmap' })
  assert.equal(restorePersistedRoadmap(), null)
})

test('selected strategy is restored with the active journey', () => {
  seed({ selectedStrategy: 'deep' })
  const restored = restorePersistedRoadmap()
  assert.equal(restored.selectedStrategy, 'deep')
})
