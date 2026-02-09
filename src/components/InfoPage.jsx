import React from 'react'
import { Link } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import './InfoPage.css'

/**
 * Reusable info/placeholder page with title, description, and optional CTA.
 * Used for Rejoin, Refer, Gift, Community, Corporate, Order Status, About, Careers, Press, etc.
 */
const InfoPage = ({ title, description, children, ctaLabel = 'Back to Home', ctaTo = '/', showJoin = true }) => {
  return (
    <div className="info-page">
      <Header />
      <main className="info-page-main">
        <div className="info-page-card">
          <h1 className="info-page-title">{title}</h1>
          <div className="info-page-description">{description}</div>
          {children && <div className="info-page-content">{children}</div>}
          <div className="info-page-actions">
            <Link to={ctaTo} className="info-page-cta">
              {ctaLabel}
            </Link>
            {showJoin && (
              <Link to="/join" className="info-page-cta info-page-cta-secondary">
                Join WWC
              </Link>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default InfoPage
