import { getMilestoneId } from '../../lib/learnerMemory.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleQuestion, faFlagCheckered } from '@fortawesome/free-solid-svg-icons'

function MilestoneList({ completedIds, milestoneIds, milestones, onExplain, onToggle, phaseId }) {
  return (
    <div className="milestone-list"><h4>Milestones</h4><ul>{milestones.map((milestone, index) => {
      const id = getMilestoneId(phaseId, index, milestoneIds?.[index])
      const completed = completedIds.has(id)
      return <li className={`semantic-list-item${completed ? ' is-complete' : ''}`} key={id}><span aria-hidden="true" className={`semantic-list-icon semantic-list-icon--${completed ? 'success' : 'info'}`}><FontAwesomeIcon icon={completed ? faCircleCheck : faFlagCheckered} /></span><div className="milestone-content"><span>{milestone}</span><div><button aria-pressed={completed} onClick={() => onToggle(id)} type="button"><FontAwesomeIcon aria-hidden="true" icon={faCircleCheck} /> {completed ? 'Undo' : 'Mark complete'}</button><button className="why-action" onClick={() => onExplain({ itemId: id, selectedItem: milestone, previousItem: milestones[index - 1] ?? null, nextItem: milestones[index + 1] ?? null })} type="button"><FontAwesomeIcon aria-hidden="true" icon={faCircleQuestion} /> Why?</button></div></div></li>
    })}</ul></div>
  )
}

export default MilestoneList
