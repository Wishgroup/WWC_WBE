import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './ApplicationSubmitted.css'

const ApplicationSubmitted = () => {
  return (
    <div className="application-submitted">
      <Header />
      <div className="status-container">
        <div className="status-card">
          <div className="status-icon success">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Application Submitted</h1>
          <p className="status-message">
            Thank you for submitting your application! We have received your information and payment.
          </p>
          <p className="status-details">
            Your application is now being reviewed by our team. You will receive an email notification once your application has been processed.
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

export default ApplicationSubmitted






