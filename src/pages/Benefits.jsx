import React from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ScrollReveal from '../components/ScrollReveal'
import BenefitsCarousel from '../components/BenefitsCarousel'
import './Benefits.css'

const Benefits = () => {
  const navigate = useNavigate()

  return (
    <div className="benefits-page">
      <Header />
      
      {/* Hero Section */}
      <section className="benefits-hero">
        <div className="benefits-hero-content">
          <h1 className="benefits-hero-title">
            <ScrollReveal
              scrollContainerRef={null}
              enableBlur={true}
              baseOpacity={0.1}
              baseRotation={2}
              blurStrength={3}
            >
              BENEFITS
            </ScrollReveal>
          </h1>
          <div className="benefits-hero-subtitle">
            <ScrollReveal
              scrollContainerRef={null}
              enableBlur={false}
              baseOpacity={0.2}
              baseRotation={1}
            >
              What Members Enjoy
            </ScrollReveal>
          </div>
          <p className="benefits-hero-description">
            Wish Waves Club members gain access to a wide range of benefits across lifestyle, travel, wellness, and experiences.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="benefits-main">
        <div className="benefits-container">
          {/* Benefits Carousel */}
          <BenefitsCarousel />

          {/* Additional Info Section */}
          <div className="benefits-cta-section">
            <div className="benefits-cta-content">
              <h2 className="benefits-cta-title">Ready to Experience These Benefits?</h2>
              <p className="benefits-cta-text">
                Join Wish Waves Club today and start enjoying exclusive access to events, gifts, experiences, and more.
              </p>
              <button 
                className="benefits-cta-button"
                onClick={() => navigate('/join')}
              >
                Join Now
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Benefits

