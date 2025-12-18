import React, { useState, useEffect } from 'react'
import './FloatingButton.css'

const FloatingButton = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollBottom = documentHeight - (currentScrollY + windowHeight)
      
      // Show button when user scrolls past 200px
      // Hide when near the bottom (within 100px of footer) or at the top
      const shouldShow = currentScrollY > 200 && scrollBottom > 100
      
      setIsVisible(shouldShow)
    }

    // Check initial scroll position
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleClick = () => {
    // Scroll to memberships section or trigger join action
    const membershipsSection = document.getElementById('memberships')
    if (membershipsSection) {
      membershipsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <button 
      className={`floating-join-button ${isVisible ? 'visible' : 'hidden'}`}
      onClick={handleClick}
      aria-label="Join Wish Waves Club"
    >
      <span className="button-text">Join Now</span>
      <svg className="button-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}

export default FloatingButton

