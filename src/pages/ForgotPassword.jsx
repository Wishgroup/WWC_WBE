import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './SetPassword.css'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const trimmed = email.trim()
    if (!trimmed) {
      setError('Please enter your email address')
      setLoading(false)
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const result = await authAPI.forgotPassword(trimmed)
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || 'Something went wrong. Please try again.')
      }
    } catch (err) {
      setError(err.message || 'Unable to send reset link. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="set-password-page">
        <Header />
        <div className="set-password-container">
          <div className="set-password-card">
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>Check Your Email</h2>
              <p>If an account exists with that email, we've sent you a link to reset your password.</p>
              <p className="redirect-message">The link expires in 1 hour. Didn't receive it? Check spam or request again.</p>
              <button
                type="button"
                className="btn-login-now"
                onClick={() => navigate('/forgot-password')}
              >
                Send Another Link
              </button>
              <button
                type="button"
                className="btn-login-now"
                style={{ marginTop: '0.75rem', background: '#555' }}
                onClick={() => navigate('/login')}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="set-password-page">
      <Header />
      <div className="set-password-container">
        <div className="set-password-card">
          <div className="set-password-header">
            <h1>Forgot Password?</h1>
            <p>Enter your account email and we'll send you a link to reset your password.</p>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="set-password-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="your.email@example.com"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="set-password-footer">
            <p>
              Remember your password?{' '}
              <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ForgotPassword
