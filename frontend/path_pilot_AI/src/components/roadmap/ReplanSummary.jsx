function ReplanSummary({ summary }) {
  return (
    <section className="replan-summary" aria-live="polite">
      <div><p className="roadmap-kicker">JOURNEY REPLANNED</p><h2>Your revised plan is ready.</h2></div>
      <dl>
        <div><dt>What changed</dt><dd>{summary.whatChanged}</dd></div>
        <div><dt>Why</dt><dd>{summary.why}</dd></div>
        <div><dt>Timeline</dt><dd>{summary.timeline}</dd></div>
        <div><dt>Weekly workload</dt><dd>{summary.weeklyHours} hours/week</dd></div>
        <div><dt>Risk and confidence</dt><dd>{summary.riskLevel} risk · {summary.confidenceScore}%</dd></div>
      </dl>
    </section>
  )
}

export default ReplanSummary
