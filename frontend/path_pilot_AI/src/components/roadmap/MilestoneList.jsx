function MilestoneList({ milestones }) {
  return (
    <div className="milestone-list"><h4>Milestones</h4><ul>{milestones.map((milestone) => <li key={milestone}><span>✓</span>{milestone}</li>)}</ul></div>
  )
}

export default MilestoneList
