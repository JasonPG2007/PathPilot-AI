import { Link, NavLink, useNavigate } from 'react-router-dom'
import { startNewJourney } from '../../lib/newJourney.js'

function Header() {
  const navigate = useNavigate()
  return (
    <div className="site-header__inner">
      <Link className="brand" to="/">PathPilot AI</Link>
      <nav aria-label="Main navigation">
        <ul className="nav-list">
          <li><NavLink className="nav-link" end to="/">Explore</NavLink></li>
          <li><a className="nav-link" href="/#how-it-works">How It Works</a></li>
          <li><a className="nav-link" href="/#features">Pricing</a></li>
        </ul>
      </nav>
      <div className="header-actions">
        <button className="login-button" type="button">Log in</button>
        <button className="button button--small" onClick={() => startNewJourney(navigate)} type="button">Start Journey</button>
      </div>
    </div>
  )
}

export default Header
