import { getMilestoneId } from '../../lib/learnerMemory.js'

function MilestoneList({ completedIds, milestones, onToggle, phaseId }) {
  return (
    <div className="milestone-list">
      <h4>Milestones</h4>
      <ul>{milestones.map((milestone, index) => {
        const id = getMilestoneId(phaseId, index)
        const completed = completedIds.has(id)
        return <li className={completed ? 'is-complete' : ''} key={id}><span aria-hidden="true">✓</span><span>{milestone}</span><button aria-pressed={completed} onClick={() => onToggle(id)} type="button">{completed ? 'Undo' : 'Mark complete'}</button></li>
      })}</ul>
    </div>
  )
}

export default MilestoneList
