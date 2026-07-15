function RoadmapStrategySelector({ comparisons, onChange, selectedStrategy }) {
  return (
    <section className="strategy-selector" aria-labelledby="strategy-heading">
      <div className="strategy-heading"><div><p className="roadmap-kicker">LEARNING STRATEGY</p><h2 id="strategy-heading">Compare your paths</h2></div><p>Switch instantly without changing your saved progress.</p></div>
      <div className="strategy-grid">{comparisons.map((strategy) => {
        const selected = strategy.id === selectedStrategy
        return <button aria-pressed={selected} className={`strategy-card${selected ? ' strategy-card--selected' : ''}`} key={strategy.id} onClick={() => onChange(strategy.id)} type="button"><span className="strategy-label">{strategy.label}</span><strong>{strategy.name}</strong><p>{strategy.description}</p><dl><div><dt>Timeline</dt><dd>{strategy.timeline}</dd></div><div><dt>Weekly</dt><dd>{strategy.weeklyHours}h</dd></div><div><dt>Risk</dt><dd>{strategy.riskLevel}</dd></div><div><dt>Confidence</dt><dd>{strategy.feasibilityScore}%</dd></div></dl></button>
      })}</div>
    </section>
  )
}

export default RoadmapStrategySelector
