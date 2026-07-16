import { useEffect, useMemo, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faDownload, faLink, faShareNodes, faXmark } from '@fortawesome/free-solid-svg-icons'
import { copyShareText, createRoadmapShareSummary, getSharePanelAccessibility, getShareUrl, shareNatively } from '../../services/roadmapShare.js'

function ShareRoadmapPanel({ details, onClose, onDownloadPdf, preparingPdf }) {
  const panelRef = useRef(null)
  const [feedback, setFeedback] = useState('')
  const shareUrl = useMemo(() => getShareUrl(), [])
  const summary = useMemo(() => createRoadmapShareSummary(details, shareUrl), [details, shareUrl])

  useEffect(() => {
    const previousFocus = document.activeElement
    const panel = panelRef.current
    const focusable = () => [...panel.querySelectorAll('button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])')]
    focusable()[0]?.focus()
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusable()
      if (!items.length) return
      const first = items[0]
      const last = items.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => { document.removeEventListener('keydown', handleKeyDown); previousFocus?.focus?.() }
  }, [onClose])

  async function handleNativeShare() {
    const result = await shareNatively({ title: `PathPilot AI — ${details.goal}`, text: summary, url: shareUrl })
    setFeedback(result.status === 'cancelled' ? 'Share cancelled' : result.status === 'unsupported' ? 'Sharing is not supported in this browser' : result.status === 'failed' ? 'We could not open the share menu' : 'Share menu opened')
  }

  async function handleCopy(value, successMessage) {
    try {
      await copyShareText(value)
      setFeedback(successMessage)
    } catch {
      setFeedback('Copy failed. Please try again or copy the address from your browser.')
    }
  }

  return (
    <div className="share-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }} role="presentation">
      <aside {...getSharePanelAccessibility()} className="share-panel" ref={panelRef}>
        <div className="share-panel-heading"><div><p className="roadmap-kicker">LOCAL ROADMAP</p><h2 id="share-roadmap-title">Share &amp; Export</h2></div><button aria-label="Close Share & Export panel" onClick={onClose} type="button"><FontAwesomeIcon aria-hidden="true" icon={faXmark} /></button></div>
        <div className="share-roadmap-preview"><strong>{details.goal}</strong><span>{details.strategy} · {details.completionPercentage}% complete</span></div>
        <div className="share-action-grid">
          <button aria-label="Share roadmap summary" className="button" onClick={handleNativeShare} type="button"><FontAwesomeIcon aria-hidden="true" icon={faShareNodes} /> Share Summary</button>
          <button aria-label="Copy PathPilot app link" className="button button--secondary" onClick={() => handleCopy(shareUrl, 'Link copied')} type="button"><FontAwesomeIcon aria-hidden="true" icon={faLink} /> Copy App Link</button>
          <button aria-label="Copy roadmap summary" className="button button--secondary" onClick={() => handleCopy(summary, 'Summary copied')} type="button"><FontAwesomeIcon aria-hidden="true" icon={faCopy} /> Copy Roadmap Summary</button>
          <button className="button button--secondary" disabled={preparingPdf} onClick={onDownloadPdf} type="button"><FontAwesomeIcon aria-hidden="true" icon={faDownload} /> {preparingPdf ? 'Preparing PDF...' : 'Download PDF'}</button>
        </div>
        <div className="share-privacy-note"><strong>Private by default</strong><p>Share a summary or export a PDF. Your full roadmap and saved progress remain private on this device.</p><p>The copied app link opens PathPilot but does not transfer this roadmap to another browser.</p></div>
        <p className="share-feedback" aria-live="polite" role="status">{feedback}</p>
      </aside>
    </div>
  )
}

export default ShareRoadmapPanel
