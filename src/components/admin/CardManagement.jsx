import React, { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { useNotification } from '../../hooks/useNotification'
import './CardManagement.css'

const CardManagement = () => {
  const [blockedCards, setBlockedCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { success, error, NotificationComponent } = useNotification()
  const [formData, setFormData] = useState({
    cardUid: '',
    reason: '',
    reportType: 'lost',
    oldCardUid: '',
    newCardUid: '',
    // Card issuance (Phase 3)
    issuanceMemberId: '',
    issuanceCardUid: '',
    issuanceSessionId: '',
  })
  const [issuanceData, setIssuanceData] = useState(null)

  useEffect(() => {
    loadBlockedCards()
  }, [])

  const loadBlockedCards = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      const data = await adminAPI.getBlockedCards()
      setBlockedCards(data.data || [])
      if (isRefresh) {
        success('Card data refreshed successfully')
      }
    } catch (err) {
      console.error('Error loading blocked cards:', err)
      error('Error loading cards: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleBlock = async (e) => {
    e.preventDefault()
    if (!formData.cardUid) {
      error('Please enter card UID')
      return
    }
    try {
      setActionLoading(true)
      await adminAPI.blockCard(formData.cardUid, formData.reason || 'admin_block')
      success('Card blocked successfully')
      setFormData({ ...formData, cardUid: '', reason: '' })
      loadBlockedCards(true)
    } catch (err) {
      error('Error blocking card: ' + (err.message || 'Unknown error'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnblock = async (cardUid) => {
    if (!confirm(`Unblock card ${cardUid}?`)) return
    try {
      setActionLoading(true)
      await adminAPI.unblockCard(cardUid)
      success('Card unblocked successfully')
      loadBlockedCards(true)
    } catch (err) {
      error('Error unblocking card: ' + (err.message || 'Unknown error'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleReport = async (e) => {
    e.preventDefault()
    if (!formData.cardUid) {
      error('Please enter card UID')
      return
    }
    try {
      setActionLoading(true)
      await adminAPI.reportCard(formData.cardUid, formData.reportType)
      success(`Card reported as ${formData.reportType} successfully`)
      setFormData({ ...formData, cardUid: '', reportType: 'lost' })
      loadBlockedCards(true)
    } catch (err) {
      error('Error reporting card: ' + (err.message || 'Unknown error'))
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
      success('Card reissued successfully. Old card UID blacklisted.')
      setFormData({ ...formData, oldCardUid: '', newCardUid: '' })
      loadBlockedCards(true)
    } catch (err) {
      error('Error reissuing card: ' + (err.message || 'Unknown error'))
    } finally {
      setActionLoading(false)
    }
  }

  const handlePrepareIssuance = async (e) => {
    e.preventDefault()
    if (!formData.issuanceMemberId) {
      error('Please enter member ID')
      return
    }
    try {
      setActionLoading(true)
      const result = await adminAPI.prepareCardIssuance(formData.issuanceMemberId)
      setIssuanceData(result.data)
      success('Card credential prepared successfully! Please write to physical card using Issuer Bridge.')
    } catch (err) {
      error('Error preparing card issuance: ' + (err.message || 'Unknown error'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmIssuance = async (e) => {
    e.preventDefault()
    if (!formData.issuanceSessionId || !formData.issuanceCardUid) {
      alert('Please enter session ID and card UID')
      return
    }
    try {
      setActionLoading(true)
      await adminAPI.confirmCardIssuance(formData.issuanceSessionId, formData.issuanceCardUid)
      alert('Card issuance confirmed successfully!')
      setIssuanceData(null)
      setFormData({ ...formData, issuanceSessionId: '', issuanceCardUid: '', issuanceMemberId: '' })
    } catch (error) {
      alert('Error confirming card issuance: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    success('Copied to clipboard!')
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
      {NotificationComponent}
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>NFC Card Management</h1>
            <p>Manage card lifecycle: block, unblock, reissue, and report cards</p>
          </div>
          <button 
            className="refresh-button" 
            onClick={() => loadBlockedCards(true)}
            disabled={refreshing || loading}
            title="Refresh card data"
          >
            {refreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
          </button>
        </div>
      </div>

      {/* Card Issuance Section (Phase 3) */}
      <div className="card-issuance-section">
        <div className="section-header">
          <h2>Card Issuance (DESFire EV2)</h2>
          <p>Prepare and confirm secure card credentials</p>
        </div>

        {!issuanceData ? (
          <div className="action-card">
            <h3>Prepare Card Credential</h3>
            <form onSubmit={handlePrepareIssuance}>
              <input
                type="number"
                placeholder="Member ID"
                value={formData.issuanceMemberId}
                onChange={(e) => setFormData({ ...formData, issuanceMemberId: e.target.value })}
                required
              />
              <button type="submit" disabled={actionLoading}>
                {actionLoading ? 'Preparing...' : 'Prepare Credential'}
              </button>
            </form>
          </div>
        ) : (
          <div className="issuance-result">
            <div className="issuance-info">
              <h3>Credential Prepared Successfully</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Session ID:</label>
                  <div className="info-value">
                    <code>{issuanceData.sessionId}</code>
                    <button onClick={() => copyToClipboard(issuanceData.sessionId)} className="copy-btn">Copy</button>
                  </div>
                </div>
                <div className="info-item">
                  <label>Card Public ID:</label>
                  <div className="info-value">
                    <code>{issuanceData.card_public_id}</code>
                    <button onClick={() => copyToClipboard(issuanceData.card_public_id)} className="copy-btn">Copy</button>
                  </div>
                </div>
                <div className="info-item">
                  <label>Member:</label>
                  <div className="info-value">{issuanceData.member?.full_name} ({issuanceData.member?.email})</div>
                </div>
                <div className="info-item">
                  <label>Membership Type:</label>
                  <div className="info-value">{issuanceData.member?.membership_type}</div>
                </div>
              </div>

              <div className="payload-section">
                <label>Payload (to write to card):</label>
                <textarea
                  readOnly
                  value={issuanceData.payload_json}
                  className="payload-textarea"
                  rows="6"
                />
                <button onClick={() => copyToClipboard(issuanceData.payload_json)} className="copy-btn">Copy Payload</button>
              </div>

              <div className="signature-section">
                <label>Signature:</label>
                <div className="signature-value">
                  <code>{issuanceData.signature}</code>
                  <button onClick={() => copyToClipboard(issuanceData.signature)} className="copy-btn">Copy</button>
                </div>
              </div>

              <div className="issuance-instructions">
                <h4>Next Steps:</h4>
                <ol>
                  <li>Open the Issuer Bridge application on the Windows issuance station</li>
                  <li>Connect the ACR1252U reader</li>
                  <li>Tap the physical DESFire EV2 card</li>
                  <li>Write the payload and signature to the card</li>
                  <li>Note the card UID from the reader</li>
                  <li>Enter the session ID and card UID below to confirm</li>
                </ol>
              </div>

              <form onSubmit={handleConfirmIssuance} className="confirm-form">
                <h4>Confirm Issuance</h4>
                <input
                  type="text"
                  placeholder="Session ID"
                  value={formData.issuanceSessionId}
                  onChange={(e) => setFormData({ ...formData, issuanceSessionId: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Card UID (from reader)"
                  value={formData.issuanceCardUid}
                  onChange={(e) => setFormData({ ...formData, issuanceCardUid: e.target.value })}
                  required
                />
                <div className="form-actions">
                  <button type="submit" disabled={actionLoading} className="btn-confirm">
                    {actionLoading ? 'Confirming...' : 'Confirm Issuance'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIssuanceData(null)
                      setFormData({ ...formData, issuanceMemberId: '', issuanceSessionId: '', issuanceCardUid: '' })
                    }}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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


