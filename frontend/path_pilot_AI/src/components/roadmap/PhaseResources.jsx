import ResourceCard from './ResourceCard.jsx'

function PhaseResources({ resources }) {
  if (!resources.length) return null
  return (
    <section className="phase-resources" aria-label="Recommended learning resources">
      <div><h4>Recommended Resources</h4><span>Independent external learning links</span></div>
      <div className="phase-resource-grid">{resources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}</div>
    </section>
  )
}

export default PhaseResources
