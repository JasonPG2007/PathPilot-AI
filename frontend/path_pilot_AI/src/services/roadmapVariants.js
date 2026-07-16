import { formatTimeline, getPhaseMonthRange, parseTimelineMonths, scaleTimelineReferences as normalizeTimelineReferences } from '../lib/timelineFormat.js'

const STORAGE_KEY = 'pathpilotRoadmapStrategy:v1'
const STORE_VERSION = 3
const DETERMINISTIC_VARIANT_VERSION = 5

export function clearRoadmapStrategyState() {
  localStorage.removeItem(STORAGE_KEY)
}

export const roadmapStrategyStorageKey = STORAGE_KEY

export const strategyDefinitions = {
  fast: { name: 'Fast Track', label: 'Faster, higher risk', description: 'Reach portfolio readiness sooner with higher weekly intensity and less depth.' },
  balanced: { name: 'Balanced', label: 'Recommended balance', description: 'Maintain a realistic balance between speed, depth, and weekly workload.' },
  deep: { name: 'Deep Mastery', label: 'Deeper, lower risk', description: 'Build stronger foundations with a longer timeline and lower weekly pressure.' },
}

const riskOrder = ['Low', 'Medium', 'High']
const riskRanges = { Low: [75, 100], Medium: [45, 74], High: [0, 44] }

function devLog(message) {
  if (import.meta.env?.DEV) console.info(`[PathPilot] ${message}`)
}

function shiftRisk(risk, direction) {
  const index = Math.max(0, riskOrder.indexOf(risk))
  return riskOrder[Math.min(riskOrder.length - 1, Math.max(0, index + direction))]
}

function scoreForRisk(score, risk, adjustment) {
  const [minimum, maximum] = riskRanges[risk]
  return Math.min(maximum, Math.max(minimum, Math.round(score + adjustment)))
}

function getTimelineAmount(timeline) {
  const match = timeline.match(/(\d+(?:\.\d+)?)\s*(month|week)/i)
  return match ? { amount: Number(match[1]), unit: match[2].toLowerCase() } : null
}

function formatAmount(value) {
  return String(Math.round(value * 10) / 10)
}

function getPhaseDuration(timeline, phaseIndex, phaseCount) {
  const parsed = getTimelineAmount(timeline)
  if (!parsed) return `Stage ${phaseIndex + 1} of ${phaseCount}`
  const phaseLength = parsed.amount / phaseCount
  const end = phaseLength * (phaseIndex + 1)
  const start = phaseIndex === 0 ? 1 : phaseLength * phaseIndex + 0.1
  const label = parsed.unit === 'month' ? 'Months' : 'Weeks'
  return `${label} ${formatAmount(Math.min(start, end))}–${formatAmount(end)}`
}

function unique(items) {
  return [...new Set(items)]
}

const fastPhaseTitles = ['Role Essentials', 'Applied Production Build', 'Portfolio Launch']
const deepPhaseTitles = ['Foundations and First Principles', 'Rigorous Applied Practice', 'Validated Mastery']

function stablePrefix(items, ratio, minimum = 1) {
  return items.slice(0, Math.max(minimum, Math.ceil(items.length * ratio)))
}

function parseCompletedId(itemId, expectedType) {
  const match = String(itemId).match(/^phase:(\d+):(skill|milestone):(\d+)$/)
  if (!match || match[2] !== expectedType) return null
  return { phaseId: Number(match[1]), index: Number(match[3]) }
}

export function restoreCompletedRoadmapItems(roadmap, canonicalRoadmap, progress) {
  const requirements = new Map()
  for (const [type, ids] of [['skill', progress?.completedSkillIds], ['milestone', progress?.completedMilestoneIds]]) {
    for (const itemId of ids ?? []) {
      const parsed = parseCompletedId(itemId, type)
      if (!parsed) return { valid: false, reason: `Invalid completed ${type} ID ${itemId}.`, roadmap }
      const key = `${parsed.phaseId}:${type}`
      requirements.set(key, Math.max(requirements.get(key) ?? -1, parsed.index))
    }
  }

  let restored = false
  const phases = roadmap.phases.map((phase) => {
    const canonicalPhase = canonicalRoadmap.phases.find((candidate) => candidate.id === phase.id)
    if (!canonicalPhase) return phase
    const skills = [...phase.skills]
    const milestones = [...phase.milestones]
    for (const [type, target, source] of [['skill', skills, canonicalPhase.skills], ['milestone', milestones, canonicalPhase.milestones]]) {
      const requiredIndex = requirements.get(`${phase.id}:${type}`) ?? -1
      if (requiredIndex >= source.length) return phase
      for (let index = 0; index <= requiredIndex; index += 1) {
        if (target[index] !== source[index]) restored = true
        target[index] = source[index]
      }
    }
    return { ...phase, skills, milestones }
  })
  const repaired = { ...roadmap, phases }

  for (const [type, ids] of [['skill', progress?.completedSkillIds], ['milestone', progress?.completedMilestoneIds]]) {
    for (const itemId of ids ?? []) {
      const parsed = parseCompletedId(itemId, type)
      const phase = repaired.phases.find((candidate) => candidate.id === parsed.phaseId)
      const canonicalPhase = canonicalRoadmap.phases.find((candidate) => candidate.id === parsed.phaseId)
      const property = type === 'skill' ? 'skills' : 'milestones'
      if (!phase || !canonicalPhase || phase[property][parsed.index] !== canonicalPhase[property][parsed.index]) {
        return { valid: false, reason: `Completed ${type} ${itemId} could not be restored.`, roadmap: repaired }
      }
    }
  }

  if (restored) devLog('Completed roadmap item restored before replan.')
  return { valid: true, restored, roadmap: repaired }
}

function storedProgress() {
  if (typeof localStorage === 'undefined') return { completedSkillIds: [], completedMilestoneIds: [] }
  try {
    const memory = JSON.parse(localStorage.getItem('pathpilotLearnerMemory'))
    return { completedSkillIds: memory?.completedSkillIds ?? [], completedMilestoneIds: memory?.completedMilestoneIds ?? [] }
  } catch {
    return { completedSkillIds: [], completedMilestoneIds: [] }
  }
}

function deepAddition(phaseIndex) {
  const additions = [
    { skills: ['Prerequisite diagnostic and gap remediation', 'Mathematical foundations and reproducible environment audit'], prerequisite: 'Verified prerequisite baseline and reproducible local environment', milestone: 'Complete a prerequisite diagnostic, remediate documented gaps, and reproduce the foundation setup from a clean environment.' },
    { skills: ['Model error analysis and uncertainty', 'Statistical evaluation and experiment reproducibility'], prerequisite: 'Mathematical foundations review and documented experiment baseline', milestone: 'Run a reproducibility review with statistical evaluation, uncertainty notes, and documented failure cases.' },
    { skills: ['Reliability testing and monitoring', 'Technical documentation and architecture reflection'], prerequisite: 'Validated evaluation methodology and reproducible experiment results', milestone: 'Deliver reliability tests, monitoring evidence, failure analysis, and an architecture reflection with documented trade-offs.' },
  ]
  return additions[Math.min(phaseIndex, additions.length - 1)]
}

function withDeepContent(roadmap) {
  return {
    ...roadmap,
    phases: roadmap.phases.map((phase, phaseIndex) => {
      const addition = deepAddition(phaseIndex)
      const skills = unique([...phase.skills, ...addition.skills])
      const milestones = unique([...phase.milestones, addition.milestone])
      const baseProject = phase.project ?? phase.recommendedProject
      const project = {
        ...baseProject,
        description: /test|evaluation|reproduc|failure analysis/i.test(baseProject.description)
          ? baseProject.description
          : `${baseProject.description} Include a test suite, evaluation report, limitations section, reproducible setup, failure analysis, and documented trade-offs.`,
      }
      return {
        ...phase,
        skills,
        milestones,
        prerequisites: unique([...phase.prerequisites, addition.prerequisite]),
        skillIds: skills.map((skill, index) => {
          const deepIndex = addition.skills.indexOf(skill)
          return deepIndex >= 0 ? `phase:${phase.id}:deep:skill:${deepIndex}` : phase.skillIds?.[index]
        }),
        milestoneIds: milestones.map((milestone, index) => milestone === addition.milestone
          ? `phase:${phase.id}:deep:milestone:0`
          : phase.milestoneIds?.[index]),
        project,
        recommendedProject: project,
      }
    }),
  }
}

function hasCompleteDeepStructure(roadmap) {
  return roadmap.phases.every((phase, phaseIndex) => {
    const addition = deepAddition(phaseIndex)
    return addition.skills.every((skill) => phase.skills.includes(skill)) &&
      phase.milestones.includes(addition.milestone) &&
      /test|evaluation|reproduc|failure analysis/i.test(phase.project?.description ?? '')
  })
}

function transformProjects(projects, fast, multiplier, timeline) {
  return projects.map((project) => ({
    ...project,
    title: fast ? `${project.title}: Interview Edition` : `${project.title}: Reproducible Study`,
    category: fast ? 'SHIPPABLE PORTFOLIO' : 'TECHNICAL MASTERY',
    description: fast
      ? `${normalizeTimelineReferences(project.description, multiplier, timeline)} Ship a narrow working version with a live demo, production basics, and a concise interview walkthrough.`
      : `${normalizeTimelineReferences(project.description, multiplier, timeline)} Include automated testing, documented evaluation, reproducible setup, limitations, and a written technical reflection.`,
  }))
}

function createVariant(roadmap, strategy) {
  const fast = strategy === 'fast'
  const multiplier = fast ? 0.8 : 1.25
  const weeklyHours = Math.min(80, Math.max(1, fast ? Math.ceil(roadmap.weeklyHours * 1.15) : Math.floor(roadmap.weeklyHours * 0.85)))
  const riskLevel = shiftRisk(roadmap.criticReview.riskLevel, fast ? 1 : -1)
  const feasibilityScore = scoreForRisk(roadmap.feasibilityScore, riskLevel, fast ? -10 : 10)
  const baseMonths = parseTimelineMonths(roadmap.timeline) ?? Math.max(1, roadmap.phases.length)
  const timeline = formatTimeline(`${baseMonths * multiplier} Months`, fast ? 'Fast Track' : 'Deep Mastery')
  const suggestedProjects = transformProjects(roadmap.suggestedProjects, fast, multiplier, timeline)
  const phases = roadmap.phases.map((phase, phaseIndex) => {
    const addition = deepAddition(phaseIndex)
    const fastSkills = stablePrefix(phase.skills, 0.65)
    const fastMilestones = stablePrefix(phase.milestones, 0.6)
    const project = {
      ...phase.project,
      title: fast ? `${phase.project.title}: Shippable MVP` : `${phase.project.title}: Validated Study`,
      category: fast ? 'SHIPPABLE PORTFOLIO' : 'TECHNICAL MASTERY',
      type: fast ? 'INTERVIEW-READY BUILD' : 'RIGOROUS CAPSTONE',
      description: fast
        ? `${normalizeTimelineReferences(phase.project.description, multiplier, timeline)} Limit scope to the smallest deployable result, add production basics, and prepare evidence for interviews.`
        : `${normalizeTimelineReferences(phase.project.description, multiplier, timeline)} Require tests, evaluation evidence, reproducible setup, full documentation, and reflection on trade-offs.`,
    }
    return {
      ...phase,
      title: (fast ? fastPhaseTitles : deepPhaseTitles)[Math.min(phaseIndex, 2)],
      duration: getPhaseMonthRange(timeline, phaseIndex, roadmap.phases.length) || getPhaseDuration(timeline, phaseIndex, roadmap.phases.length),
      weeklyWorkload: `${weeklyHours} hours/week`,
      description: fast
        ? `Focus on the minimum essential capabilities needed to build, deploy, and explain credible portfolio evidence by ${getPhaseMonthRange(timeline, phaseIndex, roadmap.phases.length).toLowerCase()}.`
        : `Build durable understanding through prerequisite review, deliberate practice, controlled evaluation, and documented evidence during ${getPhaseMonthRange(timeline, phaseIndex, roadmap.phases.length).toLowerCase()}.`,
      skills: fast ? fastSkills : unique([...phase.skills, ...addition.skills]),
      prerequisites: [...phase.prerequisites],
      milestones: fast
        ? fastMilestones.map((milestone, milestoneIndex) => milestoneIndex === fastMilestones.length - 1
          ? `${normalizeTimelineReferences(milestone, multiplier, timeline)} Deliver a deployable artifact and interview-ready walkthrough.`
          : normalizeTimelineReferences(milestone, multiplier, timeline))
        : unique([...phase.milestones, addition.milestone]),
      recommendedProject: project,
      project,
    }
  })
  const variant = {
    ...roadmap,
    timeline,
    weeklyHours,
    feasibilityScore,
    confidenceScore: feasibilityScore,
    coachSummary: roadmap.coachSummary ? {
      ...roadmap.coachSummary,
      recommendedStrategy: fast ? 'Fast' : 'Deep',
    } : roadmap.coachSummary,
    phases,
    criticReview: {
      ...roadmap.criticReview,
      riskLevel,
      changesMade: unique([...roadmap.criticReview.changesMade, fast ? 'Compressed remaining work around practical delivery' : 'Added deeper practice and review checkpoints']),
      timelineAdjustments: fast ? 'Compressed by approximately 20% with earlier portfolio emphasis.' : 'Extended by approximately 25% for deeper practice and prerequisite review.',
    },
    suggestedProjects,
    projects: suggestedProjects,
  }
  return fast ? variant : withDeepContent(variant)
}

export function buildVariants(balancedRoadmap) {
  return { fast: createVariant(balancedRoadmap, 'fast'), balanced: balancedRoadmap, deep: createVariant(balancedRoadmap, 'deep') }
}

function createStrategyEntry(roadmap, generatedAt, strategyId, source = 'deterministic') {
  return {
    strategyId,
    source,
    variantVersion: source === 'deterministic' ? DETERMINISTIC_VARIANT_VERSION : null,
    roadmap,
    replanSummary: null,
    replannedAt: null,
    generatedAt,
    updatedWeeklyHours: roadmap.weeklyHours,
    updatedTimeline: roadmap.timeline,
    updatedRiskLevel: roadmap.criticReview.riskLevel,
    updatedFeasibilityScore: roadmap.feasibilityScore,
    updatedAt: generatedAt,
  }
}

function isValidEntry(entry) {
  return Boolean(
    entry?.roadmap?.phases &&
    Array.isArray(entry.roadmap.phases) &&
    strategyDefinitions[entry.strategyId] &&
    (entry.source === 'canonical' || entry.source === 'deterministic' || entry.source === 'replan'),
  )
}

function versionTime(value) {
  for (const timestamp of [value?.replannedAt, value?.generatedAt, value?.updatedAt]) {
    const parsed = Date.parse(timestamp)
    if (!Number.isNaN(parsed)) return parsed
  }
  return 0
}

function persist(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  return state
}

function createState(journeyId, canonicalBalancedRoadmap, generatedAt) {
  const variants = buildVariants(canonicalBalancedRoadmap)
  return {
    version: STORE_VERSION,
    journeyId,
    selectedStrategy: 'balanced',
    canonicalBalancedRoadmap,
    strategies: {
      balanced: createStrategyEntry(variants.balanced, generatedAt, 'balanced', 'canonical'),
      fast: createStrategyEntry(variants.fast, generatedAt, 'fast'),
      deep: createStrategyEntry(variants.deep, generatedAt, 'deep'),
    },
    updatedAt: generatedAt,
  }
}

function roadmapMatches(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function repairStrategyIsolation(state) {
  const balanced = state.strategies.balanced
  const variants = buildVariants(balanced.roadmap)
  const strategies = { ...state.strategies }
  const progress = storedProgress()

  for (const strategy of ['fast', 'deep']) {
    const expectedVariant = restoreCompletedRoadmapItems(variants[strategy], state.canonicalBalancedRoadmap, progress).roadmap
    let entry = strategies[strategy]
    if (strategy === 'deep' && isValidEntry(entry) && !hasCompleteDeepStructure(entry.roadmap)) {
      entry = { ...entry, roadmap: withDeepContent(entry.roadmap) }
      strategies[strategy] = entry
      devLog('shallow Deep Mastery roadmap repaired')
    }
    if (isValidEntry(entry)) {
      const repairedEntry = restoreCompletedRoadmapItems(entry.roadmap, state.canonicalBalancedRoadmap, progress)
      if (repairedEntry.valid && repairedEntry.restored) {
        entry = { ...entry, roadmap: repairedEntry.roadmap }
        strategies[strategy] = entry
      }
    }
    const sharesBalancedRoadmap = entry && roadmapMatches(entry.roadmap, balanced.roadmap)
    const sharesBalancedReplan = Boolean(
      balanced.replannedAt &&
      entry?.replannedAt === balanced.replannedAt &&
      JSON.stringify(entry?.replanSummary) === JSON.stringify(balanced.replanSummary),
    )
    const hasOwnReplan = isValidEntry(entry) && entry.source === 'replan' &&
      entry.strategyId === strategy && entry.replannedAt && entry.replanSummary
    const staleDeterministicVariant = entry?.source === 'deterministic' && (
      entry.variantVersion !== DETERMINISTIC_VARIANT_VERSION ||
      !roadmapMatches(entry.roadmap, expectedVariant)
    )

    if (!hasOwnReplan || sharesBalancedRoadmap || sharesBalancedReplan || staleDeterministicVariant) {
      if (sharesBalancedRoadmap || sharesBalancedReplan) devLog('cross-strategy stale state rejected')
      if (staleDeterministicVariant) devLog(`stale deterministic variant regenerated: ${strategy}`)
      strategies[strategy] = createStrategyEntry(expectedVariant, balanced.generatedAt, strategy)
      devLog(`fallback derivation performed: ${strategy}`)
    }
  }

  return { ...state, strategies }
}

function migrateState(stored, journeyId, fallbackRoadmap, generatedAt) {
  if (stored?.journeyId !== journeyId) return null
  const canonical = stored.canonicalBalancedRoadmap ?? stored.balancedRoadmap ?? fallbackRoadmap
  if (!canonical) return null

  const migrated = createState(journeyId, canonical, generatedAt)
  migrated.selectedStrategy = strategyDefinitions[stored.selectedStrategy] ? stored.selectedStrategy : 'balanced'
  migrated.updatedAt = stored.updatedAt ?? stored.lastUpdated ?? generatedAt

  for (const strategy of Object.keys(strategyDefinitions)) {
    const oldEntry = stored.strategies?.[strategy]
    const legacyRoadmap = strategy === 'balanced' ? stored.balancedRoadmap : stored.overrides?.[strategy]
    const roadmap = oldEntry?.roadmap ?? legacyRoadmap
    if (!roadmap) continue
    const summary = oldEntry?.replanSummary ?? stored.summaries?.[strategy] ?? null
    const replannedAt = oldEntry?.replannedAt ?? (summary ? stored.lastUpdated : null)
    const source = replannedAt && summary ? 'replan' : strategy === 'balanced' ? 'canonical' : 'deterministic'
    migrated.strategies[strategy] = {
      ...createStrategyEntry(roadmap, oldEntry?.generatedAt ?? generatedAt, strategy, source),
      replanSummary: source === 'replan' ? summary : null,
      replannedAt: source === 'replan' ? replannedAt : null,
      updatedWeeklyHours: oldEntry?.updatedWeeklyHours ?? roadmap.weeklyHours,
      updatedTimeline: oldEntry?.updatedTimeline ?? roadmap.timeline,
      updatedRiskLevel: oldEntry?.updatedRiskLevel ?? roadmap.criticReview.riskLevel,
      updatedFeasibilityScore: oldEntry?.updatedFeasibilityScore ?? roadmap.feasibilityScore,
      updatedAt: oldEntry?.updatedAt ?? replannedAt ?? generatedAt,
    }
  }

  return repairStrategyIsolation(migrated)
}

function reconcileSession(state, sessionState) {
  const wrongJourney = sessionState?.generationId
    ? sessionState.generationId !== state.journeyId
    : sessionState?.generatedAt !== state.strategies.balanced.generatedAt
  if (!sessionState || wrongJourney) {
    if (sessionState) devLog('stale state ignored')
    return state
  }
  if (sessionState.source !== 'replan') return state

  const strategy = strategyDefinitions[sessionState.strategy] ? sessionState.strategy : 'balanced'
  if (!sessionState.strategy) devLog('legacy strategy-less replan assigned to balanced')
  const currentEntry = state.strategies[strategy]
  if (versionTime(sessionState) <= versionTime(currentEntry)) {
    devLog('stale state ignored')
    return state
  }

  devLog('latest version selected')
  const reconciled = {
    ...state,
    strategies: {
      ...state.strategies,
      [strategy]: {
        strategyId: strategy,
        source: 'replan',
        roadmap: sessionState.roadmap,
        replanSummary: sessionState.replanSummary,
        replannedAt: sessionState.replannedAt,
        generatedAt: sessionState.generatedAt,
        updatedWeeklyHours: sessionState.updatedWeeklyHours,
        updatedTimeline: sessionState.updatedTimeline,
        updatedRiskLevel: sessionState.updatedRiskLevel,
        updatedFeasibilityScore: sessionState.updatedFeasibilityScore,
        updatedAt: sessionState.replannedAt,
      },
    },
    updatedAt: sessionState.replannedAt,
  }
  return strategy === 'balanced' ? repairStrategyIsolation(reconciled) : reconciled
}

export function loadStrategyState({ journeyId, canonicalBalancedRoadmap, generatedAt, sessionState }) {
  let stored = null
  try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { /* Replace invalid state. */ }
  const migrated = migrateState(stored, journeyId, canonicalBalancedRoadmap, generatedAt)
  const baseState = migrated ?? createState(journeyId, canonicalBalancedRoadmap, generatedAt)
  const restored = reconcileSession(baseState, sessionState)
  const selectedEntry = restored.strategies[restored.selectedStrategy]
  devLog('latest version selected')
  devLog(`selected strategy: ${restored.selectedStrategy}`)
  devLog(`${selectedEntry.source === 'replan' ? 'strategy override' : 'deterministic variant'} loaded: ${restored.selectedStrategy}`)
  if (selectedEntry.source === 'replan' && selectedEntry.replanSummary && selectedEntry.replannedAt) devLog('strategy replan summary restored')
  return persist(restored)
}

export function selectStrategy(state, selectedStrategy) {
  const next = { ...state, selectedStrategy, updatedAt: new Date().toISOString() }
  devLog(`strategy selected: ${selectedStrategy}`)
  const entry = next.strategies[selectedStrategy]
  devLog(`${entry.source === 'replan' ? 'strategy override' : 'deterministic variant'} loaded: ${selectedStrategy}`)
  devLog(`replan summary belongs to selected strategy: ${Boolean(entry.source === 'replan' && entry.replanSummary && entry.replannedAt)}`)
  return persist(next)
}

export function storeReplannedStrategy(state, strategy, roadmap, summary, replannedAt) {
  const entry = {
    strategyId: strategy,
    source: 'replan',
    roadmap,
    replanSummary: summary,
    replannedAt,
    generatedAt: state.strategies[strategy].generatedAt,
    updatedWeeklyHours: roadmap.weeklyHours,
    updatedTimeline: roadmap.timeline,
    updatedRiskLevel: roadmap.criticReview.riskLevel,
    updatedFeasibilityScore: roadmap.feasibilityScore,
    updatedAt: replannedAt,
  }
  const next = {
    ...state,
    selectedStrategy: strategy,
    strategies: { ...state.strategies, [strategy]: entry },
    updatedAt: replannedAt,
  }
  return persist(strategy === 'balanced' ? repairStrategyIsolation(next) : next)
}

export function getStrategyRoadmap(state) {
  const entry = state.strategies[state.selectedStrategy]
  if (isValidEntry(entry)) return entry.roadmap
  devLog(`fallback derivation performed: ${state.selectedStrategy}`)
  return buildVariants(state.strategies.balanced.roadmap)[state.selectedStrategy]
}

export function getStrategySummary(state) {
  const entry = state.strategies[state.selectedStrategy]
  const ownsSummary = entry?.source === 'replan' && entry.strategyId === state.selectedStrategy &&
    entry.replannedAt && entry.replanSummary
  devLog(`replan summary belongs to selected strategy: ${Boolean(ownsSummary)}`)
  return ownsSummary ? entry.replanSummary : null
}

export function getStrategyComparisons(state) {
  return Object.keys(strategyDefinitions).map((id) => {
    const roadmap = state.strategies[id].roadmap
    return { id, ...strategyDefinitions[id], timeline: roadmap.timeline, weeklyHours: roadmap.weeklyHours, riskLevel: roadmap.criticReview.riskLevel, feasibilityScore: roadmap.feasibilityScore }
  })
}
