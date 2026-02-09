import React from 'react'
import InfoPage from '../components/InfoPage'

const Community = () => (
  <InfoPage
    title="WWC Community"
    description={
      <>
        <p>Connect with fellow members, share experiences, and stay updated on events and offers.</p>
        <p>Community features are available to active members through the member dashboard.</p>
      </>
    }
    ctaLabel="Member Login"
    ctaTo="/login"
  />
)

export default Community
