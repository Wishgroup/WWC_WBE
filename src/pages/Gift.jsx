import React from 'react'
import InfoPage from '../components/InfoPage'

const Gift = () => (
  <InfoPage
    title="Gift Membership"
    description={
      <>
        <p>Give the gift of exclusive experiences. Wish Waves Club membership makes a memorable present.</p>
        <p>Choose a plan and we'll help you arrange delivery to your recipient.</p>
      </>
    }
    ctaLabel="View Membership Plans"
    ctaTo="/join"
  />
)

export default Gift
