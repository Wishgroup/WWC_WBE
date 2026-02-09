import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './ApplicationSubmitted.css'

const ApplicationPending = () => {
  return (
    <div className="application-submitted">
      <Header />
      <div className="status-container">
        <div className="status-card">
          <div className="status-icon pending">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Application Pending Review</h1>
          <p className="status-message">
            Your application is currently under review by our administration team.
          </p>
          <p className="status-details">
            We typically process applications within 1-3 business days. You will receive an email notification once your application has been approved or if we need any additional information.
          </p>
          <div className="status-actions">
            <Link to="/" className="btn-primary">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ApplicationPending





