import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { authAPI } from '../services/api'
import './MemberDashboard.css'

const MemberDashboard = () => {
  const { user, logout } = useAuth()
  const [memberData, setMemberData] = useState({
    cardHolderName: '',
    cardExpiryDate: '',
    cardUid: '',
    cardStatus: 'active',
    membershipType: '',
    membershipExpiry: '',
    ongoingOffers: [],
    upcomingEvents: [],
  })
  const [loading, setLoading] = useState(true)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportType, setReportType] = useState('lost')

  useEffect(() => {
    fetchMemberData()
  }, [user])

  const fetchMemberData = async () => {
    try {
      setLoading(true)
      // In a real app, this would call an API endpoint
      // For now, using mock data based on user info
      const expiryDate = new Date()
      expiryDate.setFullYear(expiryDate.getFullYear() + 1) // 1 year from now
      
      setMemberData({
        cardHolderName: user?.fullName || 'Member',
        cardExpiryDate: expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        cardUid: 'CARD694D4519533',
        cardStatus: 'active',
        membershipType: user?.membershipType || 'annual',
        membershipExpiry: expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        ongoingOffers: [
          { id: 1, title: '10% Off at Restaurants', discount: '10%', validUntil: '2025-12-31', description: 'Valid at all partner restaurants' },
          { id: 2, title: 'Free Coffee', discount: '100%', validUntil: '2025-12-30', description: 'One free coffee per day at Coffee Shop XYZ' },
          { id: 3, title: 'Spa Discount', discount: '15%', validUntil: '2026-01-15', description: '15% off spa services' },
        ],
        upcomingEvents: [
          { id: 1, title: 'Lifestyle Wellness Retreat', date: '2025-01-15', location: 'Dubai', type: 'Wellness' },
          { id: 2, title: 'Ocean Journey Experience', date: '2025-02-20', location: 'Abu Dhabi', type: 'Adventure' },
          { id: 3, title: 'Cultural Celebration', date: '2025-03-10', location: 'Dubai', type: 'Cultural' },
        ],
      })
    } catch (error) {
      console.error('Error fetching member data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReportCard = async () => {
    try {
      // In a real app, this would call an API endpoint
      alert(`Card reported as ${reportType}. Our team will contact you shortly.`)
      setShowReportModal(false)
      setMemberData({ ...memberData, cardStatus: reportType })
    } catch (error) {
      alert('Error reporting card. Please try again.')
    }
  }

  const handleBlockCard = async () => {
    if (window.confirm('Are you sure you want to block your card? This action can be reversed by contacting support.')) {
      try {
        // In a real app, this would call an API endpoint
        alert('Card blocked successfully. Contact support to unblock.')
        setMemberData({ ...memberData, cardStatus: 'blocked' })
      } catch (error) {
        alert('Error blocking card. Please try again.')
      }
    }
  }

  if (loading) {
    return (
      <div className="member-dashboard">
        <Header />
        <div className="loading-container">
          <div className="loading">Loading...</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="member-dashboard">
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {memberData.cardHolderName}!</h1>
            <p className="dashboard-subtitle">Your membership dashboard</p>
          </div>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>

        {/* Membership Card Section */}
        <div className="membership-card-section">
          <div className="membership-card">
            <div className="card-header">
              <h2>Membership Card</h2>
              <span className={`card-status-badge ${memberData.cardStatus}`}>
                {memberData.cardStatus.charAt(0).toUpperCase() + memberData.cardStatus.slice(1)}
              </span>
            </div>
            <div className="card-details">
              <div className="card-detail-row">
                <span className="card-label">Card Holder Name:</span>
                <span className="card-value">{memberData.cardHolderName}</span>
              </div>
              <div className="card-detail-row">
                <span className="card-label">Card UID:</span>
                <span className="card-value code">{memberData.cardUid}</span>
              </div>
              <div className="card-detail-row">
                <span className="card-label">Expiry Date:</span>
                <span className="card-value">{memberData.cardExpiryDate}</span>
              </div>
              <div className="card-detail-row">
                <span className="card-label">Member Type:</span>
                <span className="card-value">{memberData.membershipType.charAt(0).toUpperCase() + memberData.membershipType.slice(1)}</span>
              </div>
              <div className="card-detail-row">
                <span className="card-label">Membership Expires:</span>
                <span className="card-value">{memberData.membershipExpiry}</span>
              </div>
            </div>
            <div className="card-actions">
              <button 
                className="action-button report-button"
                onClick={() => setShowReportModal(true)}
                disabled={memberData.cardStatus !== 'active'}
              >
                Report Lost Card
              </button>
              <button 
                className="action-button block-button"
                onClick={handleBlockCard}
                disabled={memberData.cardStatus !== 'active'}
              >
                Block Card
              </button>
            </div>
          </div>
        </div>

        {/* Ongoing Offers */}
        <div className="section-header-row">
          <h2>Ongoing Offers</h2>
        </div>
        <div className="offers-grid">
          {memberData.ongoingOffers.map((offer) => (
            <div key={offer.id} className="offer-card">
              <div className="offer-header">
                <h3>{offer.title}</h3>
                <span className="offer-discount">{offer.discount}</span>
              </div>
              <p className="offer-description">{offer.description}</p>
              <div className="offer-footer">
                <span className="offer-validity">Valid until: {offer.validUntil}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming Events */}
        <div className="section-header-row">
          <h2>Upcoming Events</h2>
        </div>
        <div className="events-grid">
          {memberData.upcomingEvents.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <h3>{event.title}</h3>
                <span className="event-type">{event.type}</span>
              </div>
              <div className="event-details">
                <div className="event-detail">
                  <span className="event-icon">📅</span>
                  <span>{event.date}</span>
                </div>
                <div className="event-detail">
                  <span className="event-icon">📍</span>
                  <span>{event.location}</span>
                </div>
              </div>
              <button className="event-button">View Details</button>
            </div>
          ))}
        </div>
      </div>

      {/* Report Card Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Report Card Issue</h3>
            <div className="modal-form">
              <label>Issue Type:</label>
              <select 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value)}
                className="form-select"
              >
                <option value="lost">Lost</option>
                <option value="stolen">Stolen</option>
                <option value="damaged">Damaged</option>
              </select>
              <div className="modal-actions">
                <button onClick={handleReportCard} className="submit-button">
                  Report
                </button>
                <button onClick={() => setShowReportModal(false)} className="cancel-button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default MemberDashboard
