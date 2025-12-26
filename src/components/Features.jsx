import React from 'react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import BenefitsCarousel from './BenefitsCarousel'
import './Features.css'

const Features = () => {
  const [sectionRef, isSectionVisible] = useScrollAnimation({ threshold: 0.1 })

  return (
    <section id="benefits" className="features" ref={sectionRef}>
      <div className="features-container">
        <div className={`section-header ${isSectionVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>
          <h2 className="section-title">What Members Enjoy</h2>
          <p className="section-subtitle">
            Wish Waves Club members gain access to a wide range of benefits across lifestyle, travel, wellness, and experiences.
          </p>
        </div>

        {/* Benefits Carousel */}
        <BenefitsCarousel />

        <div className={`partner-privileges ${isSectionVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>
          <h3 className="partner-title">Partner Privileges</h3>
          <p className="partner-description">
            Members enjoy exclusive partner benefits delivering a minimum of 20% value, across:
          </p>
          <div className="partner-categories">
            <div className="partner-category">Hotels & Resorts</div>
            <div className="partner-category">Travel & Experiences</div>
            <div className="partner-category">Dining & Cafés</div>
            <div className="partner-category">Wellness & Fitness</div>
            <div className="partner-category">Retail & Premium Services</div>
          </div>
          <p className="partner-note">
            All benefits are subject to partner availability and terms.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Features

