import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './SetPassword.css'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const t = searchParams.get('token')
    const e = searchParams.get('email')
    setToken(t || '')
    setFormData(prev => ({ ...prev, email: e || '' }))
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!token || !formData.email) {
      setError('Invalid reset link. Please use the link from your email or request a new one.')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const result = await authAPI.resetPassword(token, formData.email.trim(), formData.password)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Your password has been reset. Please sign in with your new password.' },
          })
        }, 3000)
      } else {
        setError(result.error || 'Failed to reset password. Please try again.')
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again or contact support.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  if (success) {
    return (
      <div className="set-password-page">
        <Header />
        <div className="set-password-container">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Password Reset Successfully</h2>
            <p>You can now sign in with your new password.</p>
            <p className="redirect-message">Redirecting to login...</p>
            <button type="button" className="btn-login-now" onClick={() => navigate('/login')}>
              Go to Login
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!token) {
    return (
      <div className="set-password-page">
        <Header />
        <div className="set-password-container">
          <div className="set-password-card">
            <div className="set-password-header">
              <h1>Invalid Reset Link</h1>
              <p>This link is missing or invalid. Please request a new password reset from the login page.</p>
            </div>
            <div className="set-password-footer">
              <Link to="/forgot-password" className="btn-submit" style={{ display: 'inline-block', textAlign: 'center' }}>
                Request New Link
              </Link>
              <p style={{ marginTop: '1rem' }}>
                <Link to="/login">Back to Login</Link>
              </p>
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
            <h1>Set New Password</h1>
            <p>Choose a secure password for your account.</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="set-password-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
                disabled={!!searchParams.get('email')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                required
                minLength={6}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                required
                minLength={6}
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="set-password-footer">
            <p>
              <Link to="/login">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ResetPassword
