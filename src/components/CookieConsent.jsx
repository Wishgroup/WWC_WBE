import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './CookieConsent.css'

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('wwc_cookie_consent')
    const consentTimestamp = localStorage.getItem('wwc_cookie_consent_timestamp')
    
    // Show banner if no consent or consent is older than 1 year
    if (!consent) {
      setShowBanner(true)
    } else if (consentTimestamp) {
      const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000)
      if (parseInt(consentTimestamp) < oneYearAgo) {
        setShowBanner(true)
      }
    }
  }, [])

  const handleAcceptAll = () => {
    const timestamp = Date.now()
    localStorage.setItem('wwc_cookie_consent', 'all')
    localStorage.setItem('wwc_cookie_consent_timestamp', timestamp.toString())
    localStorage.setItem('wwc_cookie_preferences', JSON.stringify({
      essential: true,
      functional: true,
      analytics: true,
      marketing: true
    }))
    setShowBanner(false)
  }

  const handleAcceptEssential = () => {
    const timestamp = Date.now()
    localStorage.setItem('wwc_cookie_consent', 'essential')
    localStorage.setItem('wwc_cookie_consent_timestamp', timestamp.toString())
    localStorage.setItem('wwc_cookie_preferences', JSON.stringify({
      essential: true,
      functional: false,
      analytics: false,
      marketing: false
    }))
    setShowBanner(false)
  }

  const handleManagePreferences = () => {
    setShowPreferences(true)
  }

  const handleSavePreferences = (preferences) => {
    const timestamp = Date.now()
    const hasAnyConsent = preferences.functional || preferences.analytics || preferences.marketing
    localStorage.setItem('wwc_cookie_consent', hasAnyConsent ? 'custom' : 'essential')
    localStorage.setItem('wwc_cookie_consent_timestamp', timestamp.toString())
    localStorage.setItem('wwc_cookie_preferences', JSON.stringify({
      essential: true, // Always true
      ...preferences
    }))
    setShowBanner(false)
    setShowPreferences(false)
  }

  if (!showBanner && !showPreferences) {
    return null
  }

  return (
    <>
      {showBanner && (
        <div className="cookie-consent-banner">
          <div className="cookie-consent-content">
            <div className="cookie-consent-text">
              <p>
                We use <strong>essential cookies and local storage</strong> to ensure your session, authentication, and platform functionality.
                Optional cookies for analytics or marketing may be added in the future.
              </p>
              <p className="cookie-consent-subtext">
                By continuing to use this website, you consent to our use of cookies and local storage.{' '}
                <Link to="/cookie-policy" className="cookie-link">Learn More</Link>
              </p>
            </div>
            <div className="cookie-consent-actions">
              <button 
                className="cookie-btn cookie-btn-secondary"
                onClick={handleAcceptEssential}
              >
                Essential Only
              </button>
              <button 
                className="cookie-btn cookie-btn-primary"
                onClick={handleAcceptAll}
              >
                Accept All
              </button>
              <button 
                className="cookie-btn cookie-btn-link"
                onClick={handleManagePreferences}
              >
                Manage Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreferences && (
        <CookiePreferencesModal
          onSave={handleSavePreferences}
          onClose={() => setShowPreferences(false)}
        />
      )}
    </>
  )
}

const CookiePreferencesModal = ({ onSave, onClose }) => {
  const [preferences, setPreferences] = useState({
    functional: false,
    analytics: false,
    marketing: false
  })

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = () => {
    onSave(preferences)
  }

  return (
    <div className="cookie-preferences-overlay" onClick={onClose}>
      <div className="cookie-preferences-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cookie-preferences-header">
          <h2>Cookie Preferences</h2>
          <button className="cookie-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="cookie-preferences-content">
          <div className="cookie-preference-item">
            <div className="cookie-preference-info">
              <h3>Essential Cookies</h3>
              <p>Required for website functionality, authentication, and security. Cannot be disabled.</p>
            </div>
            <div className="cookie-preference-toggle">
              <input type="checkbox" checked disabled />
            </div>
          </div>

          <div className="cookie-preference-item">
            <div className="cookie-preference-info">
              <h3>Functional Cookies</h3>
              <p>Remember your preferences and settings for a better experience.</p>
            </div>
            <div className="cookie-preference-toggle">
              <input 
                type="checkbox" 
                checked={preferences.functional}
                onChange={() => handleToggle('functional')}
              />
            </div>
          </div>

          <div className="cookie-preference-item">
            <div className="cookie-preference-info">
              <h3>Analytics Cookies</h3>
              <p>Help us understand how visitors use our website (not currently active).</p>
            </div>
            <div className="cookie-preference-toggle">
              <input 
                type="checkbox" 
                checked={preferences.analytics}
                onChange={() => handleToggle('analytics')}
              />
            </div>
          </div>

          <div className="cookie-preference-item">
            <div className="cookie-preference-info">
              <h3>Marketing Cookies</h3>
              <p>Used for advertising and retargeting (not currently active).</p>
            </div>
            <div className="cookie-preference-toggle">
              <input 
                type="checkbox" 
                checked={preferences.marketing}
                onChange={() => handleToggle('marketing')}
              />
            </div>
          </div>
        </div>
        <div className="cookie-preferences-footer">
          <Link to="/cookie-policy" className="cookie-link">View Full Cookie Policy</Link>
          <div className="cookie-preferences-actions">
            <button className="cookie-btn cookie-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="cookie-btn cookie-btn-primary" onClick={handleSave}>
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CookieConsent
