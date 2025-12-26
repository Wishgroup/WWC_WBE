import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import './Events.css'

const Events = () => {
  const navigate = useNavigate()
  const [sectionRef, isSectionVisible] = useScrollAnimation({ threshold: 0.1 })

  return (
    <section id="events" className="events" ref={sectionRef}>
      <div className="events-container">
        <div className={`events-content ${isSectionVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>
          <h2 className="events-title">Events Highlight</h2>
          <h3 className="events-subtitle">A Minimum of 8 Curated Events Every Year</h3>
          <p className="events-description">
            From lifestyle and wellness gatherings to ocean journeys and destination experiences, Wish Waves Club hosts a minimum of eight thoughtfully curated events annually — designed to bring members together consistently.
          </p>
          <button 
            className="events-cta smooth-hover"
            onClick={() => {
              navigate('/join')
            }}
          >
            View Upcoming Events
          </button>
        </div>
      </div>
    </section>
  )
}

export default Events







