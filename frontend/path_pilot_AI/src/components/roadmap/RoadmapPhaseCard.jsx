import MilestoneList from './MilestoneList.jsx'
import SkillBadge from './SkillBadge.jsx'

function RoadmapPhaseCard({ number, phase }) {
  return (
    <article className="roadmap-phase">
      <span className="phase-number">{number}</span>
      <div className="phase-card">
        <div className="phase-card-heading"><div><p>PHASE {number}</p><h3>{phase.title}</h3></div><span className="duration-badge">{phase.duration}</span></div>
        <p className="phase-description">{phase.description}</p>
        <div className="phase-meta"><span><strong>Weekly workload</strong>{phase.weeklyWorkload}</span><span><strong>Prerequisites</strong>{phase.prerequisites.join(' · ')}</span></div>
        <div className="phase-details">
          <div><h4>Skills to master</h4><div className="phase-skills">{phase.skills.map((skill) => <SkillBadge key={skill}>{skill}</SkillBadge>)}</div></div>
          <div className={`phase-project phase-project--${phase.project.accent}`}><span>◇</span><div><small>{phase.project.type}</small><strong>{phase.project.title}</strong></div></div>
        </div>
        <MilestoneList milestones={phase.milestones} />
      </div>
    </article>
  )
}

export default RoadmapPhaseCard
