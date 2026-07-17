import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faCircleCheck, faRoute, faWandSparkles } from '@fortawesome/free-solid-svg-icons'
import AgentStatusCard from '../components/processing/AgentStatusCard.jsx'
import ProcessingError from '../components/processing/ProcessingError.jsx'
import { demoLearnerProfile } from '../data/mockRoadmap.js'
import { generateRoadmap, releaseGenerationRequest } from '../services/roadmapApi.js'
import { beginGenerationAttempt, devLog, failGenerationAttempt, storeGeneratedRoadmap } from '../lib/roadmapSession.js'
import '../styles/processing.css'

const agents = [
  { name: 'Planner Agent', role: 'Roadmap architect', icon: 'P', tasks: ['Understanding the learner’s goal', 'Breaking the goal into phases', 'Estimating weekly workload', 'Selecting practical projects'] },
  { name: 'Critic Agent', role: 'Quality and feasibility review', icon: 'C', tasks: ['Checking timeline feasibility', 'Reviewing prerequisite order', 'Balancing weekly workload', 'Identifying risks'] },
  { name: 'Planner Revision', role: 'Final roadmap refinement', icon: 'R', tasks: ['Applying critic feedback', 'Refining milestones', 'Finalizing the roadmap'] },
]

const initialAgentStates = ['waiting', 'waiting', 'waiting']
const progressByEvent = {
  planner_started: { index: 0, state: 'active', progress: 8, status: 'Planner Agent is building your initial roadmap' },
  planner_completed: { index: 0, state: 'completed', progress: 30, status: 'Planner Agent completed the initial roadmap' },
  critic_started: { index: 1, state: 'active', progress: 38, status: 'Critic Agent is reviewing feasibility and risk' },
  critic_completed: { index: 1, state: 'completed', progress: 60, status: 'Critic Agent completed its review' },
  revision_started: { index: 2, state: 'active', progress: 68, status: 'Planner Agent is applying the critic’s feedback' },
  revision_completed: { index: 2, state: 'completed', progress: 92, status: 'Finalizing your personalized roadmap...' },
  completed: { progress: 100, status: 'Your personalized roadmap is ready' },
}

const initializedAttempts = new Set()

function ProcessingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [agentStates, setAgentStates] = useState(initialAgentStates)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Waiting for the Planner Agent to start')
  const [roadmap, setRoadmap] = useState(null)
  const [error, setError] = useState('')
  const [requestAttempt, setRequestAttempt] = useState(0)
  const [directGenerationId] = useState(() => crypto.randomUUID())
  const learner = location.state?.learner ?? demoLearnerProfile
  const generationId = location.state?.generationId ?? directGenerationId
  const requestId = `${generationId}:${requestAttempt}`

  useEffect(() => {
    let cancelled = false
    if (!initializedAttempts.has(requestId)) {
      initializedAttempts.add(requestId)
      beginGenerationAttempt(requestId)
    }

    const onProgress = (event) => {
      if (cancelled) return
      if (event.type === 'failed') {
        const failedIndex = { planner: 0, critic: 1, revision: 2 }[event.stage]
        setAgentStates((states) => states.map((state, index) => (
          index === failedIndex || (failedIndex === undefined && state === 'active') ? 'failed' : state
        )))
        return
      }
      const update = progressByEvent[event.type]
      if (!update) return
      devLog(`generation progress ${event.type}`)
      setProgress(update.progress)
      setStatus(update.status)
      if (Number.isInteger(update.index)) {
        setAgentStates((states) => states.map((state, index) => index === update.index ? update.state : state))
      }
    }

    generateRoadmap(learner, requestId, { onProgress })
      .then((result) => { if (!cancelled) setRoadmap(result) })
      .catch((requestError) => {
        if (!cancelled) {
          failGenerationAttempt(requestId)
          setAgentStates((states) => states.map((state) => state === 'active' ? 'failed' : state))
          setError(requestError.message)
        }
      })
    return () => {
      cancelled = true
      releaseGenerationRequest(requestId, onProgress)
    }
  }, [learner, requestId])

  useEffect(() => {
    if (!roadmap) return
    const navigationState = storeGeneratedRoadmap({ learner, roadmap, generationId })
    devLog('navigation to /roadmap')
    navigate('/roadmap', { state: navigationState })
  }, [generationId, learner, navigate, roadmap])

  function retryRequest() {
    setError('')
    setRoadmap(null)
    setAgentStates(initialAgentStates)
    setProgress(0)
    setStatus('Waiting for the Planner Agent to start')
    setRequestAttempt((attempt) => attempt + 1)
  }

  const isComplete = progress === 100
  const isFinalizing = agentStates[2] === 'completed' && !roadmap

  return (
    <div className="processing-page">
      <section className="processing-hero">
        <div className={`processing-orbit${isComplete ? ' processing-orbit--complete' : ''}`} aria-hidden="true">
          <span className="orbit-ring" />
          <span className="orbit-core"><FontAwesomeIcon icon={isComplete ? faCircleCheck : faWandSparkles} /></span>
        </div>
        <p className="processing-eyebrow">MULTI-AGENT ORCHESTRATION</p>
        <h1>Creating Your Personalized Learning Journey</h1>
        <p>Our specialized AI agents are collaborating to plan, challenge, and refine the most effective path toward your goal.</p>
      </section>

      <section className="workflow-panel" aria-label="Roadmap generation progress">
        <div className="overall-progress">
          <div><span aria-live="polite">{status}</span><strong>{progress}%</strong></div>
          <div aria-label={`${progress}% complete`} aria-valuemax="100" aria-valuemin="0" aria-valuenow={progress} className="progress-track" role="progressbar"><span style={{ width: `${progress}%` }} /></div>
        </div>

        <div className="agent-workflow">
          {agents.map((agent, index) => (
            <div className="agent-stage" key={agent.name}>
              <AgentStatusCard {...agent} state={agentStates[index]} />
              {index < agents.length - 1 && <div className={`workflow-connector${agentStates[index] === 'completed' ? ' workflow-connector--complete' : ''}`} aria-hidden="true"><span><FontAwesomeIcon icon={faArrowRight} /></span></div>}
            </div>
          ))}
        </div>

        <div className={`completion-message${isFinalizing || isComplete ? ' completion-message--visible' : ''}`} aria-live="polite">
          <span><FontAwesomeIcon aria-hidden="true" icon={isComplete ? faCircleCheck : faRoute} /></span>
          <div><strong>{isComplete ? 'Roadmap complete' : 'Final checks in progress'}</strong><p>{isComplete ? 'Opening your personalized learning journey…' : 'Finalizing your personalized roadmap... This can take up to a few minutes on free hosting.'}</p></div>
        </div>

        {error && <div className="processing-workflow-error"><ProcessingError message={error} onRetry={retryRequest} /></div>}
      </section>
      <p className="processing-note">Please keep this page open. You’ll be redirected automatically.</p>
    </div>
  )
}

export default ProcessingPage
