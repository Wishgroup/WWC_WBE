import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import CreditCard from './CreditCard'
import ScrollReveal from './ScrollReveal'
import './Memberships.css'

const Memberships = () => {
  const navigate = useNavigate()
  const [sectionRef, isSectionVisible] = useScrollAnimation({ threshold: 0.1 })
  const memberships = [
    {
      id: 1,
      name: 'Annual',
      subtitle: 'Flexible access to the full Wish Waves experience.',
      features: [
        'Complimentary access to selected Wish Waves Club events (up to 8 per year)',
        'Lifestyle and ocean-led experiences',
        'Exclusive partner benefits and privileges',
        'Optional participation in the Wish Waves Club Value Program',
        'Referral rewards'
      ],
      cta: 'Join Annual',
      highlight: false
    },
    {
      id: 2,
      name: 'Lifetime',
      subtitle: 'A one-time commitment for permanent belonging.',
      features: [
        'Everything in Annual Membership, plus',
        'Lifetime access with no renewals',
        'Priority access to events and experiences',
        'Exclusive Lifetime Member privileges',
        'Long-term recognition within the community'
      ],
      cta: 'Join Lifetime',
      highlight: true
    }
  ]

  return (
    <section id="memberships" className="memberships" ref={sectionRef}>
      <div className="memberships-container">
        <div className={`section-header ${isSectionVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>
          <ScrollReveal
            baseOpacity={0}
            enableBlur={true}
            baseRotation={5}
            blurStrength={10}
            containerClassName="section-title-wrapper"
            textClassName="section-title"
          >
            Membership Overview
          </ScrollReveal>
          <p className="section-subtitle">
            Wish Waves Club offers two ways to belong — both granting access to the same community, with different levels of commitment and privilege.
          </p>
        </div>

        <div className="memberships-grid">
          {memberships.map((membership, index) => (
            <div
              key={membership.id}
              className={`membership-card ${membership.highlight ? 'highlighted' : ''} ${isSectionVisible ? 'fade-in-up' : 'animate-on-scroll'} stagger-${index + 1} smooth-hover`}
            >
              {/* Credit Card */}
              <div className="membership-card-credit-card">
                <CreditCard
                  cardNumber={membership.id === 1 ? "4532 •••• •••• 8901" : "5234 •••• •••• 5678"}
                  cardHolder={membership.name.toUpperCase()}
                  expiryDate="12/28"
                  cvv={membership.id === 1 ? "847" : "923"}
                  frontImage={membership.id === 1 ? "/assets/3d/Images/anual_front.png" : undefined}
                  backImage={membership.id === 1 ? "/assets/3d/Images/anual_back.png" : undefined}
                  flipBackImage={false}
                />
              </div>

              {/* Membership Information */}
              <div className="membership-info">
                <h3 className="membership-name">{membership.name} Membership</h3>
                <p className="membership-subtitle">{membership.subtitle}</p>
                <div className="membership-includes">
                  <h4 className="includes-title">Includes:</h4>
                  <ul className="membership-features">
                    {membership.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <button 
                  className="membership-cta"
                  onClick={() => {
                    navigate('/join')
                  }}
                >
                  {membership.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={`promotional-benefits ${isSectionVisible ? 'scale-in' : 'animate-on-scroll'}`}>
          <div className="promotional-content">
            <h3 className="promotional-title">Exclusive Promotional Benefits</h3>
            <ul className="promotional-list">
              <li>Founding Lifetime Membership at USD 100 (first 1,000 members)</li>
              <li>Maldives Tour for first 100 Annual Members (before January 25, 2026)</li>
              <li>Maldives Tour for first 100 Lifetime Members (before January 25, 2026)</li>
              <li>Valentine's Day Celebration Event for two in Dubai (first 100 members)</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Memberships

