import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { paymentAPI } from '../services/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './BankTransferReceipt.css'

const BankTransferReceipt = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // Check if there's a success message from navigation
    if (location.state?.message) {
      setSuccess(location.state.message)
    }

    // Fetch current receipt status
    fetchReceiptStatus()
  }, [orderId, location.state])

  const fetchReceiptStatus = async () => {
    try {
      const result = await paymentAPI.getReceiptStatus(orderId)
      if (result.success) {
        setStatus(result.status)
        if (result.adminNotes) {
          setError(result.adminNotes)
        }
      }
    } catch (err) {
      console.error('Error fetching receipt status:', err)
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Invalid file type. Please upload an image (JPEG, PNG, GIF) or PDF file.')
        return
      }

      // Validate file size (10MB)
      const maxSize = 10 * 1024 * 1024
      if (selectedFile.size > maxSize) {
        setError('File size too large. Maximum size is 10MB.')
        return
      }

      setFile(selectedFile)
      setError('')

      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result)
        }
        reader.readAsDataURL(selectedFile)
      } else {
        setPreview(null)
      }
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      const fakeEvent = {
        target: {
          files: [droppedFile]
        }
      }
      handleFileChange(fakeEvent)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const result = await paymentAPI.uploadReceipt(orderId, file)
      if (result.success) {
        setSuccess('Receipt uploaded successfully! It will be reviewed by our team.')
        setStatus('pending')
        setFile(null)
        setPreview(null)
        // Refresh status after a moment
        setTimeout(() => {
          fetchReceiptStatus()
        }, 1000)
      } else {
        setError(result.error || 'Failed to upload receipt. Please try again.')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload receipt. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const getStatusDisplay = () => {
    switch (status) {
      case 'pending':
        return { text: 'Pending Review', color: '#ffc107', icon: '⏳' }
      case 'under_review':
        return { text: 'Under Review', color: '#0d6efd', icon: '👀' }
      case 'approved':
        return { text: 'Approved', color: '#198754', icon: '✅' }
      case 'rejected':
        return { text: 'Rejected', color: '#dc3545', icon: '❌' }
      default:
        return null
    }
  }

  const statusDisplay = getStatusDisplay()

  return (
    <div className="bank-transfer-receipt-page">
      <Header />
      <div className="receipt-upload-container">
        <div className="receipt-upload-card">
          <div className="receipt-upload-header">
            <h1>Upload Payment Receipt</h1>
            <p className="order-id">Order ID: {orderId}</p>
          </div>

          {statusDisplay && (
            <div className="status-badge" style={{ backgroundColor: `${statusDisplay.color}20`, color: statusDisplay.color, borderColor: statusDisplay.color }}>
              <span className="status-icon">{statusDisplay.icon}</span>
              <span className="status-text">{statusDisplay.text}</span>
            </div>
          )}

          {success && (
            <div className="success-alert">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6.66667 10L9.16667 12.5L13.3333 8.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="error-alert">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 6.66667V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M10 13.3333H10.0083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {status === 'approved' ? (
            <div className="approval-message">
              <div className="approval-icon">✅</div>
              <h2>Receipt Approved!</h2>
              <p>Your payment has been verified and your membership is now active.</p>
              <button 
                className="btn-primary" 
                onClick={() => navigate('/member/dashboard')}
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <>
              <div className="instructions-section">
                <h3>Instructions</h3>
                <ol>
                  <li>Complete the bank transfer using the account details sent to your email</li>
                  <li>Take a clear photo or scan of your payment receipt</li>
                  <li>Upload the receipt below (JPEG, PNG, GIF, or PDF - Max 10MB)</li>
                  <li>Our team will review your receipt and activate your membership</li>
                </ol>
              </div>

              <div 
                className={`file-upload-area ${file ? 'has-file' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  type="file"
                  id="receipt-upload"
                  accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="receipt-upload" className="upload-label">
                  {preview ? (
                    <div className="preview-container">
                      <img src={preview} alt="Receipt preview" className="preview-image" />
                      <div className="preview-overlay">
                        <span>Click to change</span>
                      </div>
                    </div>
                  ) : file ? (
                    <div className="file-info">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                      </svg>
                      <div>
                        <div className="file-name">{file.name}</div>
                        <div className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <p className="upload-text">Drag & drop your receipt here</p>
                      <p className="upload-subtext">or click to browse</p>
                      <p className="upload-hint">Supports: JPEG, PNG, GIF, PDF (Max 10MB)</p>
                    </div>
                  )}
                </label>
              </div>

              <div className="upload-actions">
                <button
                  className="btn-primary"
                  onClick={handleUpload}
                  disabled={!file || uploading || status === 'approved'}
                >
                  {uploading ? (
                    <>
                      <svg className="spinner" width="20" height="20" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="50" strokeDashoffset="25">
                          <animate attributeName="stroke-dasharray" dur="1.5s" values="0 50;50 0;0 50" repeatCount="indefinite" />
                        </circle>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    'Upload Receipt'
                  )}
                </button>
                {file && (
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setFile(null)
                      setPreview(null)
                      setError('')
                    }}
                    disabled={uploading}
                  >
                    Clear
                  </button>
                )}
              </div>
            </>
          )}

          {status === 'rejected' && (
            <div className="rejection-info">
              <h4>Receipt Rejected</h4>
              <p>Please review the notes above and upload a new receipt that meets our requirements.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default BankTransferReceipt
