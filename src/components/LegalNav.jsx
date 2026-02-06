import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './LegalNav.css'

const LegalNav = () => {
  const location = useLocation()

  const legalPages = [
    { path: '/terms-of-use', label: 'Terms of Use' },
    { path: '/privacy-policy', label: 'Privacy Policy' },
    { path: '/security', label: 'Security' },
    { path: '/cookie-policy', label: 'Cookie Policy' },
  ]

  return (
    <nav className="legal-nav">
      <div className="legal-nav-container">
        <h3>Legal Pages</h3>
        <ul className="legal-nav-links">
          {legalPages.map((page) => (
            <li key={page.path}>
              <Link
                to={page.path}
                className={location.pathname === page.path ? 'active' : ''}
              >
                {page.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default LegalNav

