import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBrain, faCircleCheck, faCircleInfo, faCircleQuestion, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'

const insights = [
  { key: 'strengths', label: 'Strengths', icon: faCircleCheck, tone: 'success' },
  { key: 'biggestChallenge', label: 'Biggest Challenge', icon: faTriangleExclamation, tone: 'warning' },
  { key: 'recommendedStrategy', label: 'Recommended Strategy', icon: faCircleInfo, tone: 'info' },
  { key: 'nextAdvice', label: 'Next Advice', icon: faCircleQuestion, tone: 'info' },
]

function CoachSummaryCard({ summary }) {
  if (!summary) return null

  return (
    <section aria-label="AI Coach Insights" className="coach-summary-card">
      <div className="coach-summary-heading">
        <span aria-hidden="true"><FontAwesomeIcon icon={faBrain} /></span>
        <div><p className="roadmap-kicker">PERSONALIZED GUIDANCE</p><h2>AI Coach Insights</h2></div>
      </div>
      <div className="coach-insight-grid">
        {insights.map(({ key, label, icon, tone }) => (
          <article key={key}>
            <div className="semantic-list-item"><span className={`semantic-list-icon semantic-list-icon--${tone}`}><FontAwesomeIcon aria-hidden="true" icon={icon} /></span><h3>{label}</h3></div>
            <p>{summary[key]}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default CoachSummaryCard
