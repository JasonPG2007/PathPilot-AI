import { getSkillId } from '../../lib/learnerMemory.js'
import MilestoneList from './MilestoneList.jsx'
import SkillBadge from './SkillBadge.jsx'

function RoadmapPhaseCard({ completedMilestoneIds, completedSkillIds, current, nextProject, number, onExplain, onToggleMilestone, onToggleSkill, phase, previousProject }) {
  return (
    <article className="roadmap-phase">
      <span className="phase-number">{number}</span>
      <div className={`phase-card${current ? ' phase-card--current' : ''}`}>
        <div className="phase-card-heading"><div><p>PHASE {number}{current ? ' · CURRENT' : ''}</p><h3>{phase.title}</h3></div><span className="duration-badge">{phase.duration}</span></div>
        <p className="phase-description">{phase.description}</p>
        <div className="phase-meta"><span><strong>Weekly workload</strong>{phase.weeklyWorkload}</span><span><strong>Prerequisites</strong>{phase.prerequisites.join(' · ')}</span></div>
        <div className="phase-details">
          <div><h4>Skills to master</h4><div className="phase-skills">{phase.skills.map((skill, index) => {
            const id = getSkillId(phase.id, index)
            return <SkillBadge completed={completedSkillIds.has(id)} key={id} onExplain={() => onExplain({ itemId: id, selectedItem: skill, previousItem: phase.skills[index - 1] ?? null, nextItem: phase.skills[index + 1] ?? null, phaseTitle: phase.title })} onToggle={() => onToggleSkill(id)}>{skill}</SkillBadge>
          })}</div></div>
          <div className={`phase-project phase-project--${phase.project.accent}`}><span>◇</span><div><small>{phase.project.type}</small><strong>{phase.project.title}</strong><button className="why-action" onClick={() => onExplain({ itemId: `phase:${phase.id}:project`, selectedItem: phase.project.title, previousItem: previousProject ?? null, nextItem: nextProject ?? null, phaseTitle: phase.title })} type="button">Why?</button></div></div>
        </div>
        <MilestoneList completedIds={completedMilestoneIds} milestones={phase.milestones} onExplain={(context) => onExplain({ ...context, phaseTitle: phase.title })} onToggle={onToggleMilestone} phaseId={phase.id} />
      </div>
    </article>
  )
}

export default RoadmapPhaseCard
