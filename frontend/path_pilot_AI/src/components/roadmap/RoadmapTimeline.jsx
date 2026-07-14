import RoadmapPhaseCard from './RoadmapPhaseCard.jsx'

function RoadmapTimeline({ phases }) {
  return (
    <section className="roadmap-timeline">
      <div className="roadmap-section-heading"><div><span>▣</span><h2>Learning Journey Timeline</h2></div><p>{phases.length} phases identified</p></div>
      <div className="timeline-list">{phases.map((phase, index) => <RoadmapPhaseCard key={phase.id} number={index + 1} phase={phase} />)}</div>
    </section>
  )
}

export default RoadmapTimeline
