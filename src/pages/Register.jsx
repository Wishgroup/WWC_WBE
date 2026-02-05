import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { paymentAPI } from '../services/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Register.css'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    membershipType: 'annual',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role
      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      } else if (role === 'vendor') {
        navigate('/vendor/dashboard', { replace: true })
      } else if (role === 'member') {
        navigate('/member/dashboard', { replace: true })
      }
    }
  }, [isAuthenticated, user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const result = await register(
        formData.email,
        formData.password,
        formData.fullName,
        formData.membershipType
      )
      if (result.success) {
        // Navigate to membership form to collect additional details
        navigate('/join', { 
          state: { 
            email: formData.email,
            membershipType: formData.membershipType,
            userId: result.user?.id 
          } 
        })
      } else {
        setError(result.error || 'Registration failed')
        setLoading(false)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <Header />
      <div className="register-wrapper">
        <div className="register-container">
          <div className="register-left">
            <div className="register-branding">
              <div className="brand-logo">
                <img src="/assets/Logos/WWC.png" alt="Wish Waves Club" />
              </div>
              <h1 className="brand-title">Join Wish Waves Club</h1>
              <p className="brand-subtitle">
                Become a member and unlock exclusive benefits, premium access, and unforgettable experiences that last a lifetime
              </p>
              <div className="brand-features">
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                      <path d="M2 17L12 22L22 17" />
                      <path d="M2 12L12 17L22 12" />
                    </svg>
                  </div>
                  <div className="feature-content">
                    <h3>Exclusive Benefits</h3>
                    <p>Access to premium services and exclusive member-only offers</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" />
                      <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" />
                      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" />
                      <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" />
                    </svg>
                  </div>
                  <div className="feature-content">
                    <h3>Premium Events</h3>
                    <p>Invitations to exclusive events and destination experiences</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </div>
                  <div className="feature-content">
                    <h3>Lifetime Value</h3>
                    <p>Choose between annual or lifetime membership options</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                      <path d="M12 8V12L15 15" />
                    </svg>
                  </div>
                  <div className="feature-content">
                    <h3>Secure & Trusted</h3>
                    <p>Your information is protected with industry-leading security</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="register-right">
            <div className="register-card">
              <div className="register-card-header">
                <h2>Create Account</h2>
                <p>Get started with your membership today</p>
              </div>

              {error && (
                <div className="error-alert">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 6.66667V10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 13.3333H10.0083"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <div className="input-wrapper">
                    <input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="form-input"
                      required
                      placeholder="Enter Full Name"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                      required
                      placeholder="name@company.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="membershipType">Membership Type</label>
                  <div className="input-wrapper">
                    <select
                      id="membershipType"
                      value={formData.membershipType}
                      onChange={(e) => setFormData({ ...formData, membershipType: e.target.value })}
                      className="form-select"
                    >
                      <option value="annual">Annual Membership</option>
                      <option value="lifetime">Lifetime Membership</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-wrapper">
                    <input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="form-input"
                      required
                      placeholder="At least 6 characters"
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="input-wrapper">
                    <input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="form-input"
                      required
                      placeholder="Confirm your password"
                      minLength={6}
                    />
                  </div>
                </div>

                <button type="submit" className="register-button" disabled={loading}>
                  {loading ? (
                    <>
                      <svg className="spinner" width="20" height="20" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="50" strokeDashoffset="25">
                          <animate attributeName="stroke-dasharray" dur="1.5s" values="0 50;50 0;0 50" repeatCount="indefinite" />
                        </circle>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Create Account & Continue'
                  )}
                </button>
              </form>

              <div className="register-divider">
                <span>Or</span>
              </div>

              <div className="register-footer">
                <p>
                  Already have an account?{' '}
                  <Link to="/login" className="signin-link">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Register
