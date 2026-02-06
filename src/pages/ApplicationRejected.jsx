import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './ApplicationSubmitted.css'

const ApplicationRejected = () => {
  return (
    <div className="application-submitted">
      <Header />
      <div className="status-container">
        <div className="status-card">
          <div className="status-icon rejected">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 14L12 12M12 12L14 10M12 12L10 10M12 12L14 14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Application Not Approved</h1>
          <p className="status-message">
            We're sorry, but your application could not be approved at this time.
          </p>
          <p className="status-details">
            If you have questions about this decision or would like to appeal, please contact our support team. We're here to help.
          </p>
          <div className="status-actions">
            <Link to="/" className="btn-primary">
              Return to Home
            </Link>
            <a href="mailto:info@wishgroup.ae" className="btn-primary" style={{ background: '#6c757d' }}>
              Contact Support
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ApplicationRejected




