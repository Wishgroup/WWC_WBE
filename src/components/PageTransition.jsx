import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './PageTransition.css'

const PageTransition = ({ children }) => {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [transitionStage, setTransitionStage] = useState('entering')

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('exiting')
    }
  }, [location.pathname, displayLocation.pathname])

  const handleAnimationEnd = () => {
    if (transitionStage === 'exiting') {
      setDisplayLocation(location)
      setTransitionStage('entering')
    }
  }

  return (
    <div
      className={`page-transition ${transitionStage}`}
      onAnimationEnd={handleAnimationEnd}
    >
      {children}
    </div>
  )
}

export default PageTransition

