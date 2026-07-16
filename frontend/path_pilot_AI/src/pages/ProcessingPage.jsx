import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faCircleCheck, faRoute, faWandSparkles } from '@fortawesome/free-solid-svg-icons'
import AgentStatusCard from '../components/processing/AgentStatusCard.jsx'
import ProcessingError from '../components/processing/ProcessingError.jsx'
import { demoLearnerProfile } from '../data/mockRoadmap.js'
import { generateRoadmap } from '../services/roadmapApi.js'
import { beginGenerationAttempt, devLog, failGenerationAttempt, storeGeneratedRoadmap } from '../lib/roadmapSession.js'
import '../styles/processing.css'

const workflowStages = [
  { progress: 18, status: 'Planner Agent is building your initial roadmap' },
  { progress: 45, status: 'Critic Agent is reviewing feasibility and risk' },
  { progress: 76, status: 'Planner Agent is applying the critic’s feedback' },
  { progress: 100, status: 'Your personalized roadmap is ready' },
]

const agents = [
  { name: 'Planner Agent', role: 'Roadmap architect', icon: 'P', tasks: ['Understanding the learner’s goal', 'Breaking the goal into phases', 'Estimating weekly workload', 'Selecting practical projects'] },
  { name: 'Critic Agent', role: 'Quality and feasibility review', icon: 'C', tasks: ['Checking timeline feasibility', 'Reviewing prerequisite order', 'Balancing weekly workload', 'Identifying risks'] },
  { name: 'Planner Revision', role: 'Final roadmap refinement', icon: 'R', tasks: ['Applying critic feedback', 'Refining milestones', 'Finalizing the roadmap'] },
]

const initializedAttempts = new Set()

function getAgentState(agentIndex, stage) {
  if (stage > agentIndex) return 'completed'
  if (stage === agentIndex) return 'active'
  return 'waiting'
}

function ProcessingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [stage, setStage] = useState(0)
  const [animationCompleted, setAnimationCompleted] = useState(false)
  const [roadmap, setRoadmap] = useState(null)
  const [error, setError] = useState('')
  const [requestAttempt, setRequestAttempt] = useState(0)
  const [directGenerationId] = useState(() => crypto.randomUUID())
  const learner = location.state?.learner ?? demoLearnerProfile
  const generationId = location.state?.generationId ?? directGenerationId
  const requestId = `${generationId}:${requestAttempt}`
  const currentStage = workflowStages[stage]

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStage(1), 1300),
      window.setTimeout(() => setStage(2), 2700),
      window.setTimeout(() => setStage(3), 4100),
      window.setTimeout(() => setAnimationCompleted(true), 5200),
    ]
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [])

  useEffect(() => {
    let cancelled = false
    if (!initializedAttempts.has(requestId)) {
      initializedAttempts.add(requestId)
      beginGenerationAttempt(requestId)
    }
    generateRoadmap(learner, requestId)
      .then((result) => { if (!cancelled) setRoadmap(result) })
      .catch((requestError) => {
        if (!cancelled) {
          failGenerationAttempt(requestId)
          setError(requestError.message)
        }
      })
    return () => { cancelled = true }
  }, [learner, requestId])

  useEffect(() => {
    if (!animationCompleted || !roadmap) return
    const navigationState = storeGeneratedRoadmap({ learner, roadmap, generationId })
    devLog('navigation to /roadmap')
    navigate('/roadmap', { state: navigationState })
  }, [animationCompleted, generationId, learner, navigate, roadmap])

  function retryRequest() {
    setError('')
    setRoadmap(null)
    setRequestAttempt((attempt) => attempt + 1)
  }

  if (error) {
    return <div className="processing-page processing-page--error"><ProcessingError message={error} onRetry={retryRequest} /></div>
  }

  return (
    <div className="processing-page">
      <section className="processing-hero">
        <div className={`processing-orbit${stage === 3 ? ' processing-orbit--complete' : ''}`} aria-hidden="true">
          <span className="orbit-ring" />
          <span className="orbit-core"><FontAwesomeIcon icon={stage === 3 ? faCircleCheck : faWandSparkles} /></span>
        </div>
        <p className="processing-eyebrow">MULTI-AGENT ORCHESTRATION</p>
        <h1>Creating Your Personalized Learning Journey</h1>
        <p>Our specialized AI agents are collaborating to plan, challenge, and refine the most effective path toward your goal.</p>
      </section>

      <section className="workflow-panel" aria-label="Roadmap generation progress">
        <div className="overall-progress">
          <div><span aria-live="polite">{animationCompleted && !roadmap ? 'Finalizing your personalized roadmap...' : currentStage.status}</span><strong>{currentStage.progress}%</strong></div>
          <div aria-label={`${currentStage.progress}% complete`} aria-valuemax="100" aria-valuemin="0" aria-valuenow={currentStage.progress} className="progress-track" role="progressbar"><span style={{ width: `${currentStage.progress}%` }} /></div>
        </div>

        <div className="agent-workflow">
          {agents.map((agent, index) => (
            <div className="agent-stage" key={agent.name}>
              <AgentStatusCard {...agent} state={getAgentState(index, stage)} />
              {index < agents.length - 1 && <div className={`workflow-connector${stage > index ? ' workflow-connector--complete' : ''}`} aria-hidden="true"><span><FontAwesomeIcon icon={faArrowRight} /></span></div>}
            </div>
          ))}
        </div>

        <div className={`completion-message${stage === 3 ? ' completion-message--visible' : ''}`} aria-live="polite">
          <span><FontAwesomeIcon aria-hidden="true" icon={stage === 3 ? faCircleCheck : faRoute} /></span>
          <div><strong>{roadmap ? 'Roadmap complete' : 'Final checks in progress'}</strong><p>{roadmap ? 'Opening your personalized learning journey…' : animationCompleted ? 'Finalizing your personalized roadmap... This can take up to a few minutes on free hosting.' : 'The agents are refining your learning journey…'}</p></div>
        </div>
      </section>
      <p className="processing-note">Please keep this page open. You’ll be redirected automatically.</p>
    </div>
  )
}

export default ProcessingPage
