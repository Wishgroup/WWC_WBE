import React from 'react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import './Features.css'

const Features = () => {
  const [sectionRef, isSectionVisible] = useScrollAnimation({ threshold: 0.1 })
  const features = [
    {
      title: 'Complimentary Event Access',
      description: 'Complimentary access to club events throughout the year.',
      icon: '🎫'
    },
    {
      title: 'Annual Gifts',
      description: 'Annual gifts for member families.',
      icon: '🎁'
    },
    {
      title: 'Destination Experiences',
      description: 'Destination stays and experiences.',
      icon: '✈️'
    },
    {
      title: 'Partner Discounts',
      description: 'Partner discounts across key lifestyle categories.',
      icon: '💰'
    },
    {
      title: 'Referral Rewards',
      description: 'Referral rewards leading to free membership.',
      icon: '🎯'
    },
    {
      title: 'Partner Privileges',
      description: 'Exclusive partner benefits delivering a minimum of 20% value across hotels, travel, dining, wellness, and retail.',
      icon: '👑'
    }
  ]

  return (
    <section id="benefits" className="features" ref={sectionRef}>
      <div className="features-container">
        <div className={`section-header ${isSectionVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>
          <h2 className="section-title">What Members Enjoy</h2>
          <p className="section-subtitle">
            Wish Waves Club members gain access to a wide range of benefits across lifestyle, travel, wellness, and experiences.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className={`feature-card ${isSectionVisible ? 'scale-in' : 'animate-on-scroll'} stagger-${(index % 6) + 1} smooth-hover`}>
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>

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

