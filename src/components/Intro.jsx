import React from 'react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import BlurText from './BlurText'
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
              We bring people together through curated lifestyle moments, ocean-led journeys, and a transparent value ecosystem that members can choose to participate in.
            </p>
            <div className="intro-statements">
              <BlurText
                text="Some communities are built around offers. Others are built around people."
                delay={150}
                animateBy="words"
                direction="top"
                className="statement"
                startDelay={0}
              />
              <BlurText
                text="This is where Lifestyle, Ocean Experiences and Trusted Value come together ."
                delay={150}
                animateBy="words"
                direction="top"
                className="statement"
                startDelay={1600}
              />
              <BlurText
                text="It's not where you go.Let's Wish Beyond the Waves."
                delay={150}
                animateBy="words"
                direction="top"
                className="statement highlight"
                startDelay={3200}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Intro

