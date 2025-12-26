import React, { useState } from 'react'
import './iPadAirStyle.css'

const SizeComparison = () => {
  const [selectedSize, setSelectedSize] = useState('annual')

  const sizes = {
    annual: {
      name: 'Annual Membership',
      subtitle: 'Flexible access to the full Wish Waves experience.',
      features: [
        'Complimentary access to selected events (up to 8 per year)',
        'Lifestyle and ocean-led experiences',
        'Exclusive partner benefits and privileges',
        'Optional participation in Value Program',
        'Referral rewards'
      ],
      resolution: '2360x1640',
      display: 'Full Access'
    },
    lifetime: {
      name: 'Lifetime Membership',
      subtitle: 'A one-time commitment for permanent belonging.',
      features: [
        'Everything in Annual Membership, plus',
        'Lifetime access with no renewals',
        'Priority access to events and experiences',
        'Exclusive Lifetime Member privileges',
        'Long-term recognition within the community'
      ],
      resolution: '2732x2048',
      display: 'Premium Access'
    }
  }

  return (
    <div className="size-comparison">
      <div className="size-selector">
        <button
          className={`size-option ${selectedSize === 'annual' ? 'active' : ''}`}
          onClick={() => setSelectedSize('annual')}
        >
          Annual
        </button>
        <button
          className={`size-option ${selectedSize === 'lifetime' ? 'active' : ''}`}
          onClick={() => setSelectedSize('lifetime')}
        >
          Lifetime
        </button>
      </div>

      <div className="size-content">
        <div className="size-visual">
          <div className={`size-card ${selectedSize}`}>
            <div className="size-card-screen">
              <div className="screen-pattern"></div>
            </div>
            <div className="size-card-label">{sizes[selectedSize].name}</div>
          </div>
        </div>

        <div className="size-info">
          <h3 className="size-name">{sizes[selectedSize].name}</h3>
          <p className="size-subtitle">{sizes[selectedSize].subtitle}</p>
          <div className="size-specs">
            <div className="size-spec">
              <span className="spec-label">Display:</span>
              <span className="spec-value">{sizes[selectedSize].display}</span>
            </div>
            <div className="size-spec">
              <span className="spec-label">Resolution:</span>
              <span className="spec-value">{sizes[selectedSize].resolution}</span>
            </div>
          </div>
          <ul className="size-features">
            {sizes[selectedSize].features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SizeComparison

