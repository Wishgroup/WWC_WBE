import React, { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import './BankTransferVerification.css'

const BankTransferVerification = () => {
  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTransfer, setSelectedTransfer] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [filter, setFilter] = useState('pending') // pending, verified, rejected

  useEffect(() => {
    loadBankTransfers()
  }, [filter])

  const loadBankTransfers = async () => {
    try {
      setLoading(true)
      const data = await adminAPI.getBankTransfers(filter)
      setTransfers(data.transfers || [])
    } catch (error) {
      console.error('Error loading bank transfers:', error)
      alert('Error loading bank transfers: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (orderId) => {
    if (!window.confirm('Are you sure you want to verify this payment and activate the membership?')) {
      return
    }

    try {
      setVerifying(true)
      const result = await adminAPI.verifyBankTransfer(orderId)
      alert(result.message || 'Payment verified and membership activated successfully!')
      loadBankTransfers()
      setSelectedTransfer(null)
    } catch (error) {
      alert('Error verifying payment: ' + (error.message || 'Unknown error'))
    } finally {
      setVerifying(false)
    }
  }

  const handleReject = async (orderId) => {
    const reason = window.prompt('Please provide a reason for rejection:')
    if (!reason || reason.trim() === '') {
      alert('Rejection reason is required')
      return
    }

    if (!window.confirm('Are you sure you want to reject this payment?')) {
      return
    }

    try {
      setVerifying(true)
      const result = await adminAPI.rejectBankTransfer(orderId, reason)
      alert(result.message || 'Payment rejected')
      loadBankTransfers()
      setSelectedTransfer(null)
    } catch (error) {
      alert('Error rejecting payment: ' + (error.message || 'Unknown error'))
    } finally {
      setVerifying(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const formatAmount = (amount) => {
    return `$${parseFloat(amount).toLocaleString()} USD`
  }

  const getReceiptUrl = (receiptPath) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    return `${API_BASE_URL}${receiptPath}`
  }

  if (loading) {
    return (
      <div className="bank-transfer-verification">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading bank transfers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bank-transfer-verification">
      <div className="verification-header">
        <h2>Bank Transfer Verification</h2>
        <p>Review and verify bank transfer payments</p>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({transfers.filter(t => t.status === 'pending_verification').length})
        </button>
        <button
          className={`filter-tab ${filter === 'verified' ? 'active' : ''}`}
          onClick={() => setFilter('verified')}
        >
          Verified ({transfers.filter(t => t.status === 'verified').length})
        </button>
        <button
          className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({transfers.filter(t => t.status === 'rejected').length})
        </button>
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
      </div>

      {transfers.length === 0 ? (
        <div className="empty-state">
          <p>No bank transfers found</p>
        </div>
      ) : (
        <div className="transfers-list">
          {transfers.map((transfer) => (
            <div key={transfer.id} className="transfer-card">
              <div className="transfer-header">
                <div className="transfer-info">
                  <h3>Order ID: {transfer.order_id}</h3>
                  <p className="transfer-date">Submitted: {formatDate(transfer.created_at)}</p>
                </div>
                <div className="transfer-status">
                  <span className={`status-badge status-${transfer.status}`}>
                    {transfer.status === 'pending_verification' ? 'Pending' : 
                     transfer.status === 'verified' ? 'Verified' : 'Rejected'}
                  </span>
                </div>
              </div>

              <div className="transfer-details">
                <div className="detail-row">
                  <span className="detail-label">Member:</span>
                  <span className="detail-value">{transfer.member_name || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{transfer.member_email || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Membership Type:</span>
                  <span className="detail-value">{transfer.membership_type || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value amount">{formatAmount(transfer.amount)}</span>
                </div>
                {transfer.verified_at && (
                  <div className="detail-row">
                    <span className="detail-label">Verified At:</span>
                    <span className="detail-value">{formatDate(transfer.verified_at)}</span>
                  </div>
                )}
                {transfer.rejection_reason && (
                  <div className="detail-row">
                    <span className="detail-label">Rejection Reason:</span>
                    <span className="detail-value rejection-reason">{transfer.rejection_reason}</span>
                  </div>
                )}
              </div>

              {transfer.receipt_path && (
                <div className="receipt-section">
                  <h4>Bank Receipt</h4>
                  <div className="receipt-preview">
                    {transfer.receipt_mime_type?.startsWith('image/') ? (
                      <img
                        src={getReceiptUrl(transfer.receipt_path)}
                        alt="Bank receipt"
                        onClick={() => window.open(getReceiptUrl(transfer.receipt_path), '_blank')}
                      />
                    ) : (
                      <div className="pdf-preview">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        <p>PDF Receipt</p>
                        <a
                          href={getReceiptUrl(transfer.receipt_path)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View PDF
                        </a>
                      </div>
                    )}
                  </div>
                  <p className="receipt-info">
                    File: {transfer.receipt_original_name} ({(transfer.receipt_size / 1024).toFixed(2)} KB)
                  </p>
                </div>
              )}

              {transfer.status === 'pending_verification' && (
                <div className="transfer-actions">
                  <button
                    className="btn-verify"
                    onClick={() => handleVerify(transfer.order_id)}
                    disabled={verifying}
                  >
                    {verifying ? 'Verifying...' : '✓ Verify & Activate'}
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleReject(transfer.order_id)}
                    disabled={verifying}
                  >
                    ✗ Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BankTransferVerification


