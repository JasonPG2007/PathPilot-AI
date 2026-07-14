import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AgentStatusCard from '../components/processing/AgentStatusCard.jsx'
import { createMockRoadmap, demoLearnerProfile } from '../data/mockRoadmap.js'
import '../styles/processing.css'

const workflowStages = [
  { progress: 18, status: 'Planner Agent is building your initial roadmap' },
  { progress: 45, status: 'Critic Agent is reviewing feasibility and risk' },
  { progress: 76, status: 'Planner Agent is applying the critic’s feedback' },
  { progress: 100, status: 'Your personalized roadmap is ready' },
]

const agents = [
  {
    name: 'Planner Agent',
    role: 'Roadmap architect',
    icon: 'P',
    tasks: ['Understanding the learner’s goal', 'Breaking the goal into phases', 'Estimating weekly workload', 'Selecting practical projects'],
  },
  {
    name: 'Critic Agent',
    role: 'Quality and feasibility review',
    icon: 'C',
    tasks: ['Checking timeline feasibility', 'Reviewing prerequisite order', 'Balancing weekly workload', 'Identifying risks'],
  },
  {
    name: 'Planner Revision',
    role: 'Final roadmap refinement',
    icon: 'R',
    tasks: ['Applying critic feedback', 'Refining milestones', 'Finalizing the roadmap'],
  },
]

function getAgentState(agentIndex, stage) {
  if (stage > agentIndex) return 'completed'
  if (stage === agentIndex) return 'active'
  return 'waiting'
}

function ProcessingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [stage, setStage] = useState(0)
  const learner = location.state?.learner ?? demoLearnerProfile
  const roadmap = useMemo(() => createMockRoadmap(learner), [learner])
  const currentStage = workflowStages[stage]

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStage(1), 1300),
      window.setTimeout(() => setStage(2), 2700),
      window.setTimeout(() => setStage(3), 4100),
      window.setTimeout(() => navigate('/roadmap', { state: { learner, roadmap } }), 5200),
    ]

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [learner, navigate, roadmap])

  return (
    <div className="processing-page">
      <section className="processing-hero">
        <div className={`processing-orbit${stage === 3 ? ' processing-orbit--complete' : ''}`} aria-hidden="true">
          <span className="orbit-ring" />
          <span className="orbit-core">{stage === 3 ? '✓' : '✦'}</span>
        </div>
        <p className="processing-eyebrow">MULTI-AGENT ORCHESTRATION</p>
        <h1>Creating Your Personalized Learning Journey</h1>
        <p>Our specialized AI agents are collaborating to plan, challenge, and refine the most effective path toward your goal.</p>
      </section>

      <section className="workflow-panel" aria-label="Roadmap generation progress">
        <div className="overall-progress">
          <div>
            <span aria-live="polite">{currentStage.status}</span>
            <strong>{currentStage.progress}%</strong>
          </div>
          <div
            aria-label={`${currentStage.progress}% complete`}
            aria-valuemax="100"
            aria-valuemin="0"
            aria-valuenow={currentStage.progress}
            className="progress-track"
            role="progressbar"
          >
            <span style={{ width: `${currentStage.progress}%` }} />
          </div>
        </div>

        <div className="agent-workflow">
          {agents.map((agent, index) => (
            <div className="agent-stage" key={agent.name}>
              <AgentStatusCard {...agent} state={getAgentState(index, stage)} />
              {index < agents.length - 1 && (
                <div className={`workflow-connector${stage > index ? ' workflow-connector--complete' : ''}`} aria-hidden="true">
                  <span>→</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={`completion-message${stage === 3 ? ' completion-message--visible' : ''}`} aria-live="polite">
          <span>✓</span>
          <div><strong>Roadmap complete</strong><p>Opening your personalized learning journey…</p></div>
        </div>
      </section>

      <p className="processing-note">Please keep this page open. You’ll be redirected automatically.</p>
    </div>
  )
}

export default ProcessingPage
