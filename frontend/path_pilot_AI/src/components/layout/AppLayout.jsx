import { NavLink, Outlet } from 'react-router-dom'

const navigationItems = [
  { label: 'Home', to: '/' },
  { label: 'Create journey', to: '/create' },
]

function AppLayout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <NavLink className="brand" to="/">PathPilot AI</NavLink>
          <nav aria-label="Main navigation">
            <ul className="nav-list">
              {navigationItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
                    end={item.to === '/'}
                    to={item.to}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main className="page-container"><Outlet /></main>
      <footer className="site-footer">
        <div className="site-footer__inner"><p>Build a clearer path toward your learning goal.</p></div>
      </footer>
    </div>
  )
}

export default AppLayout
