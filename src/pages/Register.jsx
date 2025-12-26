import React, { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Register.css'

const Register = () => {
  const { register, user, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const role = user.role
      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      } else if (role === 'vendor') {
        navigate('/vendor/dashboard', { replace: true })
      } else if (role === 'member') {
        navigate('/member/dashboard', { replace: true })
      }
    }
  }, [isAuthenticated, user, loading, navigate])

  const handleRegister = async () => {
    try {
      await register()
    } catch (error) {
      console.error('Registration error:', error)
    }
  }

  if (loading) {
    return (
      <div className="register-page">
        <Header />
        <div className="register-container">
          <div className="register-card">
            <p>Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="register-page">
      <Header />
      <div className="register-container">
        <div className="register-card">
          <h1>Join Wish Waves Club</h1>
          <p className="register-subtitle">Create your account to get started</p>
          <p className="register-info">
            Click the button below to sign up with Auth0. You'll be able to set up your account details after registration.
          </p>

          <button
            onClick={handleRegister}
            className="register-button auth0-button"
          >
            Sign Up with Auth0
          </button>

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
