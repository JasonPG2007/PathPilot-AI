import RoadmapPhaseCard from './RoadmapPhaseCard.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRoute } from '@fortawesome/free-solid-svg-icons'

function RoadmapTimeline({ memory, onExplain, onToggleMilestone, onToggleSkill, phases, resourcesByPhase }) {
  const completedSkillIds = new Set(memory.completedSkillIds)
  const completedMilestoneIds = new Set(memory.completedMilestoneIds)
  return (
    <section className="roadmap-timeline">
      <div className="roadmap-section-heading"><div><span><FontAwesomeIcon aria-hidden="true" icon={faRoute} /></span><h2>Learning Journey Timeline</h2></div><p>{phases.length} phases identified</p></div>
      <div className="timeline-list">{phases.map((phase, index) => <RoadmapPhaseCard completedMilestoneIds={completedMilestoneIds} completedSkillIds={completedSkillIds} current={memory.currentPhase === phase.id} key={phase.id} nextProject={phases[index + 1]?.project.title} number={index + 1} onExplain={onExplain} onToggleMilestone={onToggleMilestone} onToggleSkill={onToggleSkill} phase={phase} previousProject={phases[index - 1]?.project.title} resources={resourcesByPhase[phase.id] ?? []} />)}</div>
    </section>
  )
}

export default RoadmapTimeline
