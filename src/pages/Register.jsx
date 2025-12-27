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
        const userId = result.user?.id || user?.id
        if (!userId) {
          setError('Registration successful but user ID not found. Please try logging in.')
          setLoading(false)
          return
        }
        
        try {
          const paymentResult = await paymentAPI.createSession(
            userId,
            formData.membershipType
          )
          if (paymentResult.success && paymentResult.url) {
            window.location.href = paymentResult.url
          } else {
            setError('Failed to create payment session. Please try again.')
            setLoading(false)
          }
        } catch (paymentError) {
          console.error('Payment session error:', paymentError)
          setError('Failed to initialize payment. Please try again.')
          setLoading(false)
        }
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
                Start your journey today and unlock exclusive benefits, premium access, and unforgettable experiences
              </p>
              <div className="brand-features">
                <div className="feature-item">
                  <div className="feature-icon">🎁</div>
                  <span>Exclusive Member Benefits</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🌟</div>
                  <span>Premium Access & Events</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">💎</div>
                  <span>Lifetime Value</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🔐</div>
                  <span>Secure & Trusted</span>
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
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M10 10C12.3012 10 14.1667 8.13452 14.1667 5.83333C14.1667 3.53215 12.3012 1.66667 10 1.66667C7.69881 1.66667 5.83333 3.53215 5.83333 5.83333C5.83333 8.13452 7.69881 10 10 10Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M17.5 18.3333C17.5 15.1083 14.1417 12.5 10 12.5C5.85833 12.5 2.5 15.1083 2.5 18.3333"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="form-input"
                      required
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M2.5 6.66667L9.0755 11.0504C9.63533 11.4236 10.3647 11.4236 10.9245 11.0504L17.5 6.66667M4.16667 15.8333H15.8333C16.7538 15.8333 17.5 15.0872 17.5 14.1667V5.83333C17.5 4.91286 16.7538 4.16667 15.8333 4.16667H4.16667C3.24619 4.16667 2.5 4.91286 2.5 5.83333V14.1667C2.5 15.0872 3.24619 15.8333 4.16667 15.8333Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 6.66667V10L12.5 12.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M15.8333 9.16667H4.16667C3.24619 9.16667 2.5 9.91286 2.5 10.8333V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333V10.8333C17.5 9.91286 16.7538 9.16667 15.8333 9.16667Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5.83333 9.16667V5.83333C5.83333 4.72826 6.27232 3.66846 7.05372 2.88706C7.83512 2.10565 8.89493 1.66667 10 1.66667C11.1051 1.66667 12.1649 2.10565 12.9463 2.88706C13.7277 3.66846 14.1667 4.72826 14.1667 5.83333V9.16667"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M15.8333 9.16667H4.16667C3.24619 9.16667 2.5 9.91286 2.5 10.8333V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333V10.8333C17.5 9.91286 16.7538 9.16667 15.8333 9.16667Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5.83333 9.16667V5.83333C5.83333 4.72826 6.27232 3.66846 7.05372 2.88706C7.83512 2.10565 8.89493 1.66667 10 1.66667C11.1051 1.66667 12.1649 2.10565 12.9463 2.88706C13.7277 3.66846 14.1667 4.72826 14.1667 5.83333V9.16667"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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
                    'Create Account & Continue to Payment'
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
