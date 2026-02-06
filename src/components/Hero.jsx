import React, { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LiquidEther from './LiquidEther'
import './Hero.css'

const Hero = () => {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const heroRef = useRef(null)
  const [videoHeight, setVideoHeight] = useState(null)

  useEffect(() => {
    const video = videoRef.current
    const hero = heroRef.current

    // Pause all other videos on the page (except the hero video)
    const pauseAllOtherVideos = () => {
      const allVideos = document.querySelectorAll('video')
      allVideos.forEach((v) => {
        if (v !== video && !v.paused) {
          v.pause()
        }
      })
    }

    // Pause other videos immediately
    pauseAllOtherVideos()

    if (video && hero) {
      // Ensure hero video plays
      const playHeroVideo = async () => {
        try {
          if (video.paused) {
            await video.play()
            console.log('Hero video playing')
          }
        } catch (error) {
          console.error('Video autoplay prevented:', error)
          // Try to play on user interaction
          const tryPlayOnInteraction = () => {
            video.play().catch(() => {})
            document.removeEventListener('click', tryPlayOnInteraction)
            document.removeEventListener('touchstart', tryPlayOnInteraction)
          }
          document.addEventListener('click', tryPlayOnInteraction, { once: true })
          document.addEventListener('touchstart', tryPlayOnInteraction, { once: true })
        }
      }

      // Try to play immediately if video is ready
      if (video.readyState >= 2) {
        playHeroVideo()
      }

      const handleLoadedMetadata = () => {
        // Get the video's natural dimensions
        const naturalHeight = video.videoHeight
        const naturalWidth = video.videoWidth
        
        if (naturalHeight && naturalWidth) {
          // Calculate aspect ratio
          const aspectRatio = naturalHeight / naturalWidth
          
          // Calculate height based on viewport width and video aspect ratio
          const viewportWidth = window.innerWidth
          const calculatedHeight = viewportWidth * aspectRatio
          
          // Use the calculated height to match video's display height
          setVideoHeight(calculatedHeight)
          hero.style.height = `${calculatedHeight}px`
          hero.style.minHeight = `${calculatedHeight}px`
        }
        
        // Play the hero video
        playHeroVideo()
      }

      const handleResize = () => {
        if (video.videoHeight && video.videoWidth) {
          const naturalHeight = video.videoHeight
          const naturalWidth = video.videoWidth
          const aspectRatio = naturalHeight / naturalWidth
          const viewportWidth = window.innerWidth
          const calculatedHeight = viewportWidth * aspectRatio
          
          setVideoHeight(calculatedHeight)
          hero.style.height = `${calculatedHeight}px`
          hero.style.minHeight = `${calculatedHeight}px`
        }
      }

      // Monitor for other videos being added to the page
      const observer = new MutationObserver(() => {
        pauseAllOtherVideos()
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })

      // Set up event listeners
      if (video.readyState >= 1) {
        // Video metadata already loaded
        handleLoadedMetadata()
      } else {
        video.addEventListener('loadedmetadata', handleLoadedMetadata)
      }

      // Play hero video when it can play
      video.addEventListener('canplay', playHeroVideo)
      video.addEventListener('loadeddata', playHeroVideo)
      
      // Handle video errors
      video.addEventListener('error', (e) => {
        console.error('Video error:', e)
        console.error('Video error details:', video.error)
      })

      window.addEventListener('resize', handleResize)

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        video.removeEventListener('canplay', playHeroVideo)
        video.removeEventListener('loadeddata', playHeroVideo)
        window.removeEventListener('resize', handleResize)
        observer.disconnect()
      }
    }
  }, [])

  return (
    <section className="hero" ref={heroRef}>
      <video 
        ref={videoRef}
        className="hero-background-video"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src="/assets/Bg%20Video-Dxqdev7y.webm" type="video/webm" />
        
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
                navigate('/register')
              }}
            >
              Join Now
            </button>
            <button 
              className="hero-cta hero-cta-secondary smooth-hover"
              onClick={() => {
                navigate('/register')
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

