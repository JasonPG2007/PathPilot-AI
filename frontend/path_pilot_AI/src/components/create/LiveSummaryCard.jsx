import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo, faDiagramProject, faGaugeHigh } from '@fortawesome/free-solid-svg-icons'

function LiveSummaryCard({ goal, hours, learningStyle, level, timeline }) {
  const timelineLabel = timeline.split(' (')[0]
  return (
    <div className="live-summary-card">
      <h2><FontAwesomeIcon aria-hidden="true" icon={faDiagramProject} /> Live Summary</h2>
      <div className="summary-outcome"><span>TARGET OUTCOME</span><strong>{goal || 'Awaiting your learning goal'}</strong></div>
      <div className="summary-facts"><div><span>Current Level</span><strong>{level}</strong></div><div><span>Timeline</span><strong>{timelineLabel}</strong></div></div>
      <div className="intensity-row"><div><span>Weekly intensity</span><strong>{hours} hours/week</strong></div><div className="intensity-meter" style={{ '--meter-value': `${Math.min((hours / 40) * 100, 100)}%` }}>{Math.round((hours / 40) * 100)}%</div></div>
      <div className="approach-row"><span className="approach-icon"><FontAwesomeIcon aria-hidden="true" icon={faGaugeHigh} /></span><div><strong>{learningStyle}-First Approach</strong><span>Prioritizing labs &amp; projects</span></div></div>
      <p className="summary-note"><FontAwesomeIcon aria-hidden="true" icon={faCircleInfo} /> Based on your {hours}h/week commitment and {level.toLowerCase()} starting point, PathPilot AI estimates completion within your {timelineLabel.toLowerCase()} window.</p>
    </div>
  )
}

export default LiveSummaryCard
