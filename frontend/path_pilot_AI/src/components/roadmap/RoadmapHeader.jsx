import { getRoadmapDisplayTitle, getRoadmapOutcome } from '../../lib/roadmapTitle.js'

function RoadmapHeader({ goal, learnerGoal, summary }) {
  const title = getRoadmapDisplayTitle(goal, learnerGoal)
  const outcome = getRoadmapOutcome(summary, goal, title)
  return (
    <header className="roadmap-header">
      <p className="roadmap-breadcrumb">PathPilot AI <span><FontAwesomeIcon aria-hidden="true" icon={faChevronRight} /></span> Active Roadmap</p>
      <div><div className="roadmap-header__copy"><p className="roadmap-kicker">YOUR PERSONALIZED PATH</p><h1>{title}</h1>{outcome && <p className="roadmap-header__outcome">{outcome}</p>}</div><span className="roadmap-ready-badge"><FontAwesomeIcon aria-hidden="true" icon={faCircleCheck} /> ROADMAP READY</span></div>
    </header>
  )
}

export default RoadmapHeader
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faCircleCheck } from '@fortawesome/free-solid-svg-icons'
