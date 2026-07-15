import { Link } from 'react-router-dom'

function ProcessingError({ message, onRetry }) {
  return (
    <div className="processing-error" role="alert">
      <span className="processing-error__icon" aria-hidden="true">!</span>
      <p className="processing-eyebrow">CONNECTION INTERRUPTED</p>
      <h1>We couldn&apos;t finish your roadmap.</h1>
      <p>{message}</p>
      <div className="processing-error__actions">
        <button className="button" onClick={onRetry} type="button">Retry</button>
        <Link className="button button--secondary" to="/create">Review my details</Link>
      </div>
    </div>
  )
}

export default ProcessingError
