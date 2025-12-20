import React from 'react'
import { useNavigate } from 'react-router-dom'
import bgVideo from '../../WWC_WBE/10x/bg_video.mp4'
import LiquidEther from './LiquidEther'
import './Hero.css'

const Hero = () => {
  const navigate = useNavigate()
  return (
    <section className="hero">
      <video 
        className="hero-background-video"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={bgVideo} type="video/mp4" />
      </video>
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
          {/* <h1 className="hero-title fade-in-down">Wish Waves Club</h1>
          <h2 className="hero-tagline fade-in-down">Beyond the Waves</h2>
          <p className="hero-description fade-in-up stagger-1">
            Where lifestyle, ocean experiences, and trusted value come together.
          </p> */}
          <p className="hero-subtitle fade-in-up stagger-1">
            A global membership community designed for people who value connection, meaningful experiences, and long-term purpose.
          </p>
          <div className="hero-ctas fade-in-up stagger-2">
            <button 
              className="hero-cta hero-cta-primary smooth-hover"
              onClick={() => {
                navigate('/join')
              }}
            >
              Join Now
            </button>
            <button 
              className="hero-cta hero-cta-secondary smooth-hover"
              onClick={() => {
                navigate('/join')
              }}
            >
              Explore Membership
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

