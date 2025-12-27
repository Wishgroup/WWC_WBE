import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './FloatingButton.css'

const FloatingButton = () => {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollBottom = documentHeight - (currentScrollY + windowHeight)
      
      // Always show button, but hide when very close to bottom (within 50px of footer)
      const shouldShow = scrollBottom > 50
      
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
    // Navigate to join page
    navigate('/join')
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

