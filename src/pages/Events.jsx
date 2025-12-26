import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Events.css'

const Events = () => {
  const navigate = useNavigate()
  const [sectionRef, isSectionVisible] = useScrollAnimation({ threshold: 0.1 })
  
  const eventCards = [
    {
      type: 'event',
      name: 'Lifestyle Wellness Retreat',
      role: 'Wellness & Mindfulness',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=500&fit=crop',
      buttonType: 'play',
      size: 'large' // spans 2 columns
    },
    {
      type: 'event',
      name: 'Ocean Journey Experience',
      role: 'Coastal Adventure',
      image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=500&fit=crop',
      buttonType: 'play',
      size: 'normal'
    },
    {
      type: 'event',
      name: 'Destination Discovery',
      role: 'Exclusive Travel',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=500&fit=crop',
      buttonType: 'plus',
      size: 'normal'
    },
    {
      type: 'description',
      name: 'Member Experience',
      role: 'WWC member',
      quote: 'The events have transformed my approach to wellness and created lasting connections with amazing people.',
      buttonType: 'plus',
      size: 'normal'
    },
    {
      type: 'event',
      name: 'Cultural Celebration',
      role: 'Arts & Culture',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=500&fit=crop',
      buttonType: 'plus',
      size: 'normal'
    },
    {
      type: 'description',
      name: 'Sarah M.',
      role: 'WWC member',
      quote: 'Each event exceeds expectations. The curated experiences have become highlights of my year.',
      buttonType: 'plus',
      size: 'tall' // spans 2 rows
    },
    {
      type: 'event',
      name: 'Networking Gala',
      role: 'Member Connections',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=500&fit=crop',
      buttonType: 'plus',
      size: 'normal'
    },
    {
      type: 'event',
      name: 'Adventure Expedition',
      role: 'Outdoor Experience',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=500&fit=crop',
      buttonType: 'plus',
      size: 'normal'
    }
  ]

  return (
    <div className="events-page">
      <Header />
      
      {/* Main Content */}
      <section className="events-section" ref={sectionRef}>
        <div className="events-container">
          <div className="events-grid">
            {eventCards.map((card, index) => (
              <div 
                key={index} 
                className={`event-card ${card.type === 'event' ? 'event-image-card' : 'event-description-card'} ${card.size || 'normal'} ${isSectionVisible ? 'scale-in' : 'animate-on-scroll'} stagger-${(index % 6) + 1} smooth-hover`}
                style={card.type === 'event' ? { backgroundImage: `url(${card.image})` } : {}}
              >
                {card.type === 'event' ? (
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
                    <p className="event-quote">"{card.quote}"</p>
                    <div className="event-author">
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
          <div className={`events-cta ${isSectionVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>
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

      <Footer />
    </div>
  )
}

export default Events

