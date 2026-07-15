import RoadmapPhaseCard from './RoadmapPhaseCard.jsx'

function RoadmapTimeline({ memory, onToggleMilestone, onToggleSkill, phases }) {
  const completedSkillIds = new Set(memory.completedSkillIds)
  const completedMilestoneIds = new Set(memory.completedMilestoneIds)

  return (
    <section className="roadmap-timeline">
      <div className="roadmap-section-heading"><div><span>□</span><h2>Learning Journey Timeline</h2></div><p>{phases.length} phases identified</p></div>
      <div className="timeline-list">{phases.map((phase, index) => <RoadmapPhaseCard completedMilestoneIds={completedMilestoneIds} completedSkillIds={completedSkillIds} current={memory.currentPhase === phase.id} key={phase.id} number={index + 1} onToggleMilestone={onToggleMilestone} onToggleSkill={onToggleSkill} phase={phase} />)}</div>
    </section>
  )
}

export default RoadmapTimeline
