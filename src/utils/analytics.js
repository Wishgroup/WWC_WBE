/**
 * Google Analytics Utility
 * Handles tracking events and page views
 */

// Initialize Google Analytics
// Note: The Google tag is loaded directly in index.html for better performance
// This function is kept for backward compatibility and dynamic updates
export const initGA = (measurementId) => {
  if (typeof window !== 'undefined' && measurementId && measurementId !== 'G-PLACEHOLDER') {
    // Check if already initialized (from index.html)
    if (window.gtag && window.dataLayer) {
      // Update config with new measurement ID if different
      const currentId = window.dataLayer.find(item => item[0] === 'config')?.[1]
      if (currentId !== measurementId) {
        window.gtag('config', measurementId, {
          page_path: window.location.pathname,
        })
        console.log('✅ Google Analytics config updated:', measurementId)
      }
      return true
    }

    // If gtag is not available, load it dynamically (fallback)
    const script1 = document.createElement('script')
    script1.async = true
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(script1)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    function gtag() {
      window.dataLayer.push(arguments)
    }
    window.gtag = gtag
    gtag('js', new Date())
    gtag('config', measurementId, {
      page_path: window.location.pathname,
    })

    console.log('✅ Google Analytics initialized:', measurementId)
    return true
  }
  return false
}

// Track page view
export const trackPageView = (path, title) => {
  if (typeof window !== 'undefined' && window.gtag) {
    // Use the Measurement ID from the config or get it from the gtag config
    const measurementId = 'G-3P4J56LFXP' // Default to the one in index.html
    window.gtag('config', measurementId, {
      page_path: path,
      page_title: title,
    })
  }
}

// Track custom event
export const trackEvent = (eventName, eventParams = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams)
  }
}

// Track conversion events
export const trackConversion = (conversionType, value = null, currency = 'USD') => {
  trackEvent('conversion', {
    conversion_type: conversionType,
    value: value,
    currency: currency,
  })
}

// Track membership signup
export const trackMembershipSignup = (membershipType, paymentMethod) => {
  trackEvent('membership_signup', {
    membership_type: membershipType,
    payment_method: paymentMethod,
  })
  trackConversion('membership_signup', null, 'USD')
}

// Track payment completion
export const trackPaymentComplete = (membershipType, amount, currency = 'USD', paymentMethod) => {
  trackEvent('purchase', {
    transaction_id: `TXN-${Date.now()}`,
    value: amount,
    currency: currency,
    items: [{
      item_id: membershipType,
      item_name: `${membershipType} Membership`,
      price: amount,
      quantity: 1,
    }],
    payment_method: paymentMethod,
  })
  trackConversion('payment_complete', amount, currency)
}

// Track form submission
export const trackFormSubmit = (formName, formType) => {
  trackEvent('form_submit', {
    form_name: formName,
    form_type: formType,
  })
}

// Track button clicks
export const trackButtonClick = (buttonName, location) => {
  trackEvent('button_click', {
    button_name: buttonName,
    location: location,
  })
}

// Track support ticket creation
export const trackSupportTicket = (ticketType) => {
  trackEvent('support_ticket_created', {
    ticket_type: ticketType,
  })
}

// Track login
export const trackLogin = (userType) => {
  trackEvent('login', {
    user_type: userType,
  })
}

// Track search
export const trackSearch = (searchTerm) => {
  trackEvent('search', {
    search_term: searchTerm,
  })
}

// Track video play
export const trackVideoPlay = (videoTitle) => {
  trackEvent('video_play', {
    video_title: videoTitle,
  })
}

// Track file download
export const trackFileDownload = (fileName, fileType) => {
  trackEvent('file_download', {
    file_name: fileName,
    file_type: fileType,
  })
}

// Track outbound link
export const trackOutboundLink = (url) => {
  trackEvent('outbound_link_click', {
    link_url: url,
  })
}

// Track scroll depth
export const trackScrollDepth = (depth) => {
  trackEvent('scroll_depth', {
    depth: depth,
  })
}

// Track time on page
export const trackTimeOnPage = (timeInSeconds, pagePath) => {
  trackEvent('time_on_page', {
    time_seconds: timeInSeconds,
    page_path: pagePath,
  })
}

