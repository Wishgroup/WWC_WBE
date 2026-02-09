import React from 'react'
import InfoPage from '../components/InfoPage'

const Refer = () => (
  <InfoPage
    title="Refer a Friend"
    description={
      <>
        <p>Share the Wish Waves Club experience and earn rewards when your friends join.</p>
        <p>Referral program details and your unique referral link are available in your member dashboard after login.</p>
      </>
    }
    ctaLabel="Member Login"
    ctaTo="/login"
  />
)

export default Refer
