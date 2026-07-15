import ResourceCard from './ResourceCard.jsx'

function PhaseResources({ resources }) {
  return (
    <section className="phase-resources" aria-label="Recommended learning resources">
      <div><h4>Recommended Resources</h4><span>Independent external learning links</span></div>
      {resources.length ? <div className="phase-resource-grid">{resources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}</div> : <p className="resource-empty" role="status">No trusted resource match yet. Your roadmap remains fully usable.</p>}
    </section>
  )
}

export default PhaseResources
