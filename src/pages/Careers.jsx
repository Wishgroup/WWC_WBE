import React from 'react'
import InfoPage from '../components/InfoPage'

const Careers = () => (
  <InfoPage
    title="Careers at Wish Waves Club"
    description={
      <>
        <p>Join our team and help shape the future of membership and experiences.</p>
        <p>Open positions and application details will be posted here. For general inquiries, contact us via the Support page.</p>
      </>
    }
    ctaLabel="Contact Us"
    ctaTo="/support"
  />
)

export default Careers
