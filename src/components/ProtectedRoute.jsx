import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth()

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/cfe73359-2dd7-4cb3-884a-a3bdccf851f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.jsx:5',message:'ProtectedRoute render',data:{loading,isAuthenticated,userRole:user?.role,requiredRole,path:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C,E'})}).catch(()=>{});
  console.log('[DEBUG] ProtectedRoute render:', { loading, isAuthenticated, userRole: user?.role, requiredRole, path: window.location.pathname });
  // #endregion

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: 'var(--text-secondary)'
      }}>
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cfe73359-2dd7-4cb3-884a-a3bdccf851f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.jsx:24',message:'Redirecting to login - not authenticated',data:{path:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C,E'})}).catch(()=>{});
    // #endregion
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cfe73359-2dd7-4cb3-884a-a3bdccf851f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.jsx:28',message:'Role mismatch redirect',data:{userRole:user?.role,requiredRole,path:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C,E'})}).catch(()=>{});
    // #endregion
    // Redirect to appropriate dashboard based on user role
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    } else if (user?.role === 'vendor') {
      return <Navigate to="/vendor/dashboard" replace />
    } else if (user?.role === 'member') {
      return <Navigate to="/member/dashboard" replace />
    }
    return <Navigate to="/" replace />
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/cfe73359-2dd7-4cb3-884a-a3bdccf851f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.jsx:39',message:'Access granted',data:{userRole:user?.role,requiredRole,path:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  return children
}

export default ProtectedRoute

