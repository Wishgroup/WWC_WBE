import React, { useState, useEffect } from 'react'
import './OfferManagement.css'

const OfferManagement = () => {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(false)

  // Mock data for now - will integrate with API later
  useEffect(() => {
    setOffers([
      {
        id: 1,
        offer_code: 'WELCOME10',
        offer_type: 'percentage',
        discount_percentage: 10,
        membership_type: null,
        vendor_category: 'restaurant',
        country_code: 'AE',
        is_active: true,
        valid_until: '2026-12-25',
        usage_limit: 5,
        priority: 10,
      },
    ])
  }, [])

  return (
    <div className="offer-management">
      <div className="dashboard-header">
        <h1>Offer Management</h1>
        <p>Create and manage dynamic offers for members</p>
      </div>

      <div className="offers-section">
        <div className="section-header">
          <h3>Active Offers</h3>
          <button className="create-btn">+ Create New Offer</button>
        </div>
        <div className="offers-grid">
          {offers.map((offer) => (
            <div key={offer.id} className="offer-card">
              <div className="offer-header">
                <h4>{offer.offer_code}</h4>
                <span className={`status-badge ${offer.is_active ? 'active' : 'inactive'}`}>
                  {offer.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="offer-details">
                <div className="detail-item">
                  <span className="label">Type:</span>
                  <span className="value">{offer.offer_type}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Discount:</span>
                  <span className="value">
                    {offer.discount_percentage ? `${offer.discount_percentage}%` : 'N/A'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Category:</span>
                  <span className="value">{offer.vendor_category || 'All'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Country:</span>
                  <span className="value">{offer.country_code || 'All'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Usage Limit:</span>
                  <span className="value">{offer.usage_limit || 'Unlimited'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Priority:</span>
                  <span className="value">{offer.priority}</span>
                </div>
              </div>
              <div className="offer-actions">
                <button className="edit-btn">Edit</button>
                <button className="deactivate-btn">Deactivate</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OfferManagement


