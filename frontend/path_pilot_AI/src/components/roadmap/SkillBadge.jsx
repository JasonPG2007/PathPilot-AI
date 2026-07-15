function SkillBadge({ children, completed, onExplain, onToggle }) {
  return (
    <span className={`skill-badge${completed ? ' skill-badge--complete' : ''}`}>
      <span>{children}</span>
      <button aria-label={`${completed ? 'Undo completion for' : 'Mark complete'} ${children}`} aria-pressed={completed} onClick={onToggle} type="button"><FontAwesomeIcon aria-hidden="true" icon={completed ? faCircleCheck : faCircle} /> {completed ? 'Undo' : 'Mark complete'}</button>
      <button className="why-action" onClick={onExplain} type="button"><FontAwesomeIcon aria-hidden="true" icon={faCircleQuestion} /> Why?</button>
    </span>
  )
}

export default SkillBadge
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleQuestion } from '@fortawesome/free-solid-svg-icons'
import { faCircle } from '@fortawesome/free-regular-svg-icons'
