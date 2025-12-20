import React from 'react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import './ValueProgram.css'

const ValueProgram = () => {
  const [sectionRef, isSectionVisible] = useScrollAnimation({ threshold: 0.1 })

  return (
    <section id="value-program" className="value-program" ref={sectionRef}>
      <div className="value-program-container">
        <div className={`value-program-content ${isSectionVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>
          <h2 className="value-program-title">Wish Waves Club Value Program</h2>
          <p className="value-program-description">
            The Value Program is an optional participation framework for members interested in long-term value creation.
          </p>
          <div className="value-program-features">
            <div className="value-feature">
              <h3 className="value-feature-title">Transparent</h3>
            </div>
            <div className="value-feature">
              <h3 className="value-feature-title">Structured</h3>
            </div>
            <div className="value-feature">
              <h3 className="value-feature-title">Non-mandatory</h3>
            </div>
            <div className="value-feature">
              <h3 className="value-feature-title">Not positioned as an investment product</h3>
            </div>
          </div>
          <p className="value-program-note">
            Participation is always a choice — never a requirement.
          </p>
        </div>
      </div>
    </section>
  )
}

export default ValueProgram

