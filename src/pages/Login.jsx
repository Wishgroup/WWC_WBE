import React, { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Login.css'

const Login = () => {
  const { login, user, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const role = user.role
      let targetPath = '/member/dashboard'
      if (role === 'admin') {
        targetPath = '/admin/dashboard'
      } else if (role === 'vendor') {
        targetPath = '/vendor/dashboard'
      }
      navigate(targetPath, { replace: true })
    }
  }, [isAuthenticated, user, loading, navigate])

  const handleLogin = async (userType = 'member') => {
    console.log('Login button clicked for userType:', userType)
    try {
      const result = await login({ userType })
      if (result && !result.success) {
        console.error('Login failed:', result.error)
        alert(`Login failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Login error:', error)
      alert(`Login error: ${error.message || 'Unknown error'}`)
    }
  }

  if (loading) {
    return (
      <div className="login-page">
        <Header />
        <div className="login-container">
          <div className="login-card">
            <p>Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="login-page">
      <Header />
      <div className="login-container">
        <div className="login-card">
          <h1>Welcome Back</h1>
          <p className="login-subtitle">Sign in to your account</p>

          <div className="auth0-login-options">
            <button
              onClick={() => handleLogin('member')}
              className="login-button auth0-button"
            >
              Sign In as Member
            </button>

            <button
              onClick={() => handleLogin('vendor')}
              className="login-button auth0-button vendor-button"
            >
              Sign In as Vendor
            </button>

            <button
              onClick={() => handleLogin('admin')}
              className="login-button auth0-button admin-button"
            >
              Sign In as Admin
            </button>
          </div>

          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="link">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Login
