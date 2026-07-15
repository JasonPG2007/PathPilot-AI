function ResourceCard({ compact = false, resource }) {
  return (
    <article className={`resource-card${compact ? ' resource-card--compact' : ''}`}>
      <div className="resource-card-heading"><span>{resource.resourceType}</span><span className={`resource-cost resource-cost--${resource.freeOrPaid.toLowerCase()}`}>{resource.freeOrPaid}</span></div>
      <h5>{resource.title}</h5>
      <p className="resource-provider">{resource.provider} · {resource.estimatedTime}</p>
      {!compact && <><span className="resource-match">Matches: {resource.matchLabel}</span><p className="resource-reason">{resource.recommendationReason}</p></>}
      <a aria-label={`Open ${resource.title} from ${resource.provider} in a new tab`} href={resource.url} rel="noopener noreferrer" target="_blank">View external resource <span aria-hidden="true">↗</span></a>
    </article>
  )
}

export default ResourceCard
