import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarCheck, faClock, faFlagCheckered, faGaugeHigh, faLayerGroup } from '@fortawesome/free-solid-svg-icons'

function MetricCard({ icon, label, children }) {
  return <div className="journey-metric"><span aria-hidden="true"><FontAwesomeIcon icon={icon} /></span><div><small>{label}</small><strong>{children}</strong></div></div>
}

function JourneyDashboard({ dashboard }) {
  const { progress } = dashboard
  return (
    <section aria-labelledby="journey-dashboard-title" className={`journey-dashboard${dashboard.complete ? ' journey-dashboard--complete' : ''}`}>
      <div className="journey-dashboard-heading"><div><p className="roadmap-kicker">YOUR CURRENT STATUS</p><h2 id="journey-dashboard-title">Journey Dashboard</h2></div>{dashboard.complete && <strong className="journey-complete-label">Journey complete</strong>}</div>
      <div className="journey-dashboard-grid">
        <article className="journey-progress-card">
          <div><span>Overall completion</span><strong>{progress.percentage}%</strong></div>
          <progress aria-label={`${progress.percentage}% of roadmap completed`} max="100" value={progress.percentage}>{progress.percentage}%</progress>
          <p><strong>{progress.completedCount}</strong> completed <span aria-hidden="true">·</span> <strong>{dashboard.remainingCount}</strong> remaining</p>
        </article>
        <div className="journey-metrics-grid">
          <MetricCard icon={faLayerGroup} label="Current position">Phase {dashboard.currentPhase} of {dashboard.totalPhases} · {dashboard.strategy} · {dashboard.startingLevel}</MetricCard>
          <MetricCard icon={faClock} label="Weekly availability">{dashboard.weeklyHours} hours/week · {dashboard.timeline}</MetricCard>
          <MetricCard icon={faCalendarCheck} label="Estimated finish">{dashboard.estimatedFinish.label}</MetricCard>
          <MetricCard icon={faGaugeHigh} label="Plan feasibility">{dashboard.feasibilityScore}% · {dashboard.riskLevel} risk</MetricCard>
        </div>
        <article aria-live="polite" className="journey-next-card">
          <span aria-hidden="true"><FontAwesomeIcon icon={faFlagCheckered} /></span>
          <div><small>{dashboard.nextAction.label}</small><h3>{dashboard.nextAction.title}</h3><p>{dashboard.nextAction.phaseTitle}</p></div>
        </article>
      </div>
      <p className="journey-estimate-note">Estimated finish is a planning guide based on your current timeline and completion progress.</p>
    </section>
  )
}

export default JourneyDashboard
