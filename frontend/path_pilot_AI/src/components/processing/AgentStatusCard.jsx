const stateLabels = {
  waiting: 'Waiting',
  active: 'Working',
  completed: 'Complete',
}

function AgentStatusCard({ icon, name, role, state, tasks }) {
  return (
    <article className={`agent-status-card agent-status-card--${state}`}>
      <div className="agent-card-heading">
        <span className="agent-monogram" aria-hidden="true">{state === 'completed' ? <FontAwesomeIcon icon={faCircleCheck} /> : icon}</span>
        <div><h2>{name}</h2><p>{role}</p></div>
        <span className={`agent-state agent-state--${state}`}><span aria-hidden="true" />{stateLabels[state]}</span>
      </div>
      <ul>
        {tasks.map((task, index) => (
          <li key={task} style={{ '--task-delay': `${index * 110}ms` }}>
            <span aria-hidden="true"><FontAwesomeIcon className={state === 'active' ? 'status-icon--spinning' : ''} icon={state === 'completed' ? faCircleCheck : state === 'active' ? faCircleNotch : faCircle} /></span>
            {task}
          </li>
        ))}
      </ul>
    </article>
  )
}

export default AgentStatusCard
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { faCircle } from '@fortawesome/free-regular-svg-icons'
