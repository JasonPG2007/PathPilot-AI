import { getMilestoneId } from '../../lib/learnerMemory.js'

function MilestoneList({ completedIds, milestoneIds, milestones, onExplain, onToggle, phaseId }) {
  return (
    <div className="milestone-list"><h4>Milestones</h4><ul>{milestones.map((milestone, index) => {
      const id = getMilestoneId(phaseId, index, milestoneIds?.[index])
      const completed = completedIds.has(id)
      return <li className={completed ? 'is-complete' : ''} key={id}><span aria-hidden="true">✓</span><span>{milestone}</span><div><button aria-pressed={completed} onClick={() => onToggle(id)} type="button">{completed ? 'Undo' : 'Mark complete'}</button><button className="why-action" onClick={() => onExplain({ itemId: id, selectedItem: milestone, previousItem: milestones[index - 1] ?? null, nextItem: milestones[index + 1] ?? null })} type="button">Why?</button></div></li>
    })}</ul></div>
  )
}

export default MilestoneList
