import React, { useState, useCallback } from 'react'
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

  const handleClick = useCallback(() => {
    setIsFlipped((prev) => !prev)
  }, [])

  return (
    <div
      className="credit-card-container"
      onClick={handleClick}
    >
      <div
        className="credit-card-inner"
        style={{
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
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

