import React, { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import './CardManagement.css'

const CardManagement = () => {
  const [blockedCards, setBlockedCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [formData, setFormData] = useState({
    cardUid: '',
    reason: '',
    reportType: 'lost',
    oldCardUid: '',
    newCardUid: '',
  })

  useEffect(() => {
    loadBlockedCards()
  }, [])

  const loadBlockedCards = async () => {
    try {
      setLoading(true)
      const data = await adminAPI.getBlockedCards()
      setBlockedCards(data.data || [])
    } catch (error) {
      console.error('Error loading blocked cards:', error)
      alert('Error loading cards: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBlock = async (e) => {
    e.preventDefault()
    if (!formData.cardUid) {
      alert('Please enter card UID')
      return
    }
    try {
      setActionLoading(true)
      await adminAPI.blockCard(formData.cardUid, formData.reason || 'admin_block')
      alert('Card blocked successfully')
      setFormData({ ...formData, cardUid: '', reason: '' })
      loadBlockedCards()
    } catch (error) {
      alert('Error blocking card: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnblock = async (cardUid) => {
    if (!confirm(`Unblock card ${cardUid}?`)) return
    try {
      setActionLoading(true)
      await adminAPI.unblockCard(cardUid)
      alert('Card unblocked successfully')
      loadBlockedCards()
    } catch (error) {
      alert('Error unblocking card: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReport = async (e) => {
    e.preventDefault()
    if (!formData.cardUid) {
      alert('Please enter card UID')
      return
    }
    try {
      setActionLoading(true)
      await adminAPI.reportCard(formData.cardUid, formData.reportType)
      alert(`Card reported as ${formData.reportType} successfully`)
      setFormData({ ...formData, cardUid: '', reportType: 'lost' })
      loadBlockedCards()
    } catch (error) {
      alert('Error reporting card: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReissue = async (e) => {
    e.preventDefault()
    if (!formData.oldCardUid || !formData.newCardUid) {
      alert('Please enter both old and new card UIDs')
      return
    }
    try {
      setActionLoading(true)
      await adminAPI.reissueCard(formData.oldCardUid, formData.newCardUid)
      alert('Card reissued successfully. Old card UID blacklisted.')
      setFormData({ ...formData, oldCardUid: '', newCardUid: '' })
      loadBlockedCards()
    } catch (error) {
      alert('Error reissuing card: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'blocked': return '#dc3545'
      case 'blacklisted': return '#6c757d'
      case 'lost': return '#ffc107'
      case 'stolen': return '#dc3545'
      case 'damaged': return '#17a2b8'
      default: return '#6c757d'
    }
  }

  if (loading) {
    return <div className="loading">Loading card data...</div>
  }

  return (
    <div className="card-management">
      <div className="dashboard-header">
        <h1>NFC Card Management</h1>
        <p>Manage card lifecycle: block, unblock, reissue, and report cards</p>
      </div>

      {/* Action Forms */}
      <div className="action-forms">
        {/* Block Card */}
        <div className="action-card">
          <h3>Block Card</h3>
          <form onSubmit={handleBlock}>
            <input
              type="text"
              placeholder="Card UID"
              value={formData.cardUid}
              onChange={(e) => setFormData({ ...formData, cardUid: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Reason (optional)"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
            <button type="submit" disabled={actionLoading}>
              {actionLoading ? 'Processing...' : 'Block Card'}
            </button>
          </form>
        </div>

        {/* Report Card */}
        <div className="action-card">
          <h3>Report Card</h3>
          <form onSubmit={handleReport}>
            <input
              type="text"
              placeholder="Card UID"
              value={formData.cardUid}
              onChange={(e) => setFormData({ ...formData, cardUid: e.target.value })}
              required
            />
            <select
              value={formData.reportType}
              onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
            >
              <option value="lost">Lost</option>
              <option value="stolen">Stolen</option>
              <option value="damaged">Damaged</option>
            </select>
            <button type="submit" disabled={actionLoading}>
              {actionLoading ? 'Processing...' : 'Report Card'}
            </button>
          </form>
        </div>

        {/* Reissue Card */}
        <div className="action-card">
          <h3>Reissue Card</h3>
          <form onSubmit={handleReissue}>
            <input
              type="text"
              placeholder="Old Card UID"
              value={formData.oldCardUid}
              onChange={(e) => setFormData({ ...formData, oldCardUid: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="New Card UID"
              value={formData.newCardUid}
              onChange={(e) => setFormData({ ...formData, newCardUid: e.target.value })}
              required
            />
            <button type="submit" disabled={actionLoading}>
              {actionLoading ? 'Processing...' : 'Reissue Card'}
            </button>
          </form>
        </div>
      </div>

      {/* Blocked Cards List */}
      <div className="blocked-cards-section">
        <div className="section-header">
          <h3>Blocked/Inactive Cards</h3>
          <button onClick={loadBlockedCards} className="refresh-btn">Refresh</button>
        </div>
        <div className="cards-table-container">
          <table className="cards-table">
            <thead>
              <tr>
                <th>Card UID</th>
                <th>Status</th>
                <th>Member</th>
                <th>Email</th>
                <th>Membership</th>
                <th>Blocked At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blockedCards.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">No blocked cards found</td>
                </tr>
              ) : (
                blockedCards.map((card) => (
                  <tr key={card.id || card._id}>
                    <td>
                      <code className="card-uid">{card.card_uid}</code>
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(card.card_status) }}
                      >
                        {card.card_status}
                      </span>
                    </td>
                    <td>{card.full_name || 'N/A'}</td>
                    <td>{card.email || 'N/A'}</td>
                    <td>{card.membership_type || 'N/A'}</td>
                    <td>
                      {card.blocked_at
                        ? new Date(card.blocked_at).toLocaleString()
                        : 'N/A'}
                    </td>
                    <td>
                      {card.card_status !== 'active' && (
                        <button
                          className="unblock-btn"
                          onClick={() => handleUnblock(card.card_uid)}
                          disabled={actionLoading}
                        >
                          Unblock
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default CardManagement


