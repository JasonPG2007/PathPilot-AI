function ProgressOverview({ currentPhase, phaseCount, progress }) {
  return (
    <section className="roadmap-progress" aria-label="Roadmap progress" aria-live="polite">
      <div><span>Overall progress</span><strong>{progress.percentage}%</strong></div>
      <div className="roadmap-progress-track" role="progressbar" aria-label={`${progress.percentage}% complete`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress.percentage}><span style={{ width: `${progress.percentage}%` }} /></div>
      <p>{progress.percentage === 100 ? 'Roadmap complete' : progress.completedCount === 0 ? 'Ready to begin' : `Current phase: ${currentPhase} of ${phaseCount}`} <small>{progress.completedCount} of {progress.totalCount} items completed</small></p>
    </section>
  )
}

export default ProgressOverview
