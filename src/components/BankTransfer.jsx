import React, { useState } from 'react'
import './BankTransfer.css'

const BANK_DETAILS = {
  bankName: 'Maldives Islamic Bank',
  accountName: 'WISH HOLDINGS PVT LTD',
  accountNumber: '90101480045682000',
  cifNumber: '48004568',
  accountType: 'Current Account',
  currency: 'USD',
  branchName: 'Main Branch',
  address: 'Malaaz, Huvadhumaa Goalhi, K. Male\', Maldives'
}

function BankTransfer({ membershipType, amount, onReceiptUpload, onProceed, isSubmitting }) {
  const [receiptFile, setReceiptFile] = useState(null)
  const [receiptPreview, setReceiptPreview] = useState(null)
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/pdf', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image (JPG, PNG) or PDF file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setError('')
    setReceiptFile(file)

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setReceiptPreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setReceiptPreview(null)
    }
  }

  const handleProceed = () => {
    if (!receiptFile) {
      setError('Please upload your bank transfer receipt')
      return
    }

    if (onReceiptUpload) {
      onReceiptUpload(receiptFile)
    }

    if (onProceed) {
      onProceed(receiptFile)
    }
  }

  const handleRemoveFile = () => {
    setReceiptFile(null)
    setReceiptPreview(null)
    setError('')
  }

  return (
    <div className="bank-transfer-container">
      <div className="bank-transfer-header">
        <h2>Bank Transfer Payment</h2>
        <p className="payment-amount">
          Amount to Transfer: <strong>${amount.toLocaleString()} USD</strong>
        </p>
      </div>

      <div className="bank-details-section">
        <h3>Bank Account Details</h3>
        <div className="bank-details-card">
          <div className="bank-detail-row">
            <span className="bank-detail-label">Bank Name:</span>
            <span className="bank-detail-value">{BANK_DETAILS.bankName}</span>
          </div>
          <div className="bank-detail-row">
            <span className="bank-detail-label">Account Name:</span>
            <span className="bank-detail-value">{BANK_DETAILS.accountName}</span>
          </div>
          <div className="bank-detail-row">
            <span className="bank-detail-label">Account Number:</span>
            <span className="bank-detail-value bank-account-number">{BANK_DETAILS.accountNumber}</span>
          </div>
          <div className="bank-detail-row">
            <span className="bank-detail-label">CIF Number:</span>
            <span className="bank-detail-value">{BANK_DETAILS.cifNumber}</span>
          </div>
          <div className="bank-detail-row">
            <span className="bank-detail-label">Account Type:</span>
            <span className="bank-detail-value">{BANK_DETAILS.accountType}</span>
          </div>
          <div className="bank-detail-row">
            <span className="bank-detail-label">Currency:</span>
            <span className="bank-detail-value">{BANK_DETAILS.currency}</span>
          </div>
          <div className="bank-detail-row">
            <span className="bank-detail-label">Branch:</span>
            <span className="bank-detail-value">{BANK_DETAILS.branchName}</span>
          </div>
          <div className="bank-detail-row">
            <span className="bank-detail-label">Address:</span>
            <span className="bank-detail-value">{BANK_DETAILS.address}</span>
          </div>
        </div>

        <div className="bank-instructions">
          <h4>Instructions:</h4>
          <ol>
            <li>Transfer the exact amount of <strong>${amount.toLocaleString()} USD</strong> to the account above</li>
            <li>Use your name as the payment reference</li>
            <li>After completing the transfer, upload your bank receipt below</li>
            <li>Click "Proceed" to submit your application</li>
            <li>Your membership will be activated after we verify your payment (usually within 24-48 hours)</li>
          </ol>
        </div>
      </div>

      <div className="receipt-upload-section">
        <h3>Upload Bank Transfer Receipt</h3>
        <div className="upload-area">
          {!receiptFile ? (
            <label className="upload-label">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={handleFileChange}
                className="file-input"
              />
              <div className="upload-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p>Click to upload or drag and drop</p>
                <p className="upload-hint">JPG, PNG or PDF (Max 5MB)</p>
              </div>
            </label>
          ) : (
            <div className="file-preview">
              {receiptPreview ? (
                <div className="image-preview">
                  <img src={receiptPreview} alt="Receipt preview" />
                  <button type="button" className="remove-file" onClick={handleRemoveFile}>
                    Remove
                  </button>
                </div>
              ) : (
                <div className="file-info">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <div className="file-details">
                    <p className="file-name">{receiptFile.name}</p>
                    <p className="file-size">{(receiptFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <button type="button" className="remove-file" onClick={handleRemoveFile}>
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="bank-transfer-actions">
        <button
          type="button"
          className="proceed-button"
          onClick={handleProceed}
          disabled={!receiptFile || isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Proceed with Bank Transfer'}
        </button>
        <p className="processing-note">
          Your application will be reviewed and activated after payment verification.
        </p>
      </div>
    </div>
  )
}

export default BankTransfer


