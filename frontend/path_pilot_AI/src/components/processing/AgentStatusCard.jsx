import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleNotch, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { faCircle } from '@fortawesome/free-regular-svg-icons'

const stateLabels = {
  waiting: 'Pending',
  active: 'Processing',
  completed: 'Complete',
  failed: 'Failed',
}

function AgentStatusCard({ icon, name, role, state, tasks }) {
  const taskIcon = state === 'completed' ? faCircleCheck : state === 'active' ? faCircleNotch : state === 'failed' ? faTriangleExclamation : faCircle
  return (
    <article className={`agent-status-card agent-status-card--${state}`}>
      <div className="agent-card-heading">
        <span className="agent-monogram" aria-hidden="true">{state === 'completed' ? <FontAwesomeIcon icon={faCircleCheck} /> : state === 'failed' ? <FontAwesomeIcon icon={faTriangleExclamation} /> : icon}</span>
        <div><h2>{name}</h2><p>{role}</p></div>
        <span className={`agent-state agent-state--${state}`}><span aria-hidden="true" />{stateLabels[state]}</span>
      </div>
      <ul>
        {tasks.map((task, index) => (
          <li key={task} style={{ '--task-delay': `${index * 110}ms` }}>
            <span aria-hidden="true"><FontAwesomeIcon className={state === 'active' ? 'status-icon--spinning' : ''} icon={taskIcon} /></span>
            {task}
          </li>
        ))}
      </ul>
    </article>
  )
}

export default AgentStatusCard
