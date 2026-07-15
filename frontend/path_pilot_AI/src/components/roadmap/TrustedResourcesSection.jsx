import ResourceCard from './ResourceCard.jsx'

function TrustedResourcesSection({ resources }) {
  if (!resources.length) return null
  return (
    <section className="trusted-resources-section roadmap-variant-transition" aria-labelledby="trusted-resources-heading">
      <div className="roadmap-section-heading"><div><span>↗</span><h2 id="trusted-resources-heading">Trusted Learning Resources</h2></div><p>One curated starting point per phase · no provider affiliation implied</p></div>
      <div className="trusted-resource-grid">{resources.map((resource) => <ResourceCard compact key={resource.id} resource={resource} />)}</div>
    </section>
  )
}

export default TrustedResourcesSection
