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
          <path d="M25 70 L25 30 L45 30 L45 35 L30 35 L30 47 L42 47 L42 52 L30 52 L30 65 L45 65 L45 70 Z" fill="url(#headerGrad)"/>
          <path d="M50 70 L50 30 L65 30 Q75 30 75 42 Q75 54 65 54 L55 54 L55 70 Z M55 35 L55 49 L63 49 Q70 49 70 42 Q70 35 63 35 Z" fill="url(#headerGrad)"/>
        </svg>
        <span className="header-title">Commerce Tools</span>
      </Link>
      <span className="header-subtitle">Documentation</span>
    </header>
  )
}

export default Header

