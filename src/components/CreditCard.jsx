import React, { useState, useRef, useCallback } from 'react'
import './CreditCard.css'

const CreditCard = ({
  cardNumber = "4532 •••• •••• 8901",
  cardHolder = "JOHN DOE",
  expiryDate = "12/28",
  cvv = "•••",
  frontImage = "/assets/3d/Images/card_fronts.png",
  backImage = "/assets/3d/Images/card_back.png",
  flipBackImage = false,
}) => {
  const [isFlipped, setIsFlipped] = useState(false)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef(null)
  const lastTouch = useRef({ x: 0, y: 0 })

  const updateRotation = useCallback(
    (clientX, clientY) => {
      if (!cardRef.current || isFlipped) return

      const rect = cardRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const rotateX = ((clientY - centerY) / (rect.height / 2)) * -15
      const rotateY = ((clientX - centerX) / (rect.width / 2)) * 15

      setRotation({ x: rotateX, y: rotateY })
    },
    [isFlipped]
  )

  const handleMouseMove = useCallback(
    (e) => {
      updateRotation(e.clientX, e.clientY)
    },
    [updateRotation]
  )

  const handleMouseLeave = useCallback(() => {
    setRotation({ x: 0, y: 0 })
  }, [])

  const handleClick = useCallback(() => {
    setIsFlipped((prev) => !prev)
    setRotation({ x: 0, y: 0 })
  }, [])

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }, [])

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging || isFlipped) return
      e.preventDefault()
      
      const touch = e.touches[0]
      const deltaX = touch.clientX - lastTouch.current.x
      const deltaY = touch.clientY - lastTouch.current.y

      setRotation((prev) => ({
        x: Math.max(-25, Math.min(25, prev.x - deltaY * 0.5)),
        y: Math.max(-25, Math.min(25, prev.y + deltaX * 0.5)),
      }))

      lastTouch.current = { x: touch.clientX, y: touch.clientY }
    },
    [isDragging, isFlipped]
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    setRotation({ x: 0, y: 0 })
  }, [])

  return (
    <div
      ref={cardRef}
      className="credit-card-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="credit-card-inner"
        style={{
          transform: isFlipped
            ? `rotateY(180deg) rotateX(${rotation.x}deg)`
            : `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Front of card */}
        <div className="credit-card credit-card-front">
          <img 
            src={frontImage} 
            alt="Credit card front"
            className="credit-card-image"
          />
        </div>

        {/* Back of card */}
        <div className={`credit-card credit-card-back ${flipBackImage ? 'credit-card-back-flipped' : ''}`}>
          <img 
            src={backImage} 
            alt="Credit card back"
            className="credit-card-image"
          />
        </div>
      </div>
    </div>
  )
}

export default CreditCard

