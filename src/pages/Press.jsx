import React from 'react'
import InfoPage from '../components/InfoPage'

const Press = () => (
  <InfoPage
    title="Press Center"
    description={
      <>
        <p>Media kit, press releases, and brand resources for journalists and partners.</p>
        <p>For press inquiries, please contact us through the Support page.</p>
      </>
    }
    ctaLabel="Contact Support"
    ctaTo="/support"
  />
)

export default Press
