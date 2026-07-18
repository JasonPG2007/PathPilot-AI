import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faCirclePlay, faWandSparkles } from '@fortawesome/free-solid-svg-icons'
import { confirmAndStartNewJourney } from '../../lib/newJourney.js'
import { continueSavedJourney } from '../../lib/landingJourney.js'
import ContinueJourneySection from './ContinueJourneySection.jsx'

function HeroSection({ savedJourney, visual }) {
  const navigate = useNavigate()
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <div className="announcement"><FontAwesomeIcon aria-hidden="true" icon={faWandSparkles} /> BUILT AGENT-FIRST</div>
        <h1>Turn Your Career Goal Into a <span>Personalized Learning Roadmap</span></h1>
        <p>PathPilot AI uses multiple AI agents to plan, review, and refine personalized learning journeys. We don&apos;t just find links; we architect your expertise.</p>
        {savedJourney && <ContinueJourneySection journey={savedJourney} onContinue={() => continueSavedJourney(navigate)} />}
        <div className="hero-actions">
          <button className={`button${savedJourney ? ' button--secondary' : ''}`} onClick={() => confirmAndStartNewJourney(navigate, { savedRoadmap: savedJourney })} type="button">
            {savedJourney ? 'Create Learning Journey' : 'Start My Journey'} <FontAwesomeIcon aria-hidden="true" icon={faArrowRight} />
          </button>
          <button className="button button--secondary" type="button"><FontAwesomeIcon aria-hidden="true" className="play-icon" icon={faCirclePlay} /> Watch Demo</button>
        </div>
      </div>
      {visual}
    </section>
  )
}

export default HeroSection
