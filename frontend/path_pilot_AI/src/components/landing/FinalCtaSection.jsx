import { Link } from 'react-router-dom'

function FinalCtaSection() {
  return (
    <section className="final-cta">
      <h2>Ready to navigate your future?</h2>
      <p>Join the new era of cognitive-led career development. Your roadmap is waiting.</p>
      <div className="cta-actions">
        <Link className="button" to="/create">Generate My First Roadmap</Link>
        <button className="button button--secondary" type="button">View Example Path</button>
      </div>
    </section>
  )
}

export default FinalCtaSection
