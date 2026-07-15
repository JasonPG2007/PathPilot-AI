function ExplanationPanel({ error, explanation, item, loading, onClose, onRetry }) {
  return (
    <div className="explanation-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <aside className="explanation-panel" aria-labelledby="explanation-title" aria-modal="true" role="dialog">
        <div className="explanation-heading"><div><p className="roadmap-kicker">WHY THIS MATTERS</p><h2 id="explanation-title">{item}</h2></div><button aria-label="Close explanation" onClick={onClose} type="button"><FontAwesomeIcon aria-hidden="true" icon={faXmark} /></button></div>
        {loading && <div className="explanation-loading" role="status"><span aria-hidden="true" />Explaining this roadmap decision…</div>}
        {error && <div className="explanation-error" role="alert"><p>{error}</p><button className="button" onClick={onRetry} type="button"><FontAwesomeIcon aria-hidden="true" icon={faRotateRight} /> Retry</button></div>}
        {explanation && <dl className="explanation-content"><div><dt>Why it appears here</dt><dd>{explanation.explanation}</dd></div><div><dt>Prerequisite logic</dt><dd>{explanation.prerequisiteReason}</dd></div><div><dt>Career impact</dt><dd>{explanation.careerImpact}</dd></div><div><dt>Expected benefit</dt><dd>{explanation.expectedBenefit}</dd></div></dl>}
      </aside>
    </div>
  )
}

export default ExplanationPanel
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotateRight, faXmark } from '@fortawesome/free-solid-svg-icons'
