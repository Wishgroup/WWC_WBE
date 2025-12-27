import React from 'react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import './ThreePillars.css'

const ThreePillars = () => {
  const [sectionRef, isSectionVisible] = useScrollAnimation({ threshold: 0.1 })

  const pillars = [
    {
      title: 'Lifestyle',
      description: 'Curated social gatherings, wellness sessions, networking opportunities, and premium privileges that elevate everyday living.'
    },
    {
      title: 'Ocean',
      description: 'Authentic ocean-led experiences including yacht journeys, island escapes, coastal retreats, and destination adventures that create lasting memories.'
    },
    {
      title: 'Value',
      description: 'The Wish Waves Club Value Program — an optional, structured participation framework for members interested in long-term value creation, built on transparency and trust.'
    }
  ]

  return (
    <section className="three-pillars" ref={sectionRef}>
      <div className="pillars-container">
        <div className={`section-header ${isSectionVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>
          <h2 className="section-title">Our Three Pillars</h2>
        </div>

        <div className="pillars-grid">
          {pillars.map((pillar, index) => (
            <div 
              key={index} 
              className={`pillar-card ${isSectionVisible ? 'fade-in-up' : 'animate-on-scroll'} stagger-${index + 1} smooth-hover`}
            >
              <h3 className="pillar-title">{pillar.title}</h3>
              <div className="pillar-divider"></div>
              <p className="pillar-description">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ThreePillars

