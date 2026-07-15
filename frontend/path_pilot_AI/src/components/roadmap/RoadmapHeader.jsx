function RoadmapHeader({ goal }) {
  return (
    <header className="roadmap-header">
      <p className="roadmap-breadcrumb">PathPilot AI <span><FontAwesomeIcon aria-hidden="true" icon={faChevronRight} /></span> Active Roadmap</p>
      <div><div><p className="roadmap-kicker">YOUR PERSONALIZED PATH</p><h1>{goal}</h1></div><span className="roadmap-ready-badge"><FontAwesomeIcon aria-hidden="true" icon={faCircleCheck} /> ROADMAP READY</span></div>
    </header>
  )
}

export default RoadmapHeader
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faCircleCheck } from '@fortawesome/free-solid-svg-icons'
