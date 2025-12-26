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

  // Redirect if already authenticated (this will fire after login sets the user state)
  useEffect(() => {
    if (isAuthenticated && user) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cfe73359-2dd7-4cb3-884a-a3bdccf851f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Login.jsx:20',message:'useEffect redirect triggered',data:{isAuthenticated,userRole:user.role,path:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      console.log('[DEBUG] useEffect redirect - authenticated:', { isAuthenticated, userRole: user.role });
      // #endregion
      const role = user.role
      let targetPath = '/member/dashboard'
      if (role === 'admin') {
        targetPath = '/admin/dashboard'
      } else if (role === 'vendor') {
        targetPath = '/vendor/dashboard'
      }
      console.log('[DEBUG] useEffect navigating to:', targetPath);
      navigate(targetPath, { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cfe73359-2dd7-4cb3-884a-a3bdccf851f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Login.jsx:33',message:'handleSubmit called',data:{email:formData.email,userType:formData.userType},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    console.log('[DEBUG] handleSubmit called with:', { email: formData.email, userType: formData.userType });
    // #endregion

    try {
      const result = await login(formData.email, formData.password, formData.userType)
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cfe73359-2dd7-4cb3-884a-a3bdccf851f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Login.jsx:40',message:'login result received',data:{success:result?.success,hasUser:!!result?.user,userRole:result?.user?.role,resultKeys:Object.keys(result||{})},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
      console.log('[DEBUG] Login result:', result);
      // #endregion
      
      if (result && result.success) {
        // Get role from result.user or use formData.userType as fallback
        const role = result.user?.role || formData.userType
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/cfe73359-2dd7-4cb3-884a-a3bdccf851f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Login.jsx:45',message:'Before navigate',data:{role,resultUser:result.user,willNavigate:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,C'})}).catch(()=>{});
        console.log('[DEBUG] Role determined:', role);
        // #endregion
        
        // Don't navigate here - let the useEffect handle it when state updates
        // This ensures ProtectedRoute sees the updated auth state
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/cfe73359-2dd7-4cb3-884a-a3bdccf851f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Login.jsx:52',message:'Login successful, waiting for useEffect redirect',data:{role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        console.log('[DEBUG] Login successful, useEffect will handle redirect for role:', role);
        // #endregion
        setLoading(false) // Stop loading, useEffect will redirect
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/cfe73359-2dd7-4cb3-884a-a3bdccf851f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Login.jsx:58',message:'Login failed',data:{error:result?.error,success:result?.success},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        console.log('[DEBUG] Login failed:', result);
        // #endregion
        setError(result?.error || 'Login failed')
        setLoading(false)
      }
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cfe73359-2dd7-4cb3-884a-a3bdccf851f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Login.jsx:63',message:'Exception caught',data:{error:err?.message,errorStack:err?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      console.error('[DEBUG] Login exception:', err);
      // #endregion
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <Header />
      <div className="login-container">
        <div className="login-card">
          <h1>Welcome Back</h1>
          <p className="login-subtitle">Sign in to your account</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Account Type</label>
              <select
                value={formData.userType}
                onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                className="form-input"
              >
                <option value="member">Member</option>
                <option value="vendor">Vendor</option>
                <option value="admin">Admin</option>
              </select>
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
              <label>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="form-input"
                required
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

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

