import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBullseye, faRoute, faScaleBalanced, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'

const agents = [
  { className: 'workflow-node--goal', icon: faBullseye, label: 'Your Goal' },
  { className: 'workflow-node--planner', icon: faWandMagicSparkles, label: 'Planner Agent' },
  { className: 'workflow-node--critic', icon: faScaleBalanced, label: 'Critic Agent' },
  { className: 'workflow-node--roadmap', icon: faRoute, label: 'Final Roadmap' },
]

function AgentWorkflowVisual() {
  return <div className="workflow-visual" aria-label="Your goal is processed by planner and critic agents to create a final roadmap"><div className="workflow-lines" aria-hidden="true" />{agents.map((agent) => <div className={`workflow-node ${agent.className}`} key={agent.label}><span className="workflow-icon"><FontAwesomeIcon aria-hidden="true" icon={agent.icon} /></span><strong>{agent.label}</strong></div>)}</div>
}

export default AgentWorkflowVisual
