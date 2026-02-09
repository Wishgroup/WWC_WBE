import React from 'react'
import InfoPage from '../components/InfoPage'

const OrderStatus = () => (
  <InfoPage
    title="Order Status"
    description={
      <>
        <p>Check the status of your membership application, payment, or card issuance.</p>
        <p>Log in to your member dashboard to view your order history and current status.</p>
      </>
    }
    ctaLabel="Member Login"
    ctaTo="/login"
    showJoin={true}
  />
)

export default OrderStatus
