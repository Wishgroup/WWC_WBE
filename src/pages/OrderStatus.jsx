import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { paymentAPI } from '../services/api'
import './OrderStatus.css'

const OrderStatus = () => {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderData, setOrderData] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setOrderData(null)

    if (!orderId.trim()) {
      setError('Please enter an Order ID')
      return
    }

    setLoading(true)
    try {
      // Try to get order status by order ID
      const result = await paymentAPI.getOrderStatus(orderId.trim())
      
      if (result.success) {
        setOrderData(result)
      } else {
        setError(result.error || 'Order not found. Please check your Order ID and try again.')
      }
    } catch (err) {
      console.error('Order status error:', err)
      setError(err.message || 'Failed to fetch order status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || ''
    if (statusLower.includes('completed') || statusLower.includes('paid') || statusLower.includes('verified')) {
      return '#4caf50'
    }
    if (statusLower.includes('pending')) {
      return '#ff9800'
    }
    if (statusLower.includes('failed') || statusLower.includes('rejected')) {
      return '#f44336'
    }
    return '#666'
  }

  const getStatusLabel = (status) => {
    if (!status) return 'Unknown'
    const statusLower = status.toLowerCase()
    if (statusLower.includes('completed') || statusLower.includes('paid')) return 'Paid'
    if (statusLower.includes('verified')) return 'Verified'
    if (statusLower.includes('pending')) return 'Pending'
    if (statusLower.includes('failed')) return 'Failed'
    if (statusLower.includes('rejected')) return 'Rejected'
    return status
  }

  return (
    <div className="order-status-page">
      <Header />
      <div className="order-status-container">
        <div className="order-status-content">
          <div className="order-status-header">
            <h1>Order Status</h1>
            <p>Check the status of your membership application, payment, or card issuance</p>
          </div>

          <form onSubmit={handleSubmit} className="order-status-form">
            <div className="form-group">
              <label htmlFor="orderId">Order ID</label>
              <input
                type="text"
                id="orderId"
                value={orderId}
                onChange={(e) => {
                  setOrderId(e.target.value)
                  setError('')
                  setOrderData(null)
                }}
                placeholder="Enter your Order ID"
                required
                disabled={loading}
                className="form-input"
              />
              <small className="form-help">
                You can find your Order ID in the confirmation email we sent you
              </small>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading || !orderId.trim()}
            >
              {loading ? 'Checking...' : 'Check Status'}
            </button>
          </form>

          {orderData && (
            <div className="order-status-result">
              <div className="status-card">
                <div className="status-header">
                  <h2>Order Details</h2>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(orderData.status) }}
                  >
                    {getStatusLabel(orderData.status)}
                  </span>
                </div>

                <div className="status-details">
                  <div className="detail-row">
                    <span className="detail-label">Order ID:</span>
                    <span className="detail-value">{orderData.orderId || orderId}</span>
                  </div>

                  {orderData.email && (
                    <div className="detail-row">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{orderData.email}</span>
                    </div>
                  )}

                  {orderData.member_name && (
                    <div className="detail-row">
                      <span className="detail-label">Member Name:</span>
                      <span className="detail-value">{orderData.member_name}</span>
                    </div>
                  )}

                  {orderData.amount && (
                    <div className="detail-row">
                      <span className="detail-label">Amount:</span>
                      <span className="detail-value">
                        ${orderData.amount} {orderData.currency || 'USD'}
                      </span>
                    </div>
                  )}

                  {orderData.membershipType && (
                    <div className="detail-row">
                      <span className="detail-label">Membership Type:</span>
                      <span className="detail-value">
                        {orderData.membershipType.charAt(0).toUpperCase() + orderData.membershipType.slice(1)}
                      </span>
                    </div>
                  )}

                  {orderData.uploadDate && (
                    <div className="detail-row">
                      <span className="detail-label">Receipt Uploaded:</span>
                      <span className="detail-value">{formatDate(orderData.uploadDate)}</span>
                    </div>
                  )}

                  {orderData.reviewDate && (
                    <div className="detail-row">
                      <span className="detail-label">Reviewed:</span>
                      <span className="detail-value">{formatDate(orderData.reviewDate)}</span>
                    </div>
                  )}

                  {orderData.adminNotes && (
                    <div className="detail-row">
                      <span className="detail-label">Admin Notes:</span>
                      <span className="detail-value">{orderData.adminNotes}</span>
                    </div>
                  )}

                  {orderData.message && (
                    <div className="status-message">
                      <p>{orderData.message}</p>
                    </div>
                  )}
                </div>

                {orderData.status === 'pending_bank_transfer' && !orderData.receiptUploaded && (
                  <div className="status-action">
                    <Link to="/payment/bank-transfer" className="btn-action">
                      Upload Receipt
                    </Link>
                  </div>
                )}

                {orderData.receiptUploaded && orderData.status === 'pending' && (
                  <div className="status-message info">
                    <p>Your receipt has been uploaded and is pending admin review. We'll notify you once it's verified.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="order-status-help">
            <h3>Need Help?</h3>
            <p>If you can't find your order or have questions about your order status:</p>
            <ul>
              <li>Check your email for the confirmation message with your Order ID</li>
              <li>Log in to your <Link to="/member/dashboard">Member Dashboard</Link> to view all your orders</li>
              <li>Contact our <Link to="/support">Support Team</Link> for assistance</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default OrderStatus
