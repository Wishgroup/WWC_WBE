import React, { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import './BankTransferReview.css'

const BankTransferReview = () => {
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [actionModal, setActionModal] = useState(null) // { receiptId, action: 'approve'|'reject' }
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadReceipts()
  }, [])

  useEffect(() => {
    if (!actionModal) setNotes('')
  }, [actionModal])

  const loadReceipts = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await adminAPI.getPendingBankTransferReceipts()
      setReceipts(res.data || [])
    } catch (err) {
      console.error('Error loading receipts:', err)
      setError(err.message || 'Failed to load receipts')
    } finally {
      setLoading(false)
    }
  }

  const handleViewReceipt = async (receipt) => {
    try {
      setSelectedReceipt(receipt)
      setPreviewUrl(null)
      const blob = await adminAPI.getReceiptDownloadBlob(receipt.id)
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
    } catch (err) {
      console.error('Error loading receipt file:', err)
      setError('Failed to load receipt preview')
    }
  }

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setSelectedReceipt(null)
  }

  const openActionModal = (receiptId, action) => {
    setActionModal({ receiptId, action })
    setNotes('')
  }

  const closeActionModal = () => {
    setActionModal(null)
    setNotes('')
  }

  const handleReview = async () => {
    if (!actionModal) return
    if (actionModal.action === 'reject' && !notes.trim()) {
      setError('Please provide a reason for rejection')
      return
    }
    try {
      setSubmitting(true)
      setError('')
      await adminAPI.reviewBankTransferReceipt(
        actionModal.receiptId,
        actionModal.action,
        notes.trim() || undefined
      )
      closeActionModal()
      loadReceipts()
      if (selectedReceipt?.id === actionModal.receiptId) closePreview()
    } catch (err) {
      setError(err.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="bank-transfer-review loading">Loading bank transfer receipts...</div>
  }

  return (
    <div className="bank-transfer-review">
      <div className="dashboard-header">
        <h1>Bank Transfer Receipt Review</h1>
        <p>Review and approve or reject uploaded payment receipts</p>
      </div>

      {error && (
        <div className="review-error-alert">
          {error}
          <button type="button" onClick={() => setError('')} aria-label="Dismiss">×</button>
        </div>
      )}

      <div className="receipts-section">
        <div className="receipts-toolbar">
          <button type="button" className="refresh-btn" onClick={loadReceipts}>
            Refresh
          </button>
        </div>
        <div className="receipts-table-container">
          <table className="receipts-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Member</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Uploaded</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">No pending receipts</td>
                </tr>
              ) : (
                receipts.map((r) => (
                  <tr key={r.id}>
                    <td className="order-id">{r.order_id}</td>
                    <td>{r.member_name || '—'}</td>
                    <td>{r.email || '—'}</td>
                    <td>
                      {r.currency} {r.amount != null ? Number(r.amount).toLocaleString() : '—'}
                    </td>
                    <td>{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
                    <td>
                      <span className={`status-badge status-${r.upload_status}`}>
                        {r.upload_status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        type="button"
                        className="btn-view"
                        onClick={() => handleViewReceipt(r)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn-approve"
                        onClick={() => openActionModal(r.id, 'approve')}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn-reject"
                        onClick={() => openActionModal(r.id, 'reject')}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview modal */}
      {selectedReceipt && (
        <div className="preview-overlay" role="dialog" aria-modal="true" aria-label="Receipt preview">
          <div className="preview-content">
            <div className="preview-header">
              <h3>Receipt: {selectedReceipt.order_id}</h3>
              <button type="button" className="close-btn" onClick={closePreview} aria-label="Close">
                ×
              </button>
            </div>
            <div className="preview-body">
              {previewUrl && (
                <>
                  {selectedReceipt.receipt_mime_type?.startsWith('image/') ? (
                    <img src={previewUrl} alt="Receipt" className="preview-image" />
                  ) : (
                    <div className="preview-pdf">
                      <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                        Open PDF in new tab
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approve/Reject modal */}
      {actionModal && (
        <div className="action-overlay" role="dialog" aria-modal="true" aria-label="Review receipt">
          <div className="action-modal">
            <h3>
              {actionModal.action === 'approve' ? 'Approve' : 'Reject'} receipt
            </h3>
            {actionModal.action === 'reject' && (
              <p className="action-hint">Please provide a reason for rejection (shown to the member).</p>
            )}
            <label>
              Notes
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  actionModal.action === 'approve'
                    ? 'Optional notes'
                    : 'Reason for rejection (required)'
                }
                rows={3}
              />
            </label>
            <div className="action-buttons">
              <button type="button" className="btn-secondary" onClick={closeActionModal}>
                Cancel
              </button>
              <button
                type="button"
                className={actionModal.action === 'approve' ? 'btn-approve' : 'btn-reject'}
                onClick={handleReview}
                disabled={submitting || (actionModal.action === 'reject' && !notes.trim())}
              >
                {submitting ? 'Submitting...' : actionModal.action === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BankTransferReview
