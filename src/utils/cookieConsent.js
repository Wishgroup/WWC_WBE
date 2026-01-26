/**
 * Cookie Consent Utility
 * Helper functions to check and manage cookie consent preferences
 */

/**
 * Get current cookie consent status
 * @returns {Object} Consent preferences
 */
export const getCookieConsent = () => {
  const consent = localStorage.getItem('wwc_cookie_consent')
  const preferences = localStorage.getItem('wwc_cookie_preferences')
  
  if (!consent) {
    return {
      consented: false,
      essential: true, // Essential cookies always allowed
      functional: false,
      analytics: false,
      marketing: false
    }
  }

  const prefs = preferences ? JSON.parse(preferences) : {
    essential: true,
    functional: false,
    analytics: false,
    marketing: false
  }

  return {
    consented: true,
    consentType: consent,
    ...prefs
  }
}

/**
 * Check if specific cookie type is allowed
 * @param {string} type - 'essential', 'functional', 'analytics', 'marketing'
 * @returns {boolean}
 */
export const isCookieAllowed = (type) => {
  const consent = getCookieConsent()
  
  if (type === 'essential') {
    return true // Essential cookies always allowed
  }
  
  return consent[type] === true
}

/**
 * Check if user has consented to cookies
 * @returns {boolean}
 */
export const hasConsented = () => {
  const consent = getCookieConsent()
  return consent.consented
}

/**
 * Withdraw consent (clear consent preferences)
 */
export const withdrawConsent = () => {
  localStorage.removeItem('wwc_cookie_consent')
  localStorage.removeItem('wwc_cookie_consent_timestamp')
  localStorage.removeItem('wwc_cookie_preferences')
  
  // Reload page to apply changes
  window.location.reload()
}

/**
 * Example: Load analytics script only if consent given
 * Use this pattern for any third-party scripts
 */
export const loadAnalyticsIfConsented = () => {
  if (isCookieAllowed('analytics')) {
    // Load analytics script here
    // Example: Google Analytics, etc.
    console.log('Analytics cookies allowed - loading analytics script')
    // Your analytics initialization code here
  } else {
    console.log('Analytics cookies not consented - skipping analytics')
  }
}

/**
 * Example: Load marketing scripts only if consent given
 */
export const loadMarketingIfConsented = () => {
  if (isCookieAllowed('marketing')) {
    // Load marketing/retargeting scripts here
    console.log('Marketing cookies allowed - loading marketing script')
    // Your marketing script initialization code here
  } else {
    console.log('Marketing cookies not consented - skipping marketing')
  }
}

export default {
  getCookieConsent,
  isCookieAllowed,
  hasConsented,
  withdrawConsent,
  loadAnalyticsIfConsented,
  loadMarketingIfConsented
}
