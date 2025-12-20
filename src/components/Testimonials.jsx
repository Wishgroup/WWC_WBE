import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import './Testimonials.css'

const Testimonials = () => {
  const navigate = useNavigate()
  const [sectionRef, isSectionVisible] = useScrollAnimation({ threshold: 0.1 })
  const cards = [
    {
      type: 'ambassador',
      name: 'Alexandra Chen',
      role: 'Lifestyle Influencer',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop',
      buttonType: 'play',
      size: 'large' // spans 2 columns
    },
    {
      type: 'ambassador',
      name: 'Marcus Johnson',
      role: 'Tech Entrepreneur',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      buttonType: 'play',
      size: 'normal'
    },
    {
      type: 'ambassador',
      name: 'Sophie Williams',
      role: 'Wellness Advocate',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop',
      buttonType: 'plus',
      size: 'normal'
    },
    {
      type: 'testimonial',
      name: 'Weilynn T.',
      role: 'WWC member',
      quote: 'Wish Waves Club continues to transform my approach to health and wellness daily.',
      buttonType: 'plus',
      size: 'normal'
    },
    {
      type: 'ambassador',
      name: 'Aryna Sabalenka',
      role: 'World No. 1 Tennis Player',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop',
      buttonType: 'plus',
      size: 'normal'
    },
    {
      type: 'testimonial',
      name: 'Samatha R.',
      role: 'WWC member',
      quote: 'Wish Waves Club has helped me greatly improve my physical health and wellbeing',
      buttonType: 'plus',
      size: 'tall' // spans 2 rows
    },
    {
      type: 'ambassador',
      name: 'Lucy Charles-Barclay',
      role: 'Champion Triathlete',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop',
      buttonType: 'plus',
      size: 'normal'
    },
    {
      type: 'ambassador',
      name: 'Rory McIlroy',
      role: 'Grand Slam Champion',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
      buttonType: 'plus',
      size: 'normal'
    }
  ]

  return (
    <section className="testimonials" ref={sectionRef}>
      <div className="testimonials-container">
        <div className="testimonials-grid">
          {cards.map((card, index) => (
            <div 
              key={index} 
              className={`testimonial-card ${card.type === 'ambassador' ? 'ambassador-card' : 'quote-card'} ${card.size || 'normal'} ${isSectionVisible ? 'scale-in' : 'animate-on-scroll'} stagger-${(index % 6) + 1} smooth-hover`}
              style={card.type === 'ambassador' ? { backgroundImage: `url(${card.image})` } : {}}
            >
              {card.type === 'ambassador' ? (
                <>
                  <div className="card-overlay"></div>
                  <div className="card-content">
                    <h3 className="card-name">{card.name}</h3>
                    <p className="card-role">{card.role}</p>
                  </div>
                  <button className={`card-button ${card.buttonType === 'play' ? 'play-button' : 'plus-button'}`}>
                    {card.buttonType === 'play' ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <p className="testimonial-quote">"{card.quote}"</p>
                  <div className="testimonial-author">
                    <strong>{card.name}</strong>
                    <span>{card.role}</span>
                  </div>
                  <button className="card-button plus-button quote-plus">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
        <div className={`testimonials-cta ${isSectionVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>
          <button 
            className="join-now-button smooth-hover"
            onClick={() => {
              navigate('/join')
            }}
          >
            JOIN NOW
          </button>
        </div>
      </div>
    </section>
  )
}

export default Testimonials

