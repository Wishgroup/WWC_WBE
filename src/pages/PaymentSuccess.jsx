import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { paymentAPI } from '../services/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './PaymentSuccess.css'

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [paymentStatus, setPaymentStatus] = useState('verifying')
  const [error, setError] = useState('')
  const sessionId = searchParams.get('session_id')
  const orderId = searchParams.get('order_id')
  const encResponse = searchParams.get('encResponse') || searchParams.get('encResp')

  useEffect(() => {
    const verifyPayment = async () => {
      // Handle CC Avenue payment response
      if (encResponse) {
        try {
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
          const response = await fetch(`${API_BASE_URL}/api/payment/ccavenue/response`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ encResponse }),
          })

          const result = await response.json()
          
          if (result.success && result.orderStatus === 'Success') {
            setPaymentStatus('success')
            setTimeout(() => {
              navigate('/member/dashboard', { replace: true })
            }, 5000)
          } else {
            setPaymentStatus('error')
            setError(result.orderStatus === 'Failure' ? 'Payment failed. Please try again.' : 'Payment verification failed.')
          }
        } catch (err) {
          console.error('CC Avenue payment verification error:', err)
          setError('Failed to verify payment. Please contact support.')
          setPaymentStatus('error')
        }
        return
      }

      // Handle Stripe payment (legacy)
      if (!sessionId && !orderId) {
        // Check if we're on a failed page
        if (window.location.pathname.includes('/failed')) {
          setPaymentStatus('error')
          setError('Payment was not completed. Please try again.')
          return
        }
        setError('No payment session found')
        setPaymentStatus('error')
        return
      }

      try {
        const idToVerify = sessionId || orderId
        const result = await paymentAPI.verifyPayment(idToVerify)
        if (result.success && result.paid) {
          setPaymentStatus('success')
          // Redirect to member dashboard after 5 seconds
          setTimeout(() => {
            navigate('/member/dashboard', { replace: true })
          }, 5000)
        } else {
          setPaymentStatus('pending')
        }
      } catch (err) {
        console.error('Payment verification error:', err)
        setError('Failed to verify payment. Please contact support.')
        setPaymentStatus('error')
      }
    }

    verifyPayment()
  }, [sessionId, orderId, encResponse, navigate])

  return (
    <div className="payment-success-page">
      <Header />
      <div className="payment-success-container">
        <div className="payment-success-card">
          {paymentStatus === 'verifying' && (
            <div className="payment-status verifying">
              <div className="spinner"></div>
              <h1>Verifying Payment...</h1>
              <p>Please wait while we confirm your payment.</p>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="payment-status success">
              <div className="success-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h1>Payment Received!</h1>
              <div className="welcome-message">
                <h2>Welcome to the Oceanic Lifestyle</h2>
                <p>
                  Your membership has been successfully activated. We're thrilled to have you join the Wish Waves Club family!
                </p>
                <p>
                  A confirmation email has been sent to your inbox with all the details about your membership.
                </p>
              </div>
              <div className="success-actions">
                <button 
                  className="dashboard-button"
                  onClick={() => navigate('/member/dashboard', { replace: true })}
                >
                  Go to Dashboard
                </button>
                <p className="redirect-notice">Redirecting automatically in a few seconds...</p>
              </div>
            </div>
          )}

          {paymentStatus === 'pending' && (
            <div className="payment-status pending">
              <div className="pending-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h1>Payment Processing</h1>
              <p>Your payment is being processed. This may take a few moments.</p>
              <p>You will receive a confirmation email once your payment is confirmed.</p>
            </div>
          )}

          {paymentStatus === 'error' && (
            <div className="payment-status error">
              <div className="error-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h1>Payment Verification Failed</h1>
              <p>{error || 'There was an issue verifying your payment.'}</p>
              <div className="error-actions">
                <button 
                  className="contact-button"
                  onClick={() => window.location.href = 'mailto:info@wishgroup.ae'}
                >
                  Contact Support
                </button>
                <button 
                  className="back-button"
                  onClick={() => navigate('/join', { replace: true })}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default PaymentSuccess

