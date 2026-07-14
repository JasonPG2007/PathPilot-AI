const agents = [
  { className: 'workflow-node--goal', icon: '⚑', label: 'Your Goal' },
  { className: 'workflow-node--planner', icon: '✣', label: 'Planner Agent' },
  { className: 'workflow-node--critic', icon: '⌁', label: 'Critic Agent' },
  { className: 'workflow-node--roadmap', icon: '〽', label: 'Final Roadmap' },
]

function AgentWorkflowVisual() {
  return (
    <div className="workflow-visual" aria-label="Your goal is processed by planner and critic agents to create a final roadmap">
      <div className="workflow-lines" aria-hidden="true" />
      {agents.map((agent) => (
        <div className={`workflow-node ${agent.className}`} key={agent.label}>
          <span className="workflow-icon" aria-hidden="true">{agent.icon}</span>
          <strong>{agent.label}</strong>
        </div>
      ))}
    </div>
  )
}

export default AgentWorkflowVisual
