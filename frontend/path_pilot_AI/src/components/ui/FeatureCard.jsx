function FeatureCard({ icon, iconClass, title, children }) {
  return (
    <article className="feature-card">
      <div className={`feature-icon ${iconClass}`}><FontAwesomeIcon aria-hidden="true" icon={icon} /></div>
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  )
}

export default FeatureCard
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
