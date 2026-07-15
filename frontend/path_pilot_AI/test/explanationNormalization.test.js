import assert from 'node:assert/strict'
import test from 'node:test'
import {
  explanationTextLimits,
  formatExplanationPanelTitle,
  getExplanationCacheId,
  getValidationProblemMessage,
  normalizeExplanationRequest,
  normalizeExplanationText,
} from '../src/services/explanationApi.js'

const longItem = `${'hands-on model evaluation '.repeat(20)}final recommendation`

test('long selected item is normalized to the backend 300-character limit', () => {
  const request = normalizeExplanationRequest({ learnerGoal: 'ML Engineer', currentPhaseTitle: 'Evaluation', selectedItem: longItem, previousItem: null, nextItem: null })
  assert.ok(request.selectedItem.length <= explanationTextLimits.selectedItem)
  assert.equal(/\s{2,}/.test(request.selectedItem), false)
})

test('normalization avoids cutting a word where a boundary is available', () => {
  const normalized = normalizeExplanationText(longItem, 300)
  const originalWords = longItem.trim().split(/\s+/)
  assert.ok(originalWords.includes(normalized.split(' ').at(-1)))
  assert.equal(longItem.replace(/\s+/g, ' ').startsWith(normalized), true)
})

test('stable cache identity is independent of truncated request text', () => {
  const before = getExplanationCacheId('generation-1', 'phase:2:milestone:4')
  normalizeExplanationRequest({ learnerGoal: 'Goal', currentPhaseTitle: 'Phase', selectedItem: longItem, previousItem: longItem, nextItem: longItem })
  assert.equal(getExplanationCacheId('generation-1', 'phase:2:milestone:4'), before)
})

test('panel title is display-only and no longer than 120 characters', () => {
  const title = formatExplanationPanelTitle(longItem)
  assert.ok(title.length <= explanationTextLimits.panelTitle)
  assert.ok(title.endsWith('…'))
})

test('first field-specific ValidationProblemDetails error is surfaced', () => {
  const problem = { title: 'Validation failed', errors: { SelectedItem: ['The selected recommendation is too long to explain.'], NextItem: ['Another error.'] } }
  assert.equal(getValidationProblemMessage(problem, 'Fallback'), 'The selected recommendation is too long to explain.')
})
