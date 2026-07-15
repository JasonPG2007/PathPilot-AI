const STORAGE_KEY = 'pathpilotRoadmapStrategy:v1'

export const strategyDefinitions = {
  fast: {
    name: 'Fast Track',
    label: 'Faster, higher risk',
    description: 'Reach portfolio readiness sooner with higher weekly intensity and less depth.',
  },
  balanced: {
    name: 'Balanced',
    label: 'Recommended balance',
    description: 'Maintain a realistic balance between speed, depth, and weekly workload.',
  },
  deep: {
    name: 'Deep Mastery',
    label: 'Deeper, lower risk',
    description: 'Build stronger foundations with a longer timeline and lower weekly pressure.',
  },
}

const riskOrder = ['Low', 'Medium', 'High']
const riskRanges = { Low: [75, 100], Medium: [45, 74], High: [0, 44] }

function shiftRisk(risk, direction) {
  const index = Math.max(0, riskOrder.indexOf(risk))
  return riskOrder[Math.min(riskOrder.length - 1, Math.max(0, index + direction))]
}

function scoreForRisk(score, risk, adjustment) {
  const [minimum, maximum] = riskRanges[risk]
  return Math.min(maximum, Math.max(minimum, Math.round(score + adjustment)))
}

function scaleTimeline(timeline, multiplier, suffix) {
  const match = timeline.match(/(\d+)\s*(month|week)/i)
  if (!match) return `${timeline} (${suffix})`
  const amount = Math.max(1, Math.round(Number(match[1]) * multiplier * 10) / 10)
  const unit = match[2].toLowerCase()
  return `${amount} ${unit}${amount === 1 ? '' : 's'} (${suffix})`
}

function scaleDuration(duration, multiplier) {
  return duration.replace(/\d+/g, (value) => String(Math.max(1, Math.round(Number(value) * multiplier))))
}

function unique(items) {
  return [...new Set(items)]
}

function transformProjects(projects, strategy) {
  return projects.map((project) => ({
    ...project,
    description: strategy === 'fast'
      ? `${project.description} Prioritize a focused, portfolio-ready release.`
      : `${project.description} Add deeper validation, reflection, and documentation.`,
  }))
}

function createVariant(roadmap, strategy) {
  const fast = strategy === 'fast'
  const multiplier = fast ? 0.8 : 1.25
  const weeklyHours = Math.min(80, Math.max(1, fast ? Math.ceil(roadmap.weeklyHours * 1.15) : Math.floor(roadmap.weeklyHours * 0.85)))
  const riskLevel = shiftRisk(roadmap.criticReview.riskLevel, fast ? 1 : -1)
  const feasibilityScore = scoreForRisk(roadmap.feasibilityScore, riskLevel, fast ? -10 : 10)
  const suggestedProjects = transformProjects(roadmap.suggestedProjects, strategy)

  const phases = roadmap.phases.map((phase) => {
    const project = {
      ...phase.project,
      type: fast ? `${phase.project.type} · accelerated` : `${phase.project.type} · extended`,
    }
    return {
      ...phase,
      duration: scaleDuration(phase.duration, multiplier),
      weeklyWorkload: `${weeklyHours} hours/week`,
      description: fast
        ? `${phase.description} Emphasize practical application and bring portfolio evidence forward.`
        : `${phase.description} Strengthen theory, prerequisite review, and deliberate practice.`,
      skills: [...phase.skills],
      prerequisites: [...phase.prerequisites],
      milestones: phase.milestones.map((milestone) => fast
        ? `${milestone} · accelerated portfolio checkpoint`
        : `${milestone} · deep practice and review`),
      recommendedProject: project,
      project,
    }
  })

  return {
    ...roadmap,
    timeline: scaleTimeline(roadmap.timeline, multiplier, fast ? 'Fast Track' : 'Deep Mastery'),
    weeklyHours,
    feasibilityScore,
    confidenceScore: feasibilityScore,
    phases,
    criticReview: {
      ...roadmap.criticReview,
      riskLevel,
      changesMade: unique([
        ...roadmap.criticReview.changesMade,
        fast ? 'Compressed remaining work around practical delivery' : 'Added deeper practice and review checkpoints',
      ]),
      timelineAdjustments: fast
        ? 'Compressed by approximately 20% with earlier portfolio emphasis.'
        : 'Extended by approximately 25% for deeper practice and prerequisite review.',
    },
    suggestedProjects,
    projects: suggestedProjects,
  }
}

export function buildVariants(balancedRoadmap) {
  return {
    fast: createVariant(balancedRoadmap, 'fast'),
    balanced: balancedRoadmap,
    deep: createVariant(balancedRoadmap, 'deep'),
  }
}

function persist(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  return state
}

export function loadStrategyState(journeyId, balancedRoadmap) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (stored?.journeyId === journeyId && strategyDefinitions[stored.selectedStrategy] && stored.balancedRoadmap) {
      return stored
    }
  } catch {
    // Invalid strategy state is replaced below.
  }
  return persist({
    journeyId,
    selectedStrategy: 'balanced',
    balancedRoadmap,
    overrides: {},
    summaries: {},
    lastUpdated: new Date().toISOString(),
  })
}

export function selectStrategy(state, selectedStrategy) {
  return persist({ ...state, selectedStrategy, lastUpdated: new Date().toISOString() })
}

export function storeReplannedStrategy(state, strategy, roadmap, summary) {
  const next = strategy === 'balanced'
    ? { ...state, balancedRoadmap: roadmap }
    : { ...state, overrides: { ...state.overrides, [strategy]: roadmap } }
  return persist({
    ...next,
    selectedStrategy: strategy,
    summaries: { ...state.summaries, [strategy]: summary },
    lastUpdated: new Date().toISOString(),
  })
}

export function getStrategyRoadmap(state) {
  return state.overrides[state.selectedStrategy] ?? buildVariants(state.balancedRoadmap)[state.selectedStrategy]
}

export function getStrategyComparisons(state) {
  const variants = buildVariants(state.balancedRoadmap)
  return Object.keys(strategyDefinitions).map((id) => {
    const roadmap = state.overrides[id] ?? variants[id]
    return {
      id,
      ...strategyDefinitions[id],
      timeline: roadmap.timeline,
      weeklyHours: roadmap.weeklyHours,
      riskLevel: roadmap.criticReview.riskLevel,
      feasibilityScore: roadmap.feasibilityScore,
    }
  })
}
