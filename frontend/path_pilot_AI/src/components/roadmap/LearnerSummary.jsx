function LearnerSummary({ learner, roadmap }) {
  const feasibilityScore = Math.min(100, Math.max(0, Number(roadmap.feasibilityScore ?? roadmap.confidenceScore) || 0))
  const riskLevel = roadmap.criticReview?.riskLevel
  const confidenceColor = riskLevel === 'High' || feasibilityScore <= 44
    ? '#c8563f'
    : riskLevel === 'Medium' || feasibilityScore <= 74
      ? '#b7791f'
      : '#168564'

  return (
    <section className="learner-summary" aria-label="Roadmap overview">
      <div><span className="summary-stat-icon">◷</span><div><span>Target timeline</span><strong>{learner.timeline.split(' (')[0]}</strong></div></div>
      <div><span className="summary-stat-icon">◴</span><div><span>Weekly availability</span><strong>{learner.hours} hours/week</strong></div></div>
      <div><span className="summary-stat-icon">◎</span><div><span>Starting level</span><strong>{learner.level}</strong></div></div>
      <div className="confidence-stat"><span className="confidence-ring" style={{ '--confidence-color': confidenceColor, '--confidence-score': `${feasibilityScore}%` }}>{feasibilityScore}</span><div><span>Plan feasibility</span><strong>{feasibilityScore}% confidence</strong></div></div>
    </section>
  )
}

export default LearnerSummary
