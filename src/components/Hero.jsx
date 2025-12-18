import React from 'react'
import bgImage from '../../WWC_WBE/10x/Front Annual.png'
import LiquidEther from './LiquidEther'
import './Hero.css'

const Hero = () => {
  return (
    <section className="hero" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="hero-overlay"></div>
      <div className="hero-liquid-ether">
        <LiquidEther
          colors={['#1a4d4d', '#2d6b6b', '#4a9a9a']}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title fade-in-down">There's still time to save 10%</h1>
          <p className="hero-subtitle fade-in-up stagger-1">
            Join Wish Waves Club and unlock exclusive membership benefits. 
            Don't miss the chance to save 10% on annual memberships, now with free shipping for a limited time.
          </p>
          <button className="hero-cta fade-in-up stagger-2 smooth-hover">Join Now</button>
        </div>
      </div>
    </section>
  )
}

export default Hero

