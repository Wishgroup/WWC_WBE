import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading, allowed, nextAction } = useAuth()

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
    return <Navigate to="/login" replace />
  }

  // Check role match
  if (requiredRole && user?.role !== requiredRole) {
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

  // Check if account is active (for member/vendor routes)
  // Admins are always allowed if authenticated
  if ((requiredRole === 'member' || requiredRole === 'vendor') && !allowed && nextAction) {
    return <Navigate to={nextAction} replace />
  }

  return children
}

export default ProtectedRoute

