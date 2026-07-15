import resourceCatalog from '../data/resourceCatalog.js'

const aliases = {
  sql: ['postgresql', 'relational database', 'database design'],
  'machine learning': ['model training', 'model evaluation', 'classification', 'regression'],
  javascript: ['web development', 'frontend'],
  deployment: ['cloud computing', 'production basics', 'model deployment'],
  algorithms: ['data structures', 'complexity', 'problem solving'],
  nlp: ['transformers', 'large language models'],
}

const strategyTypes = {
  fast: ['hands-on tutorial', 'project-based course', 'official documentation', 'digital course'],
  balanced: ['official documentation', 'learning path', 'interactive course', 'hands-on tutorial'],
  deep: ['full university course', 'full course', 'technical course', 'official documentation'],
}

function normalize(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9+#.]+/g, ' ').trim()
}

function validUrl(url) {
  try { return new URL(url).protocol === 'https:' } catch { return false }
}

function conceptsFor(text) {
  const normalized = normalize(text)
  const concepts = new Set([normalized])
  for (const [concept, related] of Object.entries(aliases)) {
    if (normalized.includes(concept) || related.some((alias) => normalized.includes(alias))) {
      concepts.add(concept)
      related.forEach((alias) => concepts.add(alias))
    }
  }
  return concepts
}

function scoreResource(resource, context) {
  const skills = context.skills.map(normalize)
  const resourceSkills = resource.supportedSkills.map(normalize)
  const exact = skills.some((skill) => resourceSkills.some((supported) => skill === supported || skill.includes(supported) || supported.includes(skill)))
  const related = skills.some((skill) => [...conceptsFor(skill)].some((concept) => resourceSkills.some((supported) => conceptsFor(supported).has(concept))))
  const goal = normalize(context.goal)
  const goalMatch = resource.supportedGoals.some((supported) => goal.includes(normalize(supported)) || normalize(supported).includes(goal))
  const searchable = normalize(`${context.phaseTitle} ${context.projectTitle}`)
  const contextMatch = resourceSkills.some((skill) => searchable.includes(skill))
  const preferredTypeIndex = strategyTypes[context.strategy]?.indexOf(normalize(resource.resourceType)) ?? -1
  let score = exact ? 100 : related ? 65 : goalMatch ? 30 : 0
  if (contextMatch) score += 20
  if (preferredTypeIndex >= 0) score += 18 - preferredTypeIndex * 3
  const deepType = ['full university course', 'full course', 'technical course', 'official documentation'].includes(normalize(resource.resourceType))
  const practicalType = ['hands-on tutorial', 'project-based course', 'digital course'].includes(normalize(resource.resourceType))
  if (context.strategy === 'deep') score += deepType ? 55 : practicalType ? -18 : 0
  if (context.strategy === 'fast') score += practicalType ? 30 : deepType ? -12 : 0
  if (context.strategy === 'balanced' && normalize(resource.resourceType) === 'full university course') score -= 12
  if (resource.freeOrPaid === 'Free') score += 8
  if (normalize(resource.resourceType) === 'official documentation') score += context.strategy === 'fast' ? 4 : 10
  if (normalize(resource.difficulty) === normalize(context.level)) score += 4
  return { score, match: exact ? skills.find((skill) => resourceSkills.some((supported) => skill.includes(supported) || supported.includes(skill))) : related ? 'related concepts' : goalMatch ? 'learner goal' : 'phase context' }
}

function reasonFor(resource, context, match) {
  const skillLabel = context.skills.find((skill) => normalize(skill).includes(match) || match.includes(normalize(skill)))
  if (context.strategy === 'fast' && ['Hands-on tutorial', 'Project-based course', 'Digital course'].includes(resource.resourceType)) return `Selected for Fast Track because it offers practical, shippable practice${skillLabel ? ` for ${skillLabel}` : ''}.`
  if (context.strategy === 'deep' && ['Full university course', 'Full course', 'Technical course'].includes(resource.resourceType)) return `Selected for Deep Mastery because it provides stronger theory, exercises, and assessment${skillLabel ? ` for ${skillLabel}` : ''}.`
  if (skillLabel) return `Matches your ${skillLabel} skill in ${context.phaseTitle}.`
  return `Recommended for ${context.phaseTitle} because it supports your ${context.goal} goal.`
}

export function recommendResourcesForPhase(context, excludedIds = new Set()) {
  const ranked = resourceCatalog
    .filter((resource) => validUrl(resource.url))
    .map((resource) => ({ resource, ...scoreResource(resource, context) }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score || left.resource.id.localeCompare(right.resource.id))
  const preferred = [...ranked.filter(({ resource }) => !excludedIds.has(resource.id)), ...ranked.filter(({ resource }) => excludedIds.has(resource.id))]
  const unique = new Map()
  for (const candidate of preferred) {
    if (!unique.has(candidate.resource.id)) unique.set(candidate.resource.id, candidate)
  }
  return [...unique.values()].slice(0, 3).map(({ resource, match }) => ({ ...resource, matchLabel: match, recommendationReason: reasonFor(resource, context, match) }))
}

export function recommendResourcesForRoadmap({ roadmap, learner, strategy }) {
  const byPhase = {}
  let previousIds = new Set()
  for (const phase of roadmap.phases) {
    const resources = recommendResourcesForPhase({ goal: learner.goal, level: learner.level, strategy, phaseTitle: phase.title, projectTitle: phase.project?.title, skills: phase.skills }, previousIds)
    byPhase[phase.id] = resources
    previousIds = new Set(resources.map((resource) => resource.id))
  }
  return { byPhase, highlights: roadmap.phases.map((phase) => byPhase[phase.id]?.[0]).filter(Boolean) }
}
