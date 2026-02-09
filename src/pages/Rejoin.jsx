import React from 'react'
import InfoPage from '../components/InfoPage'

const Rejoin = () => (
  <InfoPage
    title="Rejoin Wish Waves Club"
    description={
      <>
        <p>We'd love to have you back. Former members can rejoin and enjoy exclusive benefits again.</p>
        <p>Contact us to reactivate your membership or use the link below to explore current plans.</p>
      </>
    }
    ctaLabel="Contact Support"
    ctaTo="/support"
  />
)

export default Rejoin
