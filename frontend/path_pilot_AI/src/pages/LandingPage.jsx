import { Link } from 'react-router-dom'

function LandingPage() {
  return (
    <section className="placeholder-page">
      <p className="eyebrow">Personalized learning roadmaps</p>
      <h1>Turn your goal into a practical learning journey.</h1>
      <p className="page-intro">
        PathPilot AI plans, reviews, and refines a roadmap around your goals,
        experience, and available time.
      </p>
      <Link className="button-link" to="/create">Create your journey</Link>
    </section>
  )
}

export default LandingPage
