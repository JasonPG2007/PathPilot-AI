import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRotateLeft, faArrowsRotate, faCircleCheck, faDownload, faTrashArrowUp } from '@fortawesome/free-solid-svg-icons'

function RoadmapActions({ onDownloadPdf, onOpenReplan, onResetProgress, onStartNewJourney }) {
  const [message, setMessage] = useState('')
  const [preparingPdf, setPreparingPdf] = useState(false)

  async function handleDownload() {
    if (preparingPdf) return
    setPreparingPdf(true)
    setMessage('')
    try {
      await onDownloadPdf()
    } catch {
      setMessage('We could not prepare your PDF. Please try again.')
    } finally {
      setPreparingPdf(false)
    }
  }

  return (
    <section className="roadmap-actions">
      <span className="execution-badge"><FontAwesomeIcon aria-hidden="true" icon={faCircleCheck} /> READY FOR EXECUTION</span>
      <h2>Your future starts now.</h2>
      <p>PathPilot AI has optimized your learning journey. Download your roadmap or begin a fresh path.</p>
      <div><button className="button" onClick={onOpenReplan} type="button"><FontAwesomeIcon aria-hidden="true" icon={faArrowsRotate} /> Replan My Journey</button><button aria-label="Download roadmap PDF" className="button button--secondary" disabled={preparingPdf} onClick={handleDownload} type="button"><FontAwesomeIcon aria-hidden="true" icon={faDownload} /> {preparingPdf ? 'Preparing PDF...' : 'Download PDF'}</button><button className="button button--secondary" onClick={onStartNewJourney} type="button"><FontAwesomeIcon aria-hidden="true" icon={faArrowRotateLeft} /> Create New Journey</button><button className="text-action reset-progress-action" onClick={onResetProgress} type="button"><FontAwesomeIcon aria-hidden="true" icon={faTrashArrowUp} /> Reset Progress</button><Link className="text-action" to="/">Back Home</Link></div>
      <p className="download-message download-message--error" aria-live="polite" role={message ? 'alert' : undefined}>{message}</p>
    </section>
  )
}

export default RoadmapActions
