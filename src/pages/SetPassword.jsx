import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authAPI } from '../services/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './SetPassword.css'

const SetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Get email from URL parameter
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: emailParam }))
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const result = await authAPI.setPassword(formData.email, formData.password)
      
      if (result.success) {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Password set successfully! Please login with your email and password.' 
            } 
          })
        }, 3000)
      } else {
        setError(result.error || 'Failed to set password. Please try again.')
      }
    } catch (err) {
      console.error('Set password error:', err)
      setError(err.message || 'Failed to set password. Please try again or contact support.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('') // Clear error when user types
  }

  if (success) {
    return (
      <div className="set-password-page">
        <Header />
        <div className="set-password-container">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Password Set Successfully!</h2>
            <p>Your password has been set. You can now login to your member dashboard.</p>
            <p className="redirect-message">Redirecting to login page...</p>
            <button 
              className="btn-login-now"
              onClick={() => navigate('/login')}
            >
              Login Now
            </button>
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
            <h1>Set Your Password</h1>
            <p>Create a secure password to access your member dashboard</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="set-password-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
                disabled={loading || !!searchParams.get('email')}
              />
              {searchParams.get('email') && (
                <p className="form-hint">Email from verification link</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password (min. 6 characters)"
                required
                minLength={6}
                disabled={loading}
              />
              <p className="form-hint">Password must be at least 6 characters long</p>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Setting Password...' : 'Set Password'}
            </button>
          </form>

          <div className="set-password-footer">
            <p>
              Already have a password?{' '}
              <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login') }}>
                Login here
              </a>
            </p>
            <p>
              Need help?{' '}
              <a href="/support" onClick={(e) => { e.preventDefault(); navigate('/support') }}>
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default SetPassword



