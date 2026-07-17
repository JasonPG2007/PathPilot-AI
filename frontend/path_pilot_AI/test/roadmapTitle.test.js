import test from 'node:test'
import assert from 'node:assert/strict'

import { getRoadmapDisplayTitle, getRoadmapOutcome, roadmapTitleLimits } from '../src/lib/roadmapTitle.js'

test('short learner goal remains the roadmap title', () => {
  assert.equal(getRoadmapDisplayTitle('Verbose generated alternative', 'Become an Industrial Engineer'), 'Become an Industrial Engineer')
})

test('long learner goal derives a bounded title without cutting a word', () => {
  const goal = 'Become an industrial engineer specializing in manufacturing systems optimization and sustainable service operations using detailed analytical methods'
  const title = getRoadmapDisplayTitle('', goal)
  assert.ok(title.split(' ').length <= roadmapTitleLimits.words)
  assert.ok(title.length <= roadmapTitleLimits.characters)
  assert.ok(!title.endsWith(' '))
})

test('AI title over twelve words falls back to the concise learner goal', () => {
  const generated = 'Build entry level analytical industrial engineering capability for manufacturing and service operations using Python SQL projects and validation criteria'
  assert.equal(getRoadmapDisplayTitle(generated, 'Become an Industrial Engineer'), 'Become an Industrial Engineer')
})

test('legacy oversized title renders a concise heading while preserving its detail', () => {
  const legacy = 'Build entry-level analytical industrial engineering capability for manufacturing or service operations using Python and SQL with portfolio projects and validation criteria.'
  const title = getRoadmapDisplayTitle(legacy, 'Become an Industrial Engineer')
  assert.equal(title, 'Become an Industrial Engineer')
  assert.equal(getRoadmapOutcome('', legacy, title), legacy)
})
