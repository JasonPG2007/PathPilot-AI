import { useNavigate } from 'react-router-dom'
import { startNewJourney } from '../../lib/newJourney.js'

function FinalCtaSection() {
  const navigate = useNavigate()
  return (
    <section className="final-cta">
      <h2>Ready to navigate your future?</h2>
      <p>Join the new era of cognitive-led career development. Your roadmap is waiting.</p>
      <div className="cta-actions">
        <button className="button" onClick={() => startNewJourney(navigate)} type="button">Generate My First Roadmap</button>
        <button className="button button--secondary" type="button">View Example Path</button>
      </div>
    </section>
  )
}

export default FinalCtaSection
