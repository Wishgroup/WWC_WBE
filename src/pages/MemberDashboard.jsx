import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SupportWidget from '../components/SupportWidget'
import { memberAPI, eventsAPI } from '../services/api'
import './MemberDashboard.css'

const MemberDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
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
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      fetchMemberData()
    }
  }, [user])

  const fetchMemberData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch member profile and card
      const profileRes = await memberAPI.getMe()
      if (!profileRes.success) {
        throw new Error(profileRes.error || 'Failed to load profile')
      }

      const { profile, card } = profileRes

      // Fetch offers
      let offers = []
      try {
        const offersRes = await memberAPI.getOffers(profile.membershipType)
        if (offersRes.success) {
          offers = offersRes.offers || []
        }
      } catch (e) {
        console.warn('Failed to load offers:', e)
      }

      // Fetch upcoming events
      let events = []
      try {
        const eventsRes = await eventsAPI.getUpcoming()
        if (eventsRes.success && Array.isArray(eventsRes.data)) {
          events = eventsRes.data.slice(0, 6) // Limit to 6 events
        }
      } catch (e) {
        console.warn('Failed to load events:', e)
      }

      // Format card expiry date
      let cardExpiryDate = ''
      if (card?.expiresAt) {
        const expiry = new Date(card.expiresAt)
        cardExpiryDate = expiry.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      }

      // Format membership expiry
      let membershipExpiry = ''
      if (profile.subscriptionEnd) {
        const expiry = new Date(profile.subscriptionEnd)
        membershipExpiry = expiry.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      }

      setMemberData({
        cardHolderName: profile.fullName || 'Member',
        cardExpiryDate: cardExpiryDate,
        cardUid: card?.cardUid || 'N/A',
        cardStatus: card?.status || 'active',
        membershipType: profile.membershipType || 'annual',
        membershipExpiry: membershipExpiry,
        ongoingOffers: offers,
        upcomingEvents: events,
      })
    } catch (error) {
      console.error('Error fetching member data:', error)
      setError(error.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleReportCard = async () => {
    try {
      const res = await memberAPI.reportCard(memberData.cardUid, reportType)
      if (res.success) {
        alert(`Card reported as ${reportType}. Our team will contact you shortly.`)
        setShowReportModal(false)
        setMemberData({ ...memberData, cardStatus: reportType })
        // Refresh data
        fetchMemberData()
      } else {
        alert(res.error || 'Error reporting card. Please try again.')
      }
    } catch (error) {
      alert('Error reporting card. Please try again.')
    }
  }

  const handleBlockCard = async () => {
    if (window.confirm('Are you sure you want to block your card? This action can be reversed by contacting support.')) {
      try {
        const res = await memberAPI.blockCard(memberData.cardUid)
        if (res.success) {
          alert('Card blocked successfully. Contact support to unblock.')
          setMemberData({ ...memberData, cardStatus: 'blocked' })
          // Refresh data
          fetchMemberData()
        } else {
          alert(res.error || 'Error blocking card. Please try again.')
        }
      } catch (error) {
        alert('Error blocking card. Please try again.')
      }
    }
  }

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`)
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

  if (error) {
    return (
      <div className="member-dashboard">
        <Header />
        <div className="dashboard-container">
          <div className="error-container">
            <p>{error}</p>
            <button onClick={fetchMemberData} className="retry-button">Retry</button>
          </div>
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

        {/* Support Widget */}
        <SupportWidget />

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
        {memberData.ongoingOffers.length === 0 ? (
          <div className="empty-section">
            <p>No active offers at the moment.</p>
          </div>
        ) : (
          <div className="offers-grid">
            {memberData.ongoingOffers.map((offer) => (
              <div key={offer.id} className="offer-card">
                <div className="offer-header">
                  <h3>{offer.title || offer.code}</h3>
                  <span className="offer-discount">{offer.discount}</span>
                </div>
                <p className="offer-description">{offer.description}</p>
                {offer.validUntil && (
                  <div className="offer-footer">
                    <span className="offer-validity">Valid until: {offer.validUntil}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upcoming Events */}
        <div className="section-header-row">
          <h2>Upcoming Events</h2>
        </div>
        {memberData.upcomingEvents.length === 0 ? (
          <div className="empty-section">
            <p>No upcoming events at the moment.</p>
          </div>
        ) : (
          <div className="events-grid">
            {memberData.upcomingEvents.map((event) => {
              const eventDate = event.start_time ? new Date(event.start_time).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              }) : 'TBA'
              return (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <h3>{event.event_name || event.name || 'Event'}</h3>
                  </div>
                  <div className="event-details">
                    <div className="event-detail">
                      <span className="event-icon">📅</span>
                      <span>{eventDate}</span>
                    </div>
                    {event.location && (
                      <div className="event-detail">
                        <span className="event-icon">📍</span>
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                  <button 
                    className="event-button"
                    onClick={() => handleEventClick(event.id)}
                  >
                    View Details
                  </button>
                </div>
              )
            })}
          </div>
        )}
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
