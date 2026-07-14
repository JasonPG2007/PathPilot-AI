import { Link } from 'react-router-dom'

function HeroSection({ visual }) {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <div className="announcement"><span>✦</span> BUILT AGENT-FIRST</div>
        <h1>Turn Your Career Goal Into a <span>Personalized Learning Roadmap</span></h1>
        <p>PathPilot AI uses multiple AI agents to plan, review, and refine personalized learning journeys. We don&apos;t just find links; we architect your expertise.</p>
        <div className="hero-actions">
          <Link className="button" to="/create">Start My Journey <span aria-hidden="true">→</span></Link>
          <button className="button button--secondary" type="button"><span className="play-icon">▶</span> Watch Demo</button>
        </div>
      </div>
      {visual}
    </section>
  )
}

export default HeroSection
