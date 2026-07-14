function LearnerSummary({ learner, roadmap }) {
  return (
    <section className="learner-summary" aria-label="Roadmap overview">
      <div><span className="summary-stat-icon">◷</span><div><span>Target timeline</span><strong>{learner.timeline.split(' (')[0]}</strong></div></div>
      <div><span className="summary-stat-icon">◴</span><div><span>Weekly availability</span><strong>{learner.hours} hours/week</strong></div></div>
      <div><span className="summary-stat-icon">◎</span><div><span>Starting level</span><strong>{learner.level}</strong></div></div>
      <div className="confidence-stat"><span className="confidence-ring">{roadmap.confidenceScore}</span><div><span>Plan feasibility</span><strong>{roadmap.confidenceScore}% confidence</strong></div></div>
    </section>
  )
}

export default LearnerSummary
