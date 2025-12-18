import React from 'react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import './Memberships.css'

const Memberships = () => {
  const [sectionRef, isSectionVisible] = useScrollAnimation({ threshold: 0.1 })
  const memberships = [
    {
      id: 1,
      name: 'Essential',
      originalPrice: '$199',
      price: '$129',
      savings: 'Save $70',
      features: [
        'Access to exclusive events',
        'Member-only discounts (10-20% off)',
        'Early access to new experiences',
        'Community networking opportunities',
        'Monthly newsletter with insider tips'
      ],
      cta: 'START WITH ESSENTIAL',
      highlight: false
    },
    {
      id: 2,
      name: 'Premium',
      originalPrice: '$239',
      price: '$216',
      savings: 'Save 10%',
      features: [
        'Everything on Essential, plus',
        'VIP event access & priority seating',
        'Exclusive member-only experiences',
        'Personal concierge support',
        'Quarterly member appreciation events',
        'Advanced booking privileges'
      ],
      cta: 'START WITH PREMIUM',
      highlight: true,
      badge: 'Free trial available'
    },
    {
      id: 3,
      name: 'Elite',
      originalPrice: '$359',
      price: '$324',
      savings: 'Save 10%',
      features: [
        'Everything on Premium, plus',
        'Unlimited event access',
        'Private member gatherings',
        'Dedicated membership manager',
        'Exclusive travel & lifestyle benefits',
        'Annual member retreat invitation',
        'Lifetime membership perks'
      ],
      cta: 'START WITH ELITE',
      highlight: false
    }
  ]

  return (
    <section id="memberships" className="memberships" ref={sectionRef}>
      <div className="memberships-container">
        <div className={`section-header ${isSectionVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>
          <h2 className="section-title">Choose a membership</h2>
        </div>

        <div className="memberships-grid">
          {memberships.map((membership, index) => (
            <div
              key={membership.id}
              className={`membership-card ${membership.highlight ? 'highlighted' : ''} ${isSectionVisible ? 'fade-in-up' : 'animate-on-scroll'} stagger-${index + 1} smooth-hover`}
            >
              {membership.badge && (
                <div className="membership-badge">{membership.badge}</div>
              )}
              <div className="membership-savings">{membership.savings}</div>
              <h3 className="membership-name">{membership.name}</h3>
              <p className="membership-description">
                {membership.id === 1 && 'Exclusive membership benefits at our best price.'}
                {membership.id === 2 && 'Premium access to help you make the most of every experience.'}
                {membership.id === 3 && 'The most exclusive membership tier, delivering unparalleled benefits and experiences.'}
              </p>
              <div className="membership-pricing">
                <span className="price-current">Available at {membership.price}</span>
                <span className="price-original">{membership.originalPrice}</span>
              </div>
              <ul className="membership-features">
                {membership.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <button className="membership-cta">{membership.cta}</button>
            </div>
          ))}
        </div>

        <div className={`gift-section ${isSectionVisible ? 'scale-in' : 'animate-on-scroll'}`}>
          <div className="gift-content">
            <h3 className="gift-title">One gift, better experiences</h3>
            <p className="gift-text">
              From memberships, to exclusive events, and all-new benefits, 
              there's something for everyone
            </p>
            <button className="gift-button smooth-hover">Explore Gifts</button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Memberships

