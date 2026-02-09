import React from 'react'
import InfoPage from '../components/InfoPage'

const Corporate = () => (
  <InfoPage
    title="Corporate Gifting"
    description={
      <>
        <p>Bulk memberships and corporate packages for teams, clients, and partners.</p>
        <p>Contact us for pricing and custom arrangements.</p>
      </>
    }
    ctaLabel="Contact Support"
    ctaTo="/support"
  />
)

export default Corporate
