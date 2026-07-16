import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiagramProject } from '@fortawesome/free-solid-svg-icons'
import CriticReviewCard from '../components/roadmap/CriticReviewCard.jsx'
import CoachSummaryCard from '../components/roadmap/CoachSummaryCard.jsx'
import AchievementsSection from '../components/roadmap/AchievementsSection.jsx'
import ExplanationPanel from '../components/roadmap/ExplanationPanel.jsx'
import JourneyDashboard from '../components/roadmap/JourneyDashboard.jsx'
import ProjectCard from '../components/roadmap/ProjectCard.jsx'
import ReplanJourneyPanel from '../components/roadmap/ReplanJourneyPanel.jsx'
import ReplanSummary from '../components/roadmap/ReplanSummary.jsx'
import RoadmapActions from '../components/roadmap/RoadmapActions.jsx'
import RoadmapHeader from '../components/roadmap/RoadmapHeader.jsx'
import RoadmapStrategySelector from '../components/roadmap/RoadmapStrategySelector.jsx'
import RoadmapTimeline from '../components/roadmap/RoadmapTimeline.jsx'
import TrustedResourcesSection from '../components/roadmap/TrustedResourcesSection.jsx'
import { getMostRecentRoadmap, getStoredRoadmap, hasActiveGenerationAttempt, storeReplannedRoadmap } from '../lib/roadmapSession.js'
import { getMilestoneId, getSkillId, loadLearnerMemory, resetLearnerProgress, toggleCompletion, updateLearnerConstraints } from '../lib/learnerMemory.js'
import { buildJourneyDashboard } from '../lib/journeyDashboard.js'
import { formatTimeline } from '../lib/timelineFormat.js'
import { startNewJourney } from '../lib/newJourney.js'
import { requestReplan } from '../services/replanApi.js'
import { getCachedExplanationItemIds, requestExplanation } from '../services/explanationApi.js'
import { addExplanationView, addStrategyView, addSuccessfulReplan, evaluateAchievements, evaluateAndStoreAchievements, loadAchievementState } from '../services/achievements.js'
import { recommendResourcesForRoadmap } from '../services/resourceRecommendations.js'
import { getStrategyComparisons, getStrategyRoadmap, getStrategySummary, loadStrategyState, selectStrategy, storeReplannedStrategy } from '../services/roadmapVariants.js'
import '../styles/roadmap.css'

function hasReplanMetadata(strategyState) {
  return Object.values(strategyState?.strategies ?? {}).some((entry) => entry?.replannedAt && entry?.replanSummary)
}

function RoadmapPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const storedState = hasActiveGenerationAttempt() ? null : getStoredRoadmap()
  const activeState = getMostRecentRoadmap(location.state, storedState)
  const initialLearner = activeState?.learner
  const initialRoadmap = activeState?.roadmap
  const generatedAt = activeState?.generatedAt
  const generationId = activeState?.generationId
  const journeyId = generationId ?? generatedAt
  const [strategyState, setStrategyState] = useState(() => journeyId && initialRoadmap ? loadStrategyState({ journeyId, canonicalBalancedRoadmap: initialRoadmap, generatedAt, sessionState: activeState }) : null)
  const roadmap = strategyState ? getStrategyRoadmap(strategyState) : null
  const selectedStrategy = strategyState?.selectedStrategy
  const replanSummary = strategyState ? getStrategySummary(strategyState) : null
  const [learner, setLearner] = useState(initialLearner)
  const [replanOpen, setReplanOpen] = useState(false)
  const [replanPending, setReplanPending] = useState(false)
  const replanInFlight = useRef(false)
  const [replanError, setReplanError] = useState('')
  const [explanationContext, setExplanationContext] = useState(null)
  const [explanation, setExplanation] = useState(null)
  const [explanationError, setExplanationError] = useState('')
  const [explanationLoading, setExplanationLoading] = useState(false)
  const displayLearner = learner && roadmap ? { ...learner, hours: roadmap.weeklyHours, timeline: formatTimeline(roadmap.timeline) } : learner
  const memoryContext = displayLearner && roadmap && generatedAt ? { learner: displayLearner, roadmap, generatedAt } : null
  const [memory, setMemory] = useState(() => memoryContext ? loadLearnerMemory(memoryContext) : null)
  const [achievementState, setAchievementState] = useState(() => {
    if (!journeyId || !roadmap || !memory || !selectedStrategy) return null
    let state = addStrategyView(loadAchievementState(journeyId), selectedStrategy)
    for (const itemId of getCachedExplanationItemIds(journeyId)) state = addExplanationView(state, itemId)
    if (hasReplanMetadata(strategyState) && state.replanCount === 0) state = addSuccessfulReplan(state)
    return evaluateAndStoreAchievements({ state, roadmap, memory, hasReplan: hasReplanMetadata(strategyState) }).state
  })
  const [achievementAnnouncement, setAchievementAnnouncement] = useState('')

  if (!displayLearner || !roadmap || !memory || !memoryContext || !strategyState || !achievementState) {
    return (
      <div className="roadmap-page roadmap-empty-state" role="status">
        <p className="roadmap-kicker">NO ROADMAP FOUND</p>
        <h1>Create your first learning journey.</h1>
        <p>No active roadmap was found. Create a journey to generate a new learning plan.</p>
        <Link className="button" to="/create">Create Journey</Link>
      </div>
    )
  }

  const dashboard = buildJourneyDashboard({ roadmap, memory, strategy: selectedStrategy })
  const progress = dashboard.progress
  const currentPhaseIndex = dashboard.currentPhase - 1
  const resourceRecommendations = recommendResourcesForRoadmap({ roadmap, learner: displayLearner, strategy: selectedStrategy })
  const achievementResult = evaluateAchievements({ state: achievementState, roadmap, memory, hasReplan: hasReplanMetadata(strategyState) })

  function commitAchievements(state, targetRoadmap = roadmap, targetMemory = memory, hasReplan = hasReplanMetadata(strategyState)) {
    const result = evaluateAndStoreAchievements({ state, roadmap: targetRoadmap, memory: targetMemory, hasReplan })
    setAchievementState(result.state)
    if (result.newlyEarned.length) {
      const titles = result.badges.filter((badge) => result.newlyEarned.includes(badge.id)).map((badge) => badge.title)
      setAchievementAnnouncement(`Achievement unlocked: ${titles.join(', ')}`)
      window.setTimeout(() => setAchievementAnnouncement(''), 4500)
    }
  }

  function handleToggle(type, id) {
    const nextMemory = toggleCompletion(memory, roadmap, type, id)
    setMemory(nextMemory)
    commitAchievements(achievementState, roadmap, nextMemory)
  }

  function handleResetProgress() {
    if (window.confirm('Reset all completed skills and milestones for this roadmap?')) {
      const nextMemory = resetLearnerProgress(memoryContext)
      setMemory(nextMemory)
      commitAchievements(achievementState, roadmap, nextMemory)
    }
  }

  function handleStrategyChange(strategy) {
    const nextState = selectStrategy(strategyState, strategy)
    setStrategyState(nextState)
    commitAchievements(addStrategyView(achievementState, strategy), getStrategyRoadmap(nextState), memory, hasReplanMetadata(nextState))
  }

  const completedSkillSet = new Set(memory.completedSkillIds)
  const completedMilestoneSet = new Set(memory.completedMilestoneIds)
  const completedSkills = roadmap.phases.flatMap((phase) => phase.skills.filter((_, index) => completedSkillSet.has(getSkillId(phase.id, index, phase.skillIds?.[index]))))
  const completedMilestones = roadmap.phases.flatMap((phase) => phase.milestones.filter((_, index) => completedMilestoneSet.has(getMilestoneId(phase.id, index, phase.milestoneIds?.[index]))))

  async function handleReplan(constraints) {
    if (replanInFlight.current) return
    replanInFlight.current = true
    setReplanPending(true)
    setReplanError('')
    try {
      const revisedRoadmap = await requestReplan({ learner: displayLearner, roadmap, canonicalRoadmap: strategyState.canonicalBalancedRoadmap, memory, constraints })
      const updatedLearner = { ...learner, hours: constraints.weeklyHours, timeline: constraints.timeline }
      const summary = {
        whatChanged: `The plan was rebalanced from ${displayLearner.hours} to ${constraints.weeklyHours} weekly hours.`,
        why: constraints.note ? `${constraints.mainDifficulty}: ${constraints.note}` : constraints.mainDifficulty,
        timeline: constraints.timeline,
        weeklyHours: constraints.weeklyHours,
        riskLevel: revisedRoadmap.criticReview.riskLevel,
        confidenceScore: revisedRoadmap.feasibilityScore,
      }
      const replannedAt = new Date().toISOString()
      setLearner(updatedLearner)
      const nextStrategyState = storeReplannedStrategy(strategyState, selectedStrategy, revisedRoadmap, summary, replannedAt)
      const nextMemory = updateLearnerConstraints(memory, updatedLearner, constraints.weeklyHours)
      setStrategyState(nextStrategyState)
      setMemory(nextMemory)
      commitAchievements(addSuccessfulReplan(achievementState), revisedRoadmap, nextMemory, true)
      const replannedState = storeReplannedRoadmap({ learner: updatedLearner, roadmap: revisedRoadmap, generationId, generatedAt, replanSummary: summary, replannedAt, strategy: selectedStrategy })
      navigate('/roadmap', { replace: true, state: replannedState })
      setReplanOpen(false)
    } catch (error) {
      setReplanError(error.message)
    } finally {
      replanInFlight.current = false
      setReplanPending(false)
    }
  }

  async function loadExplanation(context) {
    setExplanationLoading(true)
    setExplanationError('')
    setExplanation(null)
    try {
      const result = await requestExplanation({
        generationId: generationId ?? generatedAt,
        itemId: context.itemId,
        request: {
          learnerGoal: displayLearner.goal,
          currentPhaseTitle: context.phaseTitle,
          selectedItem: context.selectedItem,
          previousItem: context.previousItem,
          nextItem: context.nextItem,
        },
      })
      setExplanation(result)
    } catch (error) {
      setExplanationError(error.message)
    } finally {
      setExplanationLoading(false)
    }
  }

  function handleExplain(context) {
    setExplanationContext(context)
    commitAchievements(addExplanationView(achievementState, context.itemId))
    loadExplanation(context)
  }

  async function handleDownloadPdf() {
    const { downloadRoadmapPdf } = await import('../services/roadmapPdf.js')
    await downloadRoadmapPdf({
      learner: displayLearner,
      roadmap,
      strategy: selectedStrategy,
      progress,
      currentPhase: currentPhaseIndex + 1,
      dashboard,
      achievements: achievementResult.badges,
      generatedAt,
      resourcesByPhase: resourceRecommendations.byPhase,
    })
  }

  return (
    <div className="roadmap-page">
      <RoadmapHeader goal={roadmap.goal} />
      <CoachSummaryCard summary={roadmap.coachSummary} />
      <JourneyDashboard dashboard={dashboard} />
      <AchievementsSection announcement={achievementAnnouncement} badges={achievementResult.badges} />
      <RoadmapStrategySelector comparisons={getStrategyComparisons(strategyState)} onChange={handleStrategyChange} selectedStrategy={selectedStrategy} />
      {replanSummary && <ReplanSummary summary={replanSummary} />}
      <div className="roadmap-content-grid roadmap-variant-transition" key={`timeline-${selectedStrategy}`}>
        <RoadmapTimeline memory={memory} onExplain={handleExplain} onToggleMilestone={(id) => handleToggle('milestone', id)} onToggleSkill={(id) => handleToggle('skill', id)} phases={roadmap.phases} resourcesByPhase={resourceRecommendations.byPhase} />
        <aside className="roadmap-sidebar">
          <CriticReviewCard review={roadmap.criticReview} />
          <div className="skill-vault-card">
            <h2>Skill Vault</h2><p>Focus-area readiness</p>
            {roadmap.skillVault.map((skill) => (
              <div className="skill-meter" key={skill.label}>
                <div><span>{skill.label}</span><strong>{skill.score}%</strong></div>
                <div><span style={{ width: `${skill.score}%` }} /></div>
              </div>
            ))}
          </div>
        </aside>
      </div>
      <section className="projects-section roadmap-variant-transition" key={`projects-${selectedStrategy}`}>
        <div className="roadmap-section-heading"><div><span><FontAwesomeIcon aria-hidden="true" icon={faDiagramProject} /></span><h2>Suggested Portfolio Projects</h2></div><p>Three role-aligned builds</p></div>
        <div className="project-grid">{roadmap.projects.map((project, index) => <ProjectCard key={project.id} onExplain={() => handleExplain({ itemId: `portfolio-project:${project.id}`, selectedItem: project.title, previousItem: roadmap.projects[index - 1]?.title ?? null, nextItem: roadmap.projects[index + 1]?.title ?? null, phaseTitle: 'Recommended Portfolio Projects' })} project={project} />)}</div>
      </section>
      <TrustedResourcesSection resources={resourceRecommendations.highlights} />
      <RoadmapActions onDownloadPdf={handleDownloadPdf} onOpenReplan={() => { setReplanError(''); setReplanOpen(true) }} onResetProgress={handleResetProgress} onStartNewJourney={() => startNewJourney(navigate)} />
      {replanOpen && <ReplanJourneyPanel completedMilestones={completedMilestones} completedSkills={completedSkills} error={replanError} learner={displayLearner} onClose={() => { if (!replanPending) setReplanOpen(false) }} onSubmit={handleReplan} submitting={replanPending} />}
      {explanationContext && <ExplanationPanel error={explanationError} explanation={explanation} item={explanationContext.selectedItem} loading={explanationLoading} onClose={() => setExplanationContext(null)} onRetry={() => loadExplanation(explanationContext)} />}
    </div>
  )
}

export default RoadmapPage
