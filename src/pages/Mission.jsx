import React from 'react'
import InfoPage from '../components/InfoPage'

const Mission = () => (
  <InfoPage
    title="Our Mission"
    description={
      <>
        <p>Our mission is to unlock exclusive experiences and meaningful connections for our members.</p>
        <p>We believe in the power of community, premium partnerships, and creating unforgettable moments.</p>
      </>
    }
    ctaLabel="Back to Home"
    ctaTo="/"
  />
)

export default Mission
