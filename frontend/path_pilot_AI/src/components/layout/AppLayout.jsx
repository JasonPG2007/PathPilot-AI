import { Outlet } from 'react-router-dom'
import Footer from './Footer.jsx'
import Header from './Header.jsx'

function AppLayout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Header />
      </header>
      <main className="page-container"><Outlet /></main>
      <Footer />
    </div>
  )
}

export default AppLayout
