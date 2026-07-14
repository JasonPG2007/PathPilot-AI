function FeatureCard({ icon, iconClass, title, children }) {
  return (
    <article className="feature-card">
      <div className={`feature-icon ${iconClass}`} aria-hidden="true">{icon}</div>
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  )
}

export default FeatureCard
