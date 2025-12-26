import React, { useState, useEffect } from 'react'
import './iPadAirStyle.css'

const HighlightsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const highlights = [
    {
      title: 'The new Wish Waves Club Membership.',
      subtitle: 'Featuring the powerful Premium Platform. Up for anything. Built for Exclusive Experiences.',
      image: '✨'
    },
    {
      title: 'Available in two membership tiers.',
      subtitle: 'Both with stunning benefits and exclusive access to premium experiences worldwide.',
      image: '🎯'
    },
    {
      title: 'Premium Platform powers Club Intelligence.',
      subtitle: 'Incredible performance, advanced benefits, and personalized experiences.',
      image: '🚀'
    },
    {
      title: 'Exclusive partner benefits.',
      subtitle: 'Now with expanded network and a larger range of premium services.',
      image: '🤝'
    },
    {
      title: 'Wish Waves Platform and amazing services.',
      subtitle: 'Let you get things done in magical, intuitive ways.',
      image: '🌊'
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % highlights.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [highlights.length])

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + highlights.length) % highlights.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % highlights.length)
  }

  return (
    <div className="highlights-carousel">
      <div className="carousel-container">
        <button className="carousel-button carousel-button-prev" onClick={goToPrevious} aria-label="Previous">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div className="carousel-slides">
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
            >
              <div className="slide-content">
                <div className="slide-icon">{highlight.image}</div>
                <h3 className="slide-title">{highlight.title}</h3>
                <p className="slide-subtitle">{highlight.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="carousel-button carousel-button-next" onClick={goToNext} aria-label="Next">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="carousel-dots">
        {highlights.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default HighlightsCarousel

