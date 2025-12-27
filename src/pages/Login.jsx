import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Login.css'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'member',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role
      let targetPath = '/member/dashboard'
      if (role === 'admin') {
        targetPath = '/admin/dashboard'
      } else if (role === 'vendor') {
        targetPath = '/vendor/dashboard'
      }
      navigate(targetPath, { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(formData.email, formData.password, formData.userType)
      
      if (result && result.success) {
        setLoading(false)
      } else {
        setError(result?.error || 'Login failed')
        setLoading(false)
      }
    } catch (err) {
      console.error('Login exception:', err)
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <Header />
      <div className="login-wrapper">
        <div className="login-container">
          <div className="login-left">
            <div className="login-image-wrapper">
              <img 
                src="/assets/Login/login.png" 
                alt="Welcome to Wish Waves Club" 
                className="login-image"
              />
            </div>
          </div>

          <div className="login-right">
            <div className="login-card">
              <div className="login-card-header">
                <h2>Sign In</h2>
                <p>Enter your credentials to continue</p>
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

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="userType">Account Type</label>
                  <select
                    id="userType"
                    value={formData.userType}
                    onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                    className="form-select"
                  >
                    <option value="member">Member</option>
                    <option value="vendor">Vendor</option>
                    <option value="admin">Admin</option>
                  </select>
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
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                <div className="form-options">
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <Link to="#" className="forgot-link">Forgot password?</Link>
                </div>

                <button type="submit" className="login-button" disabled={loading}>
                  {loading ? (
                    <>
                      <svg className="spinner" width="20" height="20" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="50" strokeDashoffset="25">
                          <animate attributeName="stroke-dasharray" dur="1.5s" values="0 50;50 0;0 50" repeatCount="indefinite" />
                        </circle>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="login-divider">
                <span>Or</span>
              </div>

              <div className="login-footer">
                <p>
                  Don't have an account?{' '}
                  <Link to="/register" className="signup-link">
                    Sign up for free
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

export default Login
