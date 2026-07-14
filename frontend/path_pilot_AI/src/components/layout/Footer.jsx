import { Link } from 'react-router-dom'

const footerGroups = [
  { title: 'Product', links: ['Explore', 'How It Works', 'Pricing'] },
  { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'AI Ethics'] },
  { title: 'Support', links: ['Contact Support', 'Documentation', 'Help Center'] },
]

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner footer-grid">
        <div className="footer-brand">
          <Link className="brand brand--footer" to="/">PathPilot AI</Link>
          <p>AI-powered clarity, empowering the next generation of high-performance talent.</p>
          <div className="social-links" aria-label="Social links">
            <a href="#linkedin" aria-label="LinkedIn">in</a>
            <a href="#social" aria-label="Social community">●</a>
          </div>
        </div>
        {footerGroups.map((group) => (
          <div className="footer-column" key={group.title}>
            <h2>{group.title}</h2>
            {group.links.map((link) => <a href="#top" key={link}>{link}</a>)}
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <p>Made with precision in San Francisco.</p>
        <p><span className="status-dot" /> Systems Operational <span>v1.2.0 stable</span></p>
      </div>
    </footer>
  )
}

export default Footer
