export const initialAgentStates = ['waiting', 'waiting', 'waiting']

export const progressByEvent = {
  planner_started: { progress: 8, status: 'Planner Agent is building your initial roadmap' },
  planner_completed: { progress: 30, status: 'Critic Agent is preparing its feasibility review' },
  critic_started: { progress: 38, status: 'Critic Agent is reviewing feasibility and risk' },
  critic_completed: { progress: 60, status: 'Planner Agent is preparing the final revision' },
  revision_started: { progress: 68, status: 'Planner Agent is applying the critic’s feedback' },
  revision_completed: { progress: 92, status: 'Finalizing your personalized roadmap...' },
  completed: { progress: 100, status: 'Your personalized roadmap is ready' },
}

export function applyStageEvent(states, eventType) {
  switch (eventType) {
    case 'planner_started': return ['active', 'waiting', 'waiting']
    case 'planner_completed':
    case 'critic_started': return ['completed', 'active', 'waiting']
    case 'critic_completed':
    case 'revision_started': return ['completed', 'completed', 'active']
    case 'revision_completed':
    case 'completed': return ['completed', 'completed', 'completed']
    default: return states
  }
}

