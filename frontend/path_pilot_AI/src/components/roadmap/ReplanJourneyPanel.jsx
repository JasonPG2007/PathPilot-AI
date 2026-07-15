import { useState } from 'react'

const timelines = ['3 Months (Intensive)', '6 Months (Balanced)', '9 Months (Flexible)', '12 Months (Relaxed)']
const difficulties = ['Time constraints', 'Concept difficulty', 'Keeping consistency', 'Project scope', 'Other']

function ReplanJourneyPanel({ completedMilestones, completedSkills, error, learner, onClose, onSubmit, submitting }) {
  const [weeklyHours, setWeeklyHours] = useState(learner.hours)
  const [timeline, setTimeline] = useState(learner.timeline)
  const [mainDifficulty, setMainDifficulty] = useState(difficulties[0])
  const [note, setNote] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({ weeklyHours: Number(weeklyHours), timeline, mainDifficulty, note: note.trim() || null })
  }

  return (
    <div className="replan-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <aside className="replan-panel" aria-labelledby="replan-title" aria-modal="true" role="dialog">
        <div className="replan-panel-heading"><div><p className="roadmap-kicker">ADAPTIVE REPLANNING</p><h2 id="replan-title">Replan My Journey</h2></div><button aria-label="Close replan panel" onClick={onClose} type="button">×</button></div>
        <p className="replan-intro">Update what changed. Your completed work will remain credited.</p>
        <form onSubmit={handleSubmit}>
          <label>Updated weekly hours<input max="80" min="1" onChange={(event) => setWeeklyHours(event.target.value)} required type="number" value={weeklyHours} /></label>
          <label>Updated target timeline<select onChange={(event) => setTimeline(event.target.value)} value={timeline}>{timelines.map((option) => <option key={option}>{option}</option>)}</select></label>
          <div className="replan-completed"><span>Completed skills</span><p>{completedSkills.length ? completedSkills.join(' · ') : 'None yet'}</p></div>
          <div className="replan-completed"><span>Completed milestones</span><p>{completedMilestones.length ? completedMilestones.join(' · ') : 'None yet'}</p></div>
          <label>Main difficulty encountered<select onChange={(event) => setMainDifficulty(event.target.value)} value={mainDifficulty}>{difficulties.map((option) => <option key={option}>{option}</option>)}</select></label>
          <label>Optional note<textarea maxLength="500" onChange={(event) => setNote(event.target.value)} placeholder="Anything else the revised plan should account for?" rows="3" value={note} /></label>
          {error && <p className="replan-error" role="alert">{error}</p>}
          <div className="replan-panel-actions"><button className="button button--secondary" disabled={submitting} onClick={onClose} type="button">Cancel</button><button className="button" disabled={submitting} type="submit">{submitting ? 'Replanning…' : 'Create Revised Plan'}</button></div>
        </form>
      </aside>
    </div>
  )
}

export default ReplanJourneyPanel
