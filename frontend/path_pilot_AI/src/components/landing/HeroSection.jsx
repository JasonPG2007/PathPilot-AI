import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faCirclePlay, faWandSparkles } from '@fortawesome/free-solid-svg-icons'

function HeroSection({ visual }) {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <div className="announcement"><FontAwesomeIcon aria-hidden="true" icon={faWandSparkles} /> BUILT AGENT-FIRST</div>
        <h1>Turn Your Career Goal Into a <span>Personalized Learning Roadmap</span></h1>
        <p>PathPilot AI uses multiple AI agents to plan, review, and refine personalized learning journeys. We don&apos;t just find links; we architect your expertise.</p>
        <div className="hero-actions">
          <Link className="button" to="/create">Start My Journey <FontAwesomeIcon aria-hidden="true" icon={faArrowRight} /></Link>
          <button className="button button--secondary" type="button"><FontAwesomeIcon aria-hidden="true" className="play-icon" icon={faCirclePlay} /> Watch Demo</button>
        </div>
      </div>
      {visual}
    </section>
  )
}

export default HeroSection
