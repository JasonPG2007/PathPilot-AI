import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRotateLeft, faArrowsRotate, faCircleCheck, faDownload, faTrashArrowUp } from '@fortawesome/free-solid-svg-icons'

function RoadmapActions({ onOpenReplan, onResetProgress }) {
  const [message, setMessage] = useState('')

  return (
    <section className="roadmap-actions">
      <span className="execution-badge"><FontAwesomeIcon aria-hidden="true" icon={faCircleCheck} /> READY FOR EXECUTION</span>
      <h2>Your future starts now.</h2>
      <p>PathPilot AI has optimized your learning journey. Download your roadmap or begin a fresh path.</p>
      <div><button className="button" onClick={onOpenReplan} type="button"><FontAwesomeIcon aria-hidden="true" icon={faArrowsRotate} /> Replan My Journey</button><button className="button button--secondary" onClick={() => setMessage('Roadmap downloads are coming soon. Your plan is safe on this page.')} type="button"><FontAwesomeIcon aria-hidden="true" icon={faDownload} /> Download Roadmap</button><Link className="button button--secondary" to="/create"><FontAwesomeIcon aria-hidden="true" icon={faArrowRotateLeft} /> Start Again</Link><button className="text-action reset-progress-action" onClick={onResetProgress} type="button"><FontAwesomeIcon aria-hidden="true" icon={faTrashArrowUp} /> Reset Progress</button><Link className="text-action" to="/">Back Home</Link></div>
      <p className="download-message" aria-live="polite">{message}</p>
    </section>
  )
}

export default RoadmapActions
