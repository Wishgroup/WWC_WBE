import React, { useState } from 'react'
import './MembershipBenefits.css'

const MembershipBenefits = () => {
  const [selectedMembership, setSelectedMembership] = useState('annual')
  const lifetimeBenefits = {
    fee: {
      usd: 'USD 1,000',
    },
    commitment: 'One-time payment | Lifetime access',
    description: 'The Lifetime Membership is designed for individuals seeking enduring value, exclusivity, and access to a curated ecosystem of premium lifestyle, travel, and investment-linked benefits.',
    corePrivileges: [
      'One-time commitment with lifetime access to WWC membership benefits',
      'Priority updates and exclusive invitations to premium events',
      'Complimentary access to UAE International Premier League matches (Terms & Conditions apply)',
      'Referral Reward: Introduce 5 new Lifetime Members and your Lifetime Membership is FREE'
    ],
    partnerDiscounts: {
      'Lifestyle & Leisure': [
        'Gym and fitness club memberships',
        'Salon, spa, and wellness services',
        'Wellness retreats',
        'Yoga & Pilates studios',
        'Theme parks and family attractions',
        'Cinemas and entertainment venues',
        'Personal training and fitness coaching',
        'Professional photography and videography services'
      ],
      'Travel & Hospitality': [
        'Preferential rates on business-class air travel',
        'Hotels and luxury resorts',
        'Beach clubs and premium leisure destinations',
        'Staycation packages',
        'Luxury car rentals',
        'Travel insurance packages',
        'Airport lounge access',
        'Yacht charters and cruise experiences'
      ],
      'Experiences & Adventure': [
        'Water sports centers (jet-skiing, parasailing, paddleboarding, etc.)',
        'Desert safari experiences',
        'Diving and snorkeling schools',
        'Adventure parks and outdoor activity providers'
      ],
      'Food & Dining': [
        'Fine-dining restaurants',
        'Café and brunch partners',
        'Private dining experiences and personal chef services'
      ],
      'Services & Premium Support': [
        'Careem Pro membership benefits',
        'Premium concierge services',
        'Co-working spaces',
        'Event venues and banquet hall bookings',
        'Luxury retail and shopping partners'
      ],
      'Finance & Lifestyle Value': [
        'Exclusive preferential rates on select financial services',
        'Discounts on premium subscriptions and curated learning platforms'
      ]
    }
  }

  const annualBenefits = {
    fee: {
      usd: 'USD 100',
      period: 'per annum'
    },
    description: 'As a valued Annual Member, you will enjoy flexible access to exclusive experiences, lifestyle privileges, and long-term value-added benefits, including:',
    exclusivePrivileges: [
      'Flexible access to curated WWC experiences and member benefits',
      'Priority updates and invitations to exclusive members-only events',
      'Complimentary access to all WWC events (up-to 8 events per annum)'
    ],
    financialBenefits: [
      'Additional 2% per annum ROI on eligible WWC Value Programs',
      'Referral Benefit: Introduce 5 new Annual Members and enjoy FREE renewal of your annual membership'
    ],
    lifestyleTravel: [
      '2-night complimentary full-board stay at Wish Island Resort in 2028 (Terms & Conditions apply)',
      '10% discount on economy-class return air tickets (1 trip per annum with selected airlines)',
      '10% discount on 2-night hotel stays in Dubai and Maldives (Terms & Conditions apply)',
      '20% discount on bookings across the WWC Hotel Chain (as listed on the official website)',
      'Complimentary spa service (Terms & Conditions apply)'
    ],
    shoppingBrands: [
      'Extra 5% discount on purchases via the WWC Shop App',
      'Exclusive WWC Brand Kit, including branded merchandise (T-shirt, cap, mug, and more)'
    ],
    familyOccasions: [
      "Annual gifts package for members' dependent children",
      "Special gift to celebrate the birth of a member's first child",
      'Promotional wedding discount package for members and their families'
    ]
  }

  const benefits = selectedMembership === 'lifetime' ? lifetimeBenefits : annualBenefits

  return (
    <div className="membership-benefits">
      {/* Minimal Navigation Bar */}
      <div className="membership-nav-minimal">
        <button
          className={`nav-tab ${selectedMembership === 'annual' ? 'active' : ''}`}
          onClick={() => setSelectedMembership('annual')}
        >
          Annual
        </button>
        <button
          className={`nav-tab ${selectedMembership === 'lifetime' ? 'active' : ''}`}
          onClick={() => setSelectedMembership('lifetime')}
        >
          Lifetime
        </button>
      </div>

      <div className="membership-benefits-container">
        {/* Membership Fee Section */}
        <div className="membership-fee-section">
          <div className="membership-fee-card">
            <h3 className="membership-fee-title">Membership Fee</h3>
            <div className="membership-fee-amount">
              <span className="fee-primary">{benefits.fee.usd}</span>
              {benefits.fee.period && (
                <span className="fee-period"> {benefits.fee.period}</span>
              )}
            </div>
            {selectedMembership === 'lifetime' && (
              <p className="membership-commitment">{benefits.commitment}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="membership-description">
          <p>{benefits.description}</p>
        </div>

        {/* Lifetime Membership Content */}
        {selectedMembership === 'lifetime' && (
          <>
            {/* Core Lifetime Privileges */}
            <div className="benefits-section">
              <h2 className="benefits-section-title">CORE LIFETIME PRIVILEGES</h2>
              <ul className="benefits-list">
                {benefits.corePrivileges.map((privilege, index) => (
                  <li key={index} className="benefit-item">
                    <span className="benefit-bullet">•</span>
                    <span className="benefit-text">{privilege}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exclusive Partner Discounts */}
            <div className="benefits-section">
              <h2 className="benefits-section-title">EXCLUSIVE PARTNER DISCOUNTS & PRIVILEGES</h2>
              {Object.entries(benefits.partnerDiscounts).map(([category, items]) => (
                <div key={category} className="partner-category-section">
                  <h3 className="partner-category-title">{category}</h3>
                  <ul className="benefits-list">
                    {items.map((item, index) => (
                      <li key={index} className="benefit-item">
                        <span className="benefit-bullet">•</span>
                        <span className="benefit-text">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Annual Membership Content */}
        {selectedMembership === 'annual' && (
          <>
            {/* Exclusive Privileges & Rewards */}
            <div className="benefits-section">
              <h2 className="benefits-section-title">EXCLUSIVE PRIVILEGES & REWARDS</h2>
              <ul className="benefits-list">
                {benefits.exclusivePrivileges.map((privilege, index) => (
                  <li key={index} className="benefit-item">
                    <span className="benefit-bullet">•</span>
                    <span className="benefit-text">{privilege}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Financial & Investment Benefits */}
            <div className="benefits-section">
              <h2 className="benefits-section-title">FINANCIAL & INVESTMENT BENEFITS</h2>
              <ul className="benefits-list">
                {benefits.financialBenefits.map((benefit, index) => (
                  <li key={index} className="benefit-item">
                    <span className="benefit-bullet">•</span>
                    <span className="benefit-text">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lifestyle & Travel Benefits */}
            <div className="benefits-section">
              <h2 className="benefits-section-title">LIFESTYLE & TRAVEL BENEFITS</h2>
              <ul className="benefits-list">
                {benefits.lifestyleTravel.map((benefit, index) => (
                  <li key={index} className="benefit-item">
                    <span className="benefit-bullet">•</span>
                    <span className="benefit-text">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Shopping & Brand Privileges */}
            <div className="benefits-section">
              <h2 className="benefits-section-title">SHOPPING & BRAND PRIVILEGES</h2>
              <ul className="benefits-list">
                {benefits.shoppingBrands.map((benefit, index) => (
                  <li key={index} className="benefit-item">
                    <span className="benefit-bullet">•</span>
                    <span className="benefit-text">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Family & Special Occasion Benefits */}
            <div className="benefits-section">
              <h2 className="benefits-section-title">FAMILY & SPECIAL OCCASION BENEFITS</h2>
              <ul className="benefits-list">
                {benefits.familyOccasions.map((benefit, index) => (
                  <li key={index} className="benefit-item">
                    <span className="benefit-bullet">•</span>
                    <span className="benefit-text">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MembershipBenefits
