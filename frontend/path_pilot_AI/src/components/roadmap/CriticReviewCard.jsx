import RiskBadge from './RiskBadge.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'

function CriticReviewCard({ review }) {
  return (
    <section className="critic-review-card">
      <div className="critic-heading"><h2>Critic Review</h2><RiskBadge level={review.riskLevel} /></div>
      <p>Your roadmap was audited for feasibility, sequencing, and sustainable workload.</p>
      <div className="review-group"><h3>Issues found</h3><ul>{review.issues.map((issue) => <li className="semantic-list-item" key={issue}><span className="semantic-list-icon semantic-list-icon--warning"><FontAwesomeIcon aria-hidden="true" icon={faTriangleExclamation} /></span><span>{issue}</span></li>)}</ul></div>
      <div className="review-group review-group--changes"><h3>Changes made</h3><ul>{review.changesMade.map((change) => <li className="semantic-list-item" key={change}><span className="semantic-list-icon semantic-list-icon--success"><FontAwesomeIcon aria-hidden="true" icon={faCircleCheck} /></span><span>{change}</span></li>)}</ul></div>
      <div className="review-note"><strong>Timeline adjustment</strong><p>{review.timelineAdjustments}</p></div>
      <div className="review-note"><strong>Prerequisite correction</strong><p>{review.prerequisiteCorrections}</p></div>
    </section>
  )
}

export default CriticReviewCard
