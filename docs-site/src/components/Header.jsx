import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="header">
      <Link to="/" className="header-logo">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d4aa" />
              <stop offset="100%" stopColor="#007acc" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="20" fill="#0d1117"/>
          <text x="50" y="62" textAnchor="middle" fill="url(#headerGrad)" fontFamily="monospace" fontWeight="bold" fontSize="36">HAC</text>
        </svg>
        <span className="header-title">HAC Client CLI</span>
      </Link>
      <span className="header-subtitle">Documentation</span>
    </header>
  )
}

export default Header
