import { useState } from 'react'
import { Link } from 'react-router-dom'

function RoadmapActions({ onResetProgress }) {
  const [message, setMessage] = useState('')

  return (
    <section className="roadmap-actions">
      <span className="execution-badge">✦ READY FOR EXECUTION</span>
      <h2>Your future starts now.</h2>
      <p>PathPilot AI has optimized your learning journey. Download your roadmap or begin a fresh path.</p>
      <div><button className="button" onClick={() => setMessage('Roadmap downloads are coming soon. Your plan is safe on this page.')} type="button">⇩ Download Roadmap</button><Link className="button button--secondary" to="/create">↻ Start Again</Link><button className="text-action reset-progress-action" onClick={onResetProgress} type="button">Reset Progress</button><Link className="text-action" to="/">Back Home</Link></div>
      <p className="download-message" aria-live="polite">{message}</p>
    </section>
  )
}

export default RoadmapActions
