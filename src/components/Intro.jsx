import React from 'react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import './Intro.css'

const Intro = () => {
  const [sectionRef, isSectionVisible] = useScrollAnimation({ threshold: 0.1 })

  return (
    <section className="intro" ref={sectionRef}>
      <div className="intro-container">
        <div className={`intro-content ${isSectionVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>
          <h2 className="intro-title">More Than a Club. A Community.</h2>
          <div className="intro-text">
            <p>
              Wish Waves Club is a community-first membership inspired by global clubs such as Rotaract and Leo Club — reimagined for today's lifestyle-driven, experience-seeking generation.
            </p>
            <p>
              We bring people together through curated lifestyle moments, ocean-led journeys, and a transparent value ecosystem that members can choose to participate in.
            </p>
            <div className="intro-statements">
              <p className="statement">This is not a discount club.</p>
              <p className="statement">This is not an investment scheme.</p>
              <p className="statement highlight">This is a place to belong.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Intro

