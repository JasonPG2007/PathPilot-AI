import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faRoute } from '@fortawesome/free-solid-svg-icons'

function formatUpdatedDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
}

function ContinueJourneySection({ journey, onContinue }) {
  const updatedDate = formatUpdatedDate(journey.lastUpdated)
  return (
    <section className="continue-journey" aria-labelledby="continue-journey-title">
      <div className="continue-journey__icon" aria-hidden="true"><FontAwesomeIcon icon={faRoute} /></div>
      <div className="continue-journey__content">
        <span>YOUR SAVED JOURNEY</span>
        <h2 id="continue-journey-title">{journey.goal}</h2>
        <p>{journey.strategyName}{updatedDate ? ` · Updated ${updatedDate}` : ''}</p>
      </div>
      <button className="button continue-journey__button" onClick={onContinue} type="button">
        Continue Journey <FontAwesomeIcon aria-hidden="true" icon={faArrowRight} />
      </button>
    </section>
  )
}

export default ContinueJourneySection
