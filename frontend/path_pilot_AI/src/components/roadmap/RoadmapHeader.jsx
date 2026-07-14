function RoadmapHeader({ goal }) {
  return (
    <header className="roadmap-header">
      <p className="roadmap-breadcrumb">PathPilot AI <span>›</span> Active Roadmap</p>
      <div><div><p className="roadmap-kicker">YOUR PERSONALIZED PATH</p><h1>{goal}</h1></div><span className="roadmap-ready-badge">✓ ROADMAP READY</span></div>
    </header>
  )
}

export default RoadmapHeader
