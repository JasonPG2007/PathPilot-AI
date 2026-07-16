import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowsRotate, faChartLine, faCircleHalfStroke, faCircleQuestion, faFlagCheckered,
  faFolderOpen, faLayerGroup, faLock, faRoute, faShoePrints, faTrophy,
} from '@fortawesome/free-solid-svg-icons'

const icons = {
  'arrows-rotate': faArrowsRotate,
  'chart-line': faChartLine,
  'circle-half-stroke': faCircleHalfStroke,
  'circle-question': faCircleQuestion,
  'flag-checkered': faFlagCheckered,
  'folder-open': faFolderOpen,
  'layer-group': faLayerGroup,
  route: faRoute,
  'shoe-prints': faShoePrints,
  trophy: faTrophy,
}

function AchievementsSection({ announcement, badges }) {
  const earned = badges.filter((badge) => badge.earned)
  const locked = badges.filter((badge) => !badge.earned)
  const next = [...locked].sort((left, right) => right.progress.percentage - left.progress.percentage)[0]

  return (
    <section aria-labelledby="achievements-title" className="achievements-section">
      <div className="achievements-heading"><div><p className="roadmap-kicker">PROGRESS RECOGNITION</p><h2 id="achievements-title">Achievements</h2></div><strong>{earned.length} of {badges.length} earned</strong></div>
      <div className="achievement-grid">
        {badges.map((badge) => (
          <article aria-label={`${badge.title}, ${badge.earned ? 'earned' : 'locked'}, ${badge.rarity}`} className={`achievement-card${badge.earned ? ' achievement-card--earned' : ' achievement-card--locked'}`} key={badge.id} tabIndex="0">
            <span className="achievement-icon" aria-hidden="true"><FontAwesomeIcon icon={icons[badge.icon]} /></span>
            <div><div className="achievement-title-row"><h3>{badge.title}</h3><span>{badge.earned ? badge.rarity : <><FontAwesomeIcon aria-hidden="true" icon={faLock} /> Locked</>}</span></div><p>{badge.description}</p>{badge.earned ? <small>Earned {new Date(badge.earnedAt).toLocaleDateString()}</small> : <><div aria-hidden="true" className="achievement-progress"><span style={{ width: `${badge.progress.percentage}%` }} /></div><small>{badge.progress.label}</small></>}</div>
          </article>
        ))}
      </div>
      {next && <article className="next-achievement" aria-label={`Next achievement: ${next.title}`}><span aria-hidden="true"><FontAwesomeIcon icon={icons[next.icon]} /></span><div><small>Next achievement</small><h3>{next.title}</h3><p>{next.progress.label}</p></div></article>}
      <p className="achievement-announcement" aria-live="polite" role="status">{announcement}</p>
    </section>
  )
}

export default AchievementsSection
