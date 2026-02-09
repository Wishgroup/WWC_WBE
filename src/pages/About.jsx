import React from 'react'
import InfoPage from '../components/InfoPage'

const About = () => (
  <InfoPage
    title="About Wish Waves Club"
    description={
      <>
        <p>Wish Waves Club unlocks exclusive experiences and meaningful connections for our members.</p>
        <p>We partner with premium brands and destinations to deliver benefits, events, and a community built around the oceanic lifestyle.</p>
      </>
    }
    ctaLabel="Explore Benefits"
    ctaTo="/benefits"
  />
)

export default About
