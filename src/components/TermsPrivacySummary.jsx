import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './TermsPrivacySummary.css'

const TermsPrivacySummary = ({ onClose }) => {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Check if user has already acknowledged the summary
    const acknowledged = localStorage.getItem('wwc_terms_privacy_acknowledged')
    if (!acknowledged) {
      setShowModal(true)
    }
  }, [])

  const handleAcknowledge = () => {
    localStorage.setItem('wwc_terms_privacy_acknowledged', 'true')
    localStorage.setItem('wwc_terms_privacy_acknowledged_date', new Date().toISOString())
    setShowModal(false)
    if (onClose) onClose()
  }

  if (!showModal) {
    return null
  }

  return (
    <div className="terms-privacy-overlay" onClick={handleAcknowledge}>
      <div className="terms-privacy-modal" onClick={(e) => e.stopPropagation()}>
        <div className="terms-privacy-header">
          <h2>Welcome to Wish Waves Club</h2>
          <button className="terms-close-btn" onClick={handleAcknowledge}>×</button>
        </div>
        <div className="terms-privacy-content">
          <p className="terms-privacy-intro">
            By using Wish Waves Club, you agree to our <strong>Terms of Use</strong> and <strong>Privacy Policy</strong>.
          </p>
          
          <div className="terms-privacy-summary">
            <h3>What We Collect</h3>
            <ul>
              <li>Personal data (name, email, contact information, ID documents)</li>
              <li>Payment information (processed securely by third-party gateways)</li>
              <li>NFC card usage data (location, transactions, validation results)</li>
              <li>Technical data (IP address, device information, session data)</li>
            </ul>

            <h3>How We Use Your Data</h3>
            <ul>
              <li>Provide membership services and benefits</li>
              <li>Process payments and manage your account</li>
              <li>Validate NFC card usage at partner vendors</li>
              <li>Detect and prevent fraud</li>
              <li>Comply with legal obligations</li>
              <li>Provide customer support</li>
            </ul>

            <h3>Your Rights</h3>
            <ul>
              <li><strong>Access:</strong> View and export your data</li>
              <li><strong>Correction:</strong> Update your personal information</li>
              <li><strong>Deletion:</strong> Request account deletion (subject to legal requirements)</li>
              <li><strong>Portability:</strong> Export your data in machine-readable format</li>
              <li><strong>Objection:</strong> Opt-out of marketing communications</li>
            </ul>
          </div>

          <div className="terms-privacy-links">
            <Link to="/terms" className="terms-link">View Terms of Use</Link>
            <Link to="/privacy" className="terms-link">View Privacy Policy</Link>
            <Link to="/security" className="terms-link">View Security Policy</Link>
            <Link to="/cookie-policy" className="terms-link">View Cookie Policy</Link>
          </div>
        </div>
        <div className="terms-privacy-footer">
          <button className="terms-btn terms-btn-primary" onClick={handleAcknowledge}>
            I Understand
          </button>
        </div>
      </div>
    </div>
  )
}

export default TermsPrivacySummary
