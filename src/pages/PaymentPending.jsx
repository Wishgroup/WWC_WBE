import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './ApplicationSubmitted.css'

const PaymentPending = () => {
  return (
    <div className="application-submitted">
      <Header />
      <div className="status-container">
        <div className="status-card">
          <div className="status-icon pending">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 10H21M7 15H11M17 15H17.01M6 3V5M18 3V5M3 8L3 19C3 20.1046 3.89543 21 5 21L19 21C20.1046 21 21 20.1046 21 19V8M3 8H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Payment Pending</h1>
          <p className="status-message">
            Your payment is currently being processed.
          </p>
          <p className="status-details">
            Please complete your payment to proceed with your application. If you've already made a payment, it may take a few minutes to process. You will receive a confirmation email once your payment is confirmed.
          </p>
          <div className="status-actions">
            <Link to="/join" className="btn-primary">
              Complete Payment
            </Link>
            <Link to="/" className="btn-primary" style={{ background: '#6c757d' }}>
              Return to Home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default PaymentPending





