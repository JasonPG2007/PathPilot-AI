import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import CriticReviewCard from '../components/roadmap/CriticReviewCard.jsx'
import LearnerSummary from '../components/roadmap/LearnerSummary.jsx'
import ProjectCard from '../components/roadmap/ProjectCard.jsx'
import ProgressOverview from '../components/roadmap/ProgressOverview.jsx'
import RoadmapActions from '../components/roadmap/RoadmapActions.jsx'
import RoadmapHeader from '../components/roadmap/RoadmapHeader.jsx'
import RoadmapTimeline from '../components/roadmap/RoadmapTimeline.jsx'
import { getStoredRoadmap, hasActiveGenerationAttempt } from '../lib/roadmapSession.js'
import { getProgress, loadLearnerMemory, resetLearnerProgress, toggleCompletion } from '../lib/learnerMemory.js'
import '../styles/roadmap.css'

function RoadmapPage() {
  const location = useLocation()
  const navigationState = location.state?.source === 'api' ? location.state : null
  const fallbackState = hasActiveGenerationAttempt() ? null : getStoredRoadmap()
  const learner = navigationState?.learner ?? fallbackState?.learner
  const roadmap = navigationState?.roadmap ?? fallbackState?.roadmap
  const generatedAt = navigationState?.generatedAt ?? fallbackState?.generatedAt
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

  return (
    <div className="roadmap-page">
      <RoadmapHeader goal={roadmap.goal} />
      <LearnerSummary learner={learner} roadmap={roadmap} />
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
      <RoadmapActions onResetProgress={handleResetProgress} />
    </div>
  )
}

export default RoadmapPage
