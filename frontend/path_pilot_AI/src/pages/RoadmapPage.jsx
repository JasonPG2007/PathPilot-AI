import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import CriticReviewCard from '../components/roadmap/CriticReviewCard.jsx'
import LearnerSummary from '../components/roadmap/LearnerSummary.jsx'
import ProjectCard from '../components/roadmap/ProjectCard.jsx'
import ProgressOverview from '../components/roadmap/ProgressOverview.jsx'
import ReplanJourneyPanel from '../components/roadmap/ReplanJourneyPanel.jsx'
import ReplanSummary from '../components/roadmap/ReplanSummary.jsx'
import RoadmapActions from '../components/roadmap/RoadmapActions.jsx'
import RoadmapHeader from '../components/roadmap/RoadmapHeader.jsx'
import RoadmapTimeline from '../components/roadmap/RoadmapTimeline.jsx'
import { getMostRecentRoadmap, getStoredRoadmap, hasActiveGenerationAttempt, storeReplannedRoadmap } from '../lib/roadmapSession.js'
import { getMilestoneId, getProgress, getSkillId, loadLearnerMemory, resetLearnerProgress, toggleCompletion, updateLearnerConstraints } from '../lib/learnerMemory.js'
import { requestReplan } from '../services/replanApi.js'
import '../styles/roadmap.css'

function RoadmapPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const storedState = hasActiveGenerationAttempt() ? null : getStoredRoadmap()
  const activeState = getMostRecentRoadmap(location.state, storedState)
  const initialLearner = activeState?.learner
  const initialRoadmap = activeState?.roadmap
  const generatedAt = activeState?.generatedAt
  const generationId = activeState?.generationId
  const [learner, setLearner] = useState(initialLearner)
  const [roadmap, setRoadmap] = useState(initialRoadmap)
  const [replanOpen, setReplanOpen] = useState(false)
  const [replanPending, setReplanPending] = useState(false)
  const [replanError, setReplanError] = useState('')
  const [replanSummary, setReplanSummary] = useState(activeState?.replanSummary ?? null)
  const memoryContext = learner && roadmap && generatedAt ? { learner, roadmap, generatedAt } : null
  const [memory, setMemory] = useState(() => memoryContext ? loadLearnerMemory(memoryContext) : null)

  if (!learner || !roadmap || !memory || !memoryContext) {
    return (
      <div className="roadmap-page roadmap-empty-state">
        <p className="roadmap-kicker">NO ROADMAP FOUND</p>
        <h1>Create your first learning journey.</h1>
        <p>Your generated roadmap will appear here after the agent workflow is complete.</p>
        <Link className="button" to="/create">Create Journey</Link>
      </div>
    )
  }

  const progress = getProgress(memory, roadmap)
  const currentPhaseIndex = roadmap.phases.findIndex((phase) => phase.id === memory.currentPhase)

  function handleToggle(type, id) {
    setMemory((current) => toggleCompletion(current, roadmap, type, id))
  }

  function handleResetProgress() {
    if (window.confirm('Reset all completed skills and milestones for this roadmap?')) {
      setMemory(resetLearnerProgress(memoryContext))
    }
  }

  const completedSkillSet = new Set(memory.completedSkillIds)
  const completedMilestoneSet = new Set(memory.completedMilestoneIds)
  const completedSkills = roadmap.phases.flatMap((phase) => phase.skills.filter((_, index) => completedSkillSet.has(getSkillId(phase.id, index))))
  const completedMilestones = roadmap.phases.flatMap((phase) => phase.milestones.filter((_, index) => completedMilestoneSet.has(getMilestoneId(phase.id, index))))

  async function handleReplan(constraints) {
    setReplanPending(true)
    setReplanError('')
    try {
      const revisedRoadmap = await requestReplan({ learner, roadmap, memory, constraints })
      const updatedLearner = { ...learner, hours: constraints.weeklyHours, timeline: constraints.timeline }
      const summary = {
        whatChanged: `The plan was rebalanced from ${learner.hours} to ${constraints.weeklyHours} weekly hours.`,
        why: constraints.note ? `${constraints.mainDifficulty}: ${constraints.note}` : constraints.mainDifficulty,
        timeline: constraints.timeline,
        weeklyHours: constraints.weeklyHours,
        riskLevel: revisedRoadmap.criticReview.riskLevel,
        confidenceScore: revisedRoadmap.feasibilityScore,
      }
      setReplanSummary(summary)
      setLearner(updatedLearner)
      setRoadmap(revisedRoadmap)
      setMemory((current) => updateLearnerConstraints(current, updatedLearner, constraints.weeklyHours))
      const replannedState = storeReplannedRoadmap({ learner: updatedLearner, roadmap: revisedRoadmap, generationId, generatedAt, replanSummary: summary })
      navigate('/roadmap', { replace: true, state: replannedState })
      setReplanOpen(false)
    } catch (error) {
      setReplanError(error.message)
    } finally {
      setReplanPending(false)
    }
  }

  return (
    <div className="roadmap-page">
      <RoadmapHeader goal={roadmap.goal} />
      <LearnerSummary learner={learner} roadmap={roadmap} />
      {replanSummary && <ReplanSummary summary={replanSummary} />}
      <ProgressOverview currentPhase={currentPhaseIndex + 1} phaseCount={roadmap.phases.length} progress={progress} />
      <div className="roadmap-content-grid">
        <RoadmapTimeline memory={memory} onToggleMilestone={(id) => handleToggle('milestone', id)} onToggleSkill={(id) => handleToggle('skill', id)} phases={roadmap.phases} />
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
      <section className="projects-section">
        <div className="roadmap-section-heading"><div><span>▣</span><h2>Suggested Portfolio Projects</h2></div><p>Three role-aligned builds</p></div>
        <div className="project-grid">{roadmap.projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>
      </section>
      <RoadmapActions onOpenReplan={() => { setReplanError(''); setReplanOpen(true) }} onResetProgress={handleResetProgress} />
      {replanOpen && <ReplanJourneyPanel completedMilestones={completedMilestones} completedSkills={completedSkills} error={replanError} learner={learner} onClose={() => { if (!replanPending) setReplanOpen(false) }} onSubmit={handleReplan} submitting={replanPending} />}
    </div>
  )
}

export default RoadmapPage
