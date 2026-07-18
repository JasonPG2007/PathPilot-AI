import assert from 'node:assert/strict'
import test from 'node:test'
import { continueSavedJourney, getSavedJourneySummary } from '../src/lib/landingJourney.js'
import { learnerMemoryKey } from '../src/lib/learnerMemory.js'
import { confirmAndStartNewJourney, newJourneyReplacementMessage } from '../src/lib/newJourney.js'
import { roadmapStrategyStorageKey } from '../src/services/roadmapVariants.js'

class MemoryStorage {
  #items = new Map()
  getItem(key) { return this.#items.has(key) ? this.#items.get(key) : null }
  removeItem(key) { this.#items.delete(key) }
  setItem(key, value) { this.#items.set(key, String(value)) }
  clear() { this.#items.clear() }
}

globalThis.localStorage = new MemoryStorage()
globalThis.sessionStorage = new MemoryStorage()

const generatedAt = '2026-07-18T12:00:00.000Z'
const roadmap = {
  id: 'roadmap-landing',
  goal: 'Become an Industrial Engineer',
  timeline: '9 Months',
  weeklyHours: 8,
  phases: [{ id: 1, skills: ['Process analysis'], milestones: ['Map a workflow'] }],
}

function strategyEntry(strategyId, source = 'deterministic') {
  return { strategyId, source, roadmap, generatedAt, updatedAt: generatedAt }
}

function seedSavedJourney(selectedStrategy = 'balanced') {
  localStorage.setItem(roadmapStrategyStorageKey, JSON.stringify({
    version: 3,
    journeyId: 'journey-landing',
    selectedStrategy,
    canonicalBalancedRoadmap: roadmap,
    strategies: {
      balanced: strategyEntry('balanced', 'canonical'),
      fast: strategyEntry('fast'),
      deep: strategyEntry('deep'),
    },
    updatedAt: generatedAt,
  }))
  localStorage.setItem(learnerMemoryKey, JSON.stringify({
    version: 1,
    learnerProfile: { goal: roadmap.goal, level: 'Beginner', hours: 8, timeline: roadmap.timeline },
    roadmapId: roadmap.id,
    generatedAt,
    currentPhase: 1,
    completedSkillIds: [],
    completedMilestoneIds: [],
    weeklyHours: 8,
    lastUpdated: generatedAt,
  }))
}

test.beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

test('landing summary is absent when no saved roadmap exists', () => {
  assert.equal(getSavedJourneySummary(), null)
})

test('landing summary exposes a valid saved roadmap and selected strategy', () => {
  seedSavedJourney('deep')
  assert.deepEqual(getSavedJourneySummary(), {
    goal: roadmap.goal,
    selectedStrategy: 'deep',
    strategyName: 'Deep Mastery',
    lastUpdated: generatedAt,
  })
})

test('Continue Journey navigates directly to /roadmap', () => {
  const destinations = []
  continueSavedJourney((destination) => destinations.push(destination))
  assert.deepEqual(destinations, ['/roadmap'])
})

test('starting a new journey requires confirmation before replacing a saved roadmap', () => {
  seedSavedJourney()
  const destinations = []
  const messages = []
  const result = confirmAndStartNewJourney((...args) => destinations.push(args), {
    savedRoadmap: getSavedJourneySummary(),
    confirmReplacement: (message) => { messages.push(message); return false },
  })
  assert.equal(result, null)
  assert.deepEqual(destinations, [])
  assert.deepEqual(messages, [newJourneyReplacementMessage])
  assert.notEqual(localStorage.getItem(roadmapStrategyStorageKey), null)
})

test('confirmed new journey clears the saved journey and navigates to /create', () => {
  seedSavedJourney()
  const destinations = []
  confirmAndStartNewJourney((...args) => destinations.push(args), {
    savedRoadmap: getSavedJourneySummary(),
    confirmReplacement: () => true,
  })
  assert.equal(destinations[0][0], '/create')
  assert.equal(destinations[0][1].replace, true)
  assert.equal(localStorage.getItem(roadmapStrategyStorageKey), null)
})

test('malformed saved roadmap does not create a Continue Journey state', () => {
  localStorage.setItem(roadmapStrategyStorageKey, '{malformed')
  assert.equal(getSavedJourneySummary(), null)
})
