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
        // Get user from context if not in result
        const userId = result.user?.id || user?.id
        if (!userId) {
          setError('Registration successful but user ID not found. Please try logging in.')
          setLoading(false)
          return
        }
        
        // Create payment session and redirect to payment gateway
        try {
          const paymentResult = await paymentAPI.createSession(
            userId,
            formData.membershipType
          )
          if (paymentResult.success && paymentResult.url) {
            // Redirect to Stripe checkout
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
      <div className="register-container">
        <div className="register-card">
          <h1>Join Wish Waves Club</h1>
          <p className="register-subtitle">Create your account to get started</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="form-input"
                required
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
                required
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label>Membership Type</label>
              <select
                value={formData.membershipType}
                onChange={(e) => setFormData({ ...formData, membershipType: e.target.value })}
                className="form-input"
              >
                <option value="annual">Annual</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="form-input"
                required
                placeholder="At least 6 characters"
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="form-input"
                required
                placeholder="Confirm your password"
                minLength={6}
              />
            </div>

            <button type="submit" className="register-button" disabled={loading}>
              {loading ? 'Redirecting to Payment...' : 'Create Account & Pay'}
            </button>
          </form>

          <div className="register-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Register

