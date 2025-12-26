import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import HighlightsCarousel from './HighlightsCarousel'
import SizeComparison from './SizeComparison'
import ColorSelector from './ColorSelector'
import './iPadAirStyle.css'

const iPadAirStyle = () => {
  const navigate = useNavigate()
  const [selectedColor, setSelectedColor] = useState('space-gray')
  const [activeNav, setActiveNav] = useState('overview')
  const overviewRef = useRef(null)
  const techSpecsRef = useRef(null)
  const compareRef = useRef(null)
  const displayRef = useRef(null)
  const intelligenceRef = useRef(null)
  const platformRef = useRef(null)
  const colorsRef = useRef(null)
  
  const [heroRef, isHeroVisible] = useScrollAnimation({ threshold: 0.1 })
  const [displaySectionRef, isDisplayVisible] = useScrollAnimation({ threshold: 0.1 })
  const [techSectionRef, isTechVisible] = useScrollAnimation({ threshold: 0.1 })
  const [intelligenceSectionRef, isIntelligenceVisible] = useScrollAnimation({ threshold: 0.1 })
  const [platformSectionRef, isPlatformVisible] = useScrollAnimation({ threshold: 0.1 })

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const overviewTop = overviewRef.current?.offsetTop || 0
      const techSpecsTop = techSpecsRef.current?.offsetTop || 0
      const compareTop = compareRef.current?.offsetTop || 0

      if (scrollY < techSpecsTop - 200) {
        setActiveNav('overview')
      } else if (scrollY < compareTop - 200) {
        setActiveNav('tech-specs')
      } else {
        setActiveNav('compare')
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (section) => {
    const refs = {
      overview: overviewRef,
      'tech-specs': techSpecsRef,
      compare: compareRef
    }
    refs[section]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveNav(section)
  }

  const colors = {
    'space-gray': { name: 'Space Gray', value: '#1a1a1a' },
    'blue': { name: 'Blue', value: '#4a9a9a' },
    'purple': { name: 'Purple', value: '#8b6fa8' },
    'starlight': { name: 'Starlight', value: '#e5e5e5' }
  }

  return (
    <div className="ipad-air-style">
      {/* Sticky Navigation */}
      <nav className="sticky-nav">
        <div className="sticky-nav-container">
          <button
            className={`sticky-nav-link ${activeNav === 'overview' ? 'active' : ''}`}
            onClick={() => scrollToSection('overview')}
          >
            Overview
          </button>
          <button
            className={`sticky-nav-link ${activeNav === 'tech-specs' ? 'active' : ''}`}
            onClick={() => scrollToSection('tech-specs')}
          >
            Tech Specs
          </button>
          <button
            className={`sticky-nav-link ${activeNav === 'compare' ? 'active' : ''}`}
            onClick={() => scrollToSection('compare')}
          >
            Compare
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" ref={(el) => { overviewRef.current = el; heroRef.current = el }}>
        <div className="hero-container">
          <div className={`hero-content ${isHeroVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>
            <h1 className="hero-title">Wish Waves Club</h1>
            <h2 className="hero-tagline">Beyond the Waves</h2>
            <p className="hero-description">
              Built for Exclusive Experiences.
            </p>
            <div className="hero-image-container">
              <div className="hero-product-image">
                <div className="product-visual" style={{ backgroundColor: colors[selectedColor].value }}>
                  <div className="product-screen">
                    <div className="screen-content">
                      <div className="screen-pattern"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-actions">
              <button className="btn-primary-large" onClick={() => navigate('/join')}>
                Join Now
              </button>
              <a href="#tech-specs" className="link-primary">
                Learn more
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Carousel */}
      <section className="highlights-section">
        <HighlightsCarousel />
      </section>

      {/* Two Sizes Section */}
      <section className="sizes-section">
        <div className="section-container">
          <h2 className="section-title-large">Two sizes. Infinite possibilities.</h2>
          <SizeComparison />
        </div>
      </section>

      {/* Display Features Section */}
      <section className="display-section" ref={(el) => { displayRef.current = el; displaySectionRef.current = el }}>
        <div className="section-container">
          <h2 className={`section-title-large ${isDisplayVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>Stunningly advanced experience.</h2>
          <div className={`display-features-grid ${isDisplayVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>
            <div className="display-feature">
              <div className="feature-icon">✨</div>
              <h3 className="feature-title">Premium Quality</h3>
              <p className="feature-description">
                Every experience is carefully curated for the highest standards.
              </p>
            </div>
            <div className="display-feature">
              <div className="feature-icon">🌊</div>
              <h3 className="feature-title">Ocean-Led Experiences</h3>
              <p className="feature-description">
                Unique lifestyle and ocean-focused adventures await.
              </p>
            </div>
            <div className="display-feature">
              <div className="feature-icon">🤝</div>
              <h3 className="feature-title">Partner Network</h3>
              <p className="feature-description">
                Exclusive access to premium partners worldwide.
              </p>
            </div>
            <div className="display-feature">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Value Program</h3>
              <p className="feature-description">
                Minimum 20% value across all partner benefits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="technology-section" ref={(el) => { techSpecsRef.current = el; techSectionRef.current = el }}>
        <div className="section-container">
          <h2 className={`section-title-large ${isTechVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>Premium Membership Platform. Light it up.</h2>
          <div className={`technology-content ${isTechVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>
            <div className="technology-visual">
              <div className="tech-chip">
                <div className="chip-core"></div>
                <div className="chip-rings">
                  <div className="ring ring-1"></div>
                  <div className="ring ring-2"></div>
                  <div className="ring ring-3"></div>
                </div>
              </div>
            </div>
            <div className="technology-info">
              <p className="tech-description">
                The powerful membership platform powers exclusive experiences and brings breakthrough 
                performance to Wish Waves Club. With comprehensive benefits, premium access, and 
                exclusive privileges, it's nearly <strong>2x more valuable</strong> than standard memberships.
              </p>
              <div className="tech-specs-grid">
                <div className="tech-spec">
                  <div className="spec-value">3</div>
                  <div className="spec-label">Core Benefits</div>
                </div>
                <div className="tech-spec">
                  <div className="spec-value">20%+</div>
                  <div className="spec-label">Partner Value</div>
                </div>
                <div className="tech-spec">
                  <div className="spec-value">8+</div>
                  <div className="spec-label">Events/Year</div>
                </div>
                <div className="tech-spec">
                  <div className="spec-value">∞</div>
                  <div className="spec-label">Possibilities</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligence Section */}
      <section className="intelligence-section" ref={(el) => { intelligenceRef.current = el; intelligenceSectionRef.current = el }}>
        <div className="section-container">
          <h2 className={`section-title-large ${isIntelligenceVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>Club Intelligence. Personal, private, powerful.</h2>
          <p className={`section-intro ${isIntelligenceVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>
            Wish Waves Club is built for <strong>Club Intelligence</strong>, the personal membership 
            system that helps you discover, experience, and connect effortlessly. With groundbreaking 
            privacy protections, it gives you peace of mind that your data is secure.
          </p>
          <div className={`intelligence-features ${isIntelligenceVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>
            <div className="intelligence-feature-card">
              <div className="feature-card-icon">📝</div>
              <h3 className="feature-card-title">Membership Tools</h3>
              <p className="feature-card-description">
                Help you <strong>find just the right experiences</strong> and transform the way you 
                connect. Discover events, access exclusive benefits, and manage your membership with ease.
              </p>
            </div>
            <div className="intelligence-feature-card">
              <div className="feature-card-icon">🖼️</div>
              <h3 className="feature-card-title">Experience Gallery</h3>
              <p className="feature-card-description">
                Club Intelligence enables delightful ways to <strong>express yourself visually</strong>. 
                Browse curated experiences, create personalized event collections, and share your journey.
              </p>
            </div>
            <div className="intelligence-feature-card">
              <div className="feature-card-icon">✨</div>
              <h3 className="feature-card-title">Benefit Optimization</h3>
              <p className="feature-card-description">
                With Benefit Optimization, you can easily <strong>maximize your membership value</strong>. 
                Club Intelligence identifies the best offers and experiences so you can get the most from 
                your membership.
              </p>
            </div>
          </div>
          <div className={`privacy-badge ${isIntelligenceVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>
            <div className="privacy-icon">🔒</div>
            <p className="privacy-text">
              Club Intelligence <strong>protects your privacy at every step</strong>. It's integrated 
              into the core of Wish Waves Club through secure processing, so it's aware of your preferences 
              without collecting your personal information.
            </p>
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="platform-section" ref={(el) => { compareRef.current = el; platformSectionRef.current = el }}>
        <div className="section-container">
          <h2 className={`section-title-large ${isPlatformVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>Wish Waves Platform. Get up to something wonderful.</h2>
          <p className={`section-intro ${isPlatformVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>
            The Wish Waves Platform is designed to let you <em>do all the things you love</em> easily 
            and powerfully from first touch to finishing touches. Access multiple benefits at once, 
            connect with members, and navigate quickly and efficiently.
          </p>
          <div className={`platform-showcase ${isPlatformVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>
            <div className="showcase-item">
              <h3 className="showcase-title">Do it all. All at once.</h3>
              <p className="showcase-description">
                The platform lets you <strong>multitask effortlessly</strong> by allowing you to access 
                events, benefits, and experiences simultaneously, so you can easily navigate between 
                them. You can also group activities for specific goals or projects.
              </p>
            </div>
            <div className="showcase-item">
              <h3 className="showcase-title">Built-in services for all the essentials.</h3>
              <p className="showcase-description">
                Wish Waves Club comes with powerful and capable services designed to help you 
                <strong> create, connect, and get things done</strong>. Browse events, manage benefits, 
                and share your experiences seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Color Selection */}
      <section className="colors-section" ref={colorsRef}>
        <div className="section-container">
          <h2 className="section-title-large">Choose your color.</h2>
          <ColorSelector
            colors={colors}
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <h2 className="cta-title">Ready to join Wish Waves Club?</h2>
          <p className="cta-description">
            Experience exclusive benefits, premium events, and a global community.
          </p>
          <div className="cta-actions">
            <button className="btn-primary-large" onClick={() => navigate('/join')}>
              Join Now
            </button>
            <button className="btn-secondary-large" onClick={() => navigate('/benefits')}>
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default iPadAirStyle

