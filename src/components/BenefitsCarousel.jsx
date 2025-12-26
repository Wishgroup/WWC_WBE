import React, { useState, useEffect, useCallback } from 'react'
import './BenefitsCarousel.css'

const benefits = [
  {
    id: 1,
    title: 'Complimentary Event Access',
    description: 'Complimentary access to club events throughout the year.',
    image: '/assets/Events acc/complementary events.jpg',
    screenColor: 'green'
  },
  {
    id: 2,
    title: 'Annual Gifts',
    description: 'Annual gifts for member families.',
    image: '/assets/Events acc/Annual Gifts.jpg',
    screenColor: 'yellow'
  },
  {
    id: 3,
    title: 'Destination Experiences',
    description: 'Destination stays and experiences.',
    image: '/assets/Events acc/Destination experience.jpg',
    screenColor: 'blue'
  },
  {
    id: 4,
    title: 'Partner Discounts',
    description: 'Partner discounts across key lifestyle categories.',
    image: '/assets/Events acc/Destinationexperience.jpg',
    screenColor: 'green'
  },
  {
    id: 5,
    title: 'Referral Rewards',
    description: 'Referral rewards leading to free membership.',
    image: '/assets/Events acc/Referrelrewards.png',
    screenColor: 'blue'
  },
  {
    id: 6,
    title: 'Partner Privileges',
    description: 'Exclusive partner benefits delivering a minimum of 20% value across hotels, travel, dining, wellness, and retail.',
    image: '/assets/Events acc/PartnerPrivilages.jpg',
    screenColor: 'silver'
  }
]

const screenColorClasses = {
  green: 'benefits-screen-green',
  yellow: 'benefits-screen-yellow',
  blue: 'benefits-screen-blue',
  silver: 'benefits-screen-silver',
}

const glowColorClasses = {
  green: 'benefits-glow-green',
  yellow: 'benefits-glow-yellow',
  blue: 'benefits-glow-blue',
  silver: 'benefits-glow-silver',
}

const BenefitsCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(2)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)

  const totalCards = benefits.length

  const getCardStyle = (index) => {
    const diff = index - activeIndex
    const normalizedDiff = diff + dragOffset / 150
    
    // Cylindrical positioning - cards wrap around viewer
    const cylinderRadius = 700 // radius of the cylinder (increased for bigger cards)
    const anglePerCard = 22 // degrees between each card
    const angle = normalizedDiff * anglePerCard
    const angleRad = (angle * Math.PI) / 180
    
    // Calculate position on cylinder surface
    const translateX = Math.sin(angleRad) * cylinderRadius
    const translateZ = Math.cos(angleRad) * cylinderRadius - cylinderRadius // offset so center card is at z=0
    const rotateY = -angle // face inward toward viewer
    
    const scale = 1 - Math.abs(normalizedDiff) * 0.03
    const opacity = Math.max(0.3, 1 - Math.abs(normalizedDiff) * 0.12)
    const zIndex = 10 - Math.abs(Math.round(normalizedDiff))

    return {
      transform: `
        translateX(${translateX}px) 
        translateZ(${translateZ}px) 
        rotateY(${rotateY}deg) 
        scale(${scale})
      `,
      opacity,
      zIndex,
    }
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.clientX)
  }

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    const diff = e.clientX - startX
    setDragOffset(diff)
  }, [isDragging, startX])

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    
    const threshold = 75
    if (dragOffset > threshold && activeIndex > 0) {
      setActiveIndex(prev => prev - 1)
    } else if (dragOffset < -threshold && activeIndex < totalCards - 1) {
      setActiveIndex(prev => prev + 1)
    }
    
    setDragOffset(0)
  }, [isDragging, dragOffset, activeIndex, totalCards])

  const handleTouchStart = (e) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
  }

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return
    const diff = e.touches[0].clientX - startX
    setDragOffset(diff)
  }, [isDragging, startX])

  const handleTouchEnd = useCallback(() => {
    handleMouseUp()
  }, [handleMouseUp])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  // Auto-advance carousel
  useEffect(() => {
    if (isDragging) return
    
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % totalCards)
    }, 4000)

    return () => clearInterval(interval)
  }, [isDragging, totalCards])

  return (
    <div className="benefits-carousel-wrapper">
      {/* 3D Carousel */}
      <div 
        className="benefits-carousel-perspective"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="benefits-carousel-container">
          {benefits.map((benefit, index) => {
            const style = getCardStyle(index)
            
            return (
              <div
                key={benefit.id}
                className="benefits-carousel-card-3d"
                style={style}
                onClick={() => setActiveIndex(index)}
              >
                {/* Card Frame */}
                <div className="benefits-card-frame">
                  {/* Glow Effect */}
                  <div className={`benefits-screen-glow ${glowColorClasses[benefit.screenColor]}`} />
                  
                  {/* Image/Content Area */}
                  <div className={`benefits-card-screen ${screenColorClasses[benefit.screenColor]}`}>
                    <img 
                      src={benefit.image} 
                      alt={benefit.title}
                      className="benefits-card-image-3d"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>

                  {/* Bottom Content */}
                  <div className="benefits-card-label">
                    <div className="benefits-card-title-3d">{benefit.title}</div>
                    <div className="benefits-card-description-3d">{benefit.description}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pagination dots */}
      <div className="benefits-pagination">
        {benefits.map((_, index) => (
          <button
            key={index}
            className={`benefits-pagination-dot ${
              index === activeIndex ? 'benefits-pagination-dot-active' : ''
            }`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default BenefitsCarousel
