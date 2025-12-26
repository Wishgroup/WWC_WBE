import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import './BenefitsCarousel.css'

const BenefitsCarousel = () => {
  const trackRef = useRef(null)
  const cardsRef = useRef([])
  const isDownRef = useRef(false)
  const startXRef = useRef(0)
  const currentXRef = useRef(0)
  const targetXRef = useRef(0)
  const velocityRef = useRef(0)
  const animationFrameRef = useRef(null)
  const autoRotateSpeedRef = useRef(0.5) // Auto-rotation speed
  const isUserInteractingRef = useRef(false)

  const benefits = [
    {
      icon: '🎫',
      title: 'Complimentary Event Access',
      description: 'Complimentary access to club events throughout the year.',
      image: '/assets/Events acc/complementary events.jpg'
    },
    {
      icon: '🎁',
      title: 'Annual Gifts',
      description: 'Annual gifts for member families.',
      image: '/assets/Events acc/Annual Gifts.jpg'
    },
    {
      icon: '✈️',
      title: 'Destination Experiences',
      description: 'Destination stays and experiences.',
      image: '/assets/Events acc/Destination experience.jpg'
    },
    {
      icon: '💰',
      title: 'Partner Discounts',
      description: 'Partner discounts across key lifestyle categories.',
      image: '/assets/Events acc/Destinationexperience.jpg'
    },
    {
      icon: '🎯',
      title: 'Referral Rewards',
      description: 'Referral rewards leading to free membership.',
      image: '/assets/Events acc/Referrelrewards.jpeg'
    },
    {
      icon: '👑',
      title: 'Partner Privileges',
      description: 'Exclusive partner benefits delivering a minimum of 20% value across hotels, travel, dining, wellness, and retail.',
      image: '/assets/Events acc/PartnerPrivilages.jpg'
    }
  ]

  useEffect(() => {
    const track = trackRef.current
    const cards = cardsRef.current
    if (!track) return

    // Mouse interaction handlers
    const handleMouseDown = (e) => {
      isDownRef.current = true
      isUserInteractingRef.current = true
      startXRef.current = e.clientX
      velocityRef.current = 0
    }

    const handleMouseUp = () => {
      isDownRef.current = false
      // Keep user interaction flag for a bit to allow inertia to finish
      setTimeout(() => {
        if (!isDownRef.current) {
          isUserInteractingRef.current = false
        }
      }, 500)
    }

    const handleMouseMove = (e) => {
      if (!isDownRef.current) return

      const center = window.innerWidth / 2
      const distanceFromCenter = e.clientX - center
      // Reverse direction: multiply by -1
      velocityRef.current = distanceFromCenter * -0.05
    }

    // Touch support
    const handleTouchStart = (e) => {
      isDownRef.current = true
      isUserInteractingRef.current = true
      startXRef.current = e.touches[0].clientX
      velocityRef.current = 0
    }

    const handleTouchEnd = () => {
      isDownRef.current = false
      setTimeout(() => {
        if (!isDownRef.current) {
          isUserInteractingRef.current = false
        }
      }, 500)
    }

    const handleTouchMove = (e) => {
      if (!isDownRef.current) return
      e.preventDefault()

      const center = window.innerWidth / 2
      const distanceFromCenter = e.touches[0].clientX - center
      // Reverse direction: multiply by -1
      velocityRef.current = distanceFromCenter * -0.05
    }

    // Update card rotation and scale based on position
    const updateCards = () => {
      const center = window.innerWidth / 2
      const allCards = track.querySelectorAll('.benefits-carousel-card')

      allCards.forEach((card) => {
        if (!card) return

        const rect = card.getBoundingClientRect()
        const cardCenter = rect.left + rect.width / 2
        const offset = cardCenter - center

        const rotateY = offset * 0.03
        const scale = Math.max(0.8, 1 - Math.abs(offset) / 1500)
        const opacity = Math.max(0.6, 1 - Math.abs(offset) / 2000)

        // Use direct transform for better performance
        card.style.transform = `
          translateZ(0)
          rotateY(${rotateY}deg)
          scale(${scale})
        `
        card.style.opacity = opacity
      })
    }

    // Calculate card width for infinite loop
    const getCardWidth = () => {
      return 420 // 400px width + 20px gap
    }

    // Animation loop with inertia and auto-rotation
    const animate = () => {
      if (!isDownRef.current) {
        velocityRef.current *= 0.92 // friction
        if (Math.abs(velocityRef.current) < 0.1) {
          velocityRef.current = 0
        }
      }

      // Auto-rotation when user is not interacting
      if (!isUserInteractingRef.current && Math.abs(velocityRef.current) < 0.5) {
        velocityRef.current = autoRotateSpeedRef.current
      }

      currentXRef.current += velocityRef.current

      // Infinite loop: seamless wrapping
      const cardWidth = getCardWidth()
      const totalWidth = cardWidth * benefits.length
      const centerOffset = window.innerWidth / 2 - cardWidth / 2
      
      // When we've moved one full set, reset to start seamlessly
      if (currentXRef.current <= -centerOffset - totalWidth) {
        currentXRef.current += totalWidth
      } else if (currentXRef.current >= -centerOffset + totalWidth) {
        currentXRef.current -= totalWidth
      }
      
      // Apply direct transform for smooth performance
      gsap.set(track, {
        x: currentXRef.current
      })

      updateCards()
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Event listeners
    const wrapper = track.parentElement
    wrapper.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
    wrapper.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })

    // Set initial position to center the first card
    const cardWidth = 420 // 400px + 20px gap
    const totalWidth = cardWidth * benefits.length
    const centerOffset = window.innerWidth / 2 - cardWidth / 2
    currentXRef.current = -centerOffset // Start with first card centered
    
    // Apply initial position
    gsap.set(track, {
      x: currentXRef.current
    })

    // Start animation loop
    animate()

    // Initial card update
    setTimeout(updateCards, 100)

    // Cleanup
    return () => {
      wrapper.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
      wrapper.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('touchmove', handleTouchMove)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <div className="benefits-carousel-wrapper">
      <div className="benefits-carousel-track" ref={trackRef}>
        {benefits.map((benefit, index) => (
          <div
            key={index}
            ref={(el) => (cardsRef.current[index] = el)}
            className="benefits-carousel-card"
          >
            <div className="benefits-card-image-wrapper">
              <img 
                src={benefit.image} 
                alt={benefit.title}
                className="benefits-card-image"
                onError={(e) => {
                  // Fallback if image doesn't load
                  e.target.style.display = 'none'
                }}
              />
            </div>
            <div className="benefits-card-content">
              <h3 className="benefits-card-title">{benefit.title}</h3>
              <p className="benefits-card-description">{benefit.description}</p>
            </div>
          </div>
        ))}
        {/* Duplicate cards for infinite loop effect */}
        {benefits.map((benefit, index) => (
          <div
            key={`duplicate-${index}`}
            className="benefits-carousel-card"
          >
            <div className="benefits-card-image-wrapper">
              <img 
                src={benefit.image} 
                alt={benefit.title}
                className="benefits-card-image"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
            <div className="benefits-card-content">
              <h3 className="benefits-card-title">{benefit.title}</h3>
              <p className="benefits-card-description">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BenefitsCarousel

