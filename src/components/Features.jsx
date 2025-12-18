import React from 'react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import './Features.css'

const Features = () => {
  const [sectionRef, isSectionVisible] = useScrollAnimation({ threshold: 0.1 })
  const features = [
    {
      title: 'Exclusive Event Access',
      description: 'Get priority access to curated events, workshops, and experiences designed exclusively for members.',
      icon: '🎫'
    },
    {
      title: 'Member Discounts',
      description: 'Enjoy significant savings on events, products, and services with exclusive member-only pricing.',
      icon: '💰'
    },
    {
      title: 'Community Network',
      description: 'Connect with like-minded individuals and build meaningful relationships through our member community.',
      icon: '🤝'
    },
    {
      title: 'Early Access',
      description: 'Be the first to know about new experiences, events, and opportunities before they go public.',
      icon: '⭐'
    },
    {
      title: 'Personalized Experiences',
      description: 'Receive tailored recommendations and experiences based on your interests and preferences.',
      icon: '🎯'
    },
    {
      title: 'VIP Treatment',
      description: 'Enjoy premium perks including priority seating, dedicated support, and exclusive member lounges.',
      icon: '👑'
    }
  ]

  return (
    <section id="benefits" className="features" ref={sectionRef}>
      <div className="features-container">
        <div className={`section-header ${isSectionVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>
          <h2 className="section-title">Get a complete picture of your membership</h2>
          <p className="section-subtitle">
            No other membership gives you a more comprehensive view of exclusive benefits 
            and experiences– and tells you how to make the most of them.
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

        <div className="features-showcase">
          <div className={`showcase-item ${isSectionVisible ? 'fade-in-left' : 'animate-on-scroll'} stagger-1`}>
            <div className="showcase-content">
              <h3 className="showcase-title">Quantify your membership value</h3>
              <p className="showcase-text">
                Track your savings, events attended, and experiences enjoyed. 
                See the real value of your Wish Waves Club membership.
              </p>
            </div>
            <div className="showcase-image">
              <div className="placeholder-image" style={{ background: 'linear-gradient(135deg, var(--teal-medium), var(--teal-dark))' }}>
                <span>Membership Dashboard</span>
              </div>
            </div>
          </div>

          <div className={`showcase-item reverse ${isSectionVisible ? 'fade-in-right' : 'animate-on-scroll'} stagger-2`}>
            <div className="showcase-content">
              <h3 className="showcase-title">Extend your network and experiences</h3>
              <p className="showcase-text">
                Connect with a community of members who share your interests. 
                Build lasting relationships and discover new opportunities.
              </p>
            </div>
            <div className="showcase-image">
              <div className="placeholder-image" style={{ background: 'linear-gradient(135deg, var(--teal-dark), var(--gray-medium))' }}>
                <span>Community Network</span>
              </div>
            </div>
          </div>

          <div className={`showcase-item ${isSectionVisible ? 'fade-in-left' : 'animate-on-scroll'} stagger-3`}>
            <div className="showcase-content">
              <h3 className="showcase-title">Optimize your event calendar</h3>
              <p className="showcase-text">
                Get personalized event recommendations and never miss an opportunity 
                that matches your interests and schedule.
              </p>
            </div>
            <div className="showcase-image">
              <div className="placeholder-image" style={{ background: 'linear-gradient(135deg, var(--teal-medium), var(--gray-light))' }}>
                <span>Event Calendar</span>
              </div>
            </div>
          </div>

          <div className={`showcase-item reverse ${isSectionVisible ? 'fade-in-right' : 'animate-on-scroll'} stagger-4`}>
            <div className="showcase-content">
              <h3 className="showcase-title">Measure the impact of every experience</h3>
              <p className="showcase-text">
                Track your journey, see your growth, and understand how each 
                membership benefit contributes to your personal and professional development.
              </p>
            </div>
            <div className="showcase-image">
              <div className="placeholder-image" style={{ background: 'linear-gradient(135deg, var(--gray-medium), var(--teal-medium))' }}>
                <span>Experience Tracker</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features

