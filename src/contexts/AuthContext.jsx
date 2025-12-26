import React, { createContext, useState, useEffect, useContext, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { authAPI, setTokenGetter } from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const { 
    user: auth0User, 
    isAuthenticated: auth0IsAuthenticated, 
    isLoading: auth0Loading,
    getAccessTokenSilently,
    loginWithRedirect,
    logout: auth0Logout,
  } = useAuth0()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  // Sync Auth0 user with backend database
  useEffect(() => {
    const syncUser = async () => {
      if (auth0Loading) {
        setLoading(true)
        return
      }

      if (!auth0IsAuthenticated || !auth0User) {
        setUser(null)
        setLoading(false)
        return
      }

      // User is authenticated with Auth0, sync with backend
      setSyncing(true)
      try {
        const data = await authAPI.syncUser()
        if (data.success && data.user) {
          setUser(data.user)
        } else {
          console.error('Failed to sync user:', data.error)
          setUser(null)
        }
      } catch (error) {
        console.error('Error syncing user:', error)
        // Try to get user info anyway
        try {
          const userData = await authAPI.getCurrentUser()
          if (userData.success && userData.user) {
            setUser(userData.user)
          }
        } catch (err) {
          console.error('Error fetching user:', err)
          setUser(null)
        }
      } finally {
        setSyncing(false)
        setLoading(false)
      }
    }

    syncUser()
  }, [auth0IsAuthenticated, auth0User, auth0Loading])

  const login = async (options = {}) => {
    try {
      console.log('Attempting Auth0 login with options:', options)
      console.log('Auth0Provider ready:', !!loginWithRedirect)
      
      await loginWithRedirect({
        authorizationParams: {
          screen_hint: options.userType === 'admin' ? 'login' : 'signup',
        },
        appState: {
          returnTo: window.location.pathname,
          userType: options.userType || 'member',
        },
      })
      
      console.log('loginWithRedirect called successfully')
    } catch (error) {
      console.error('Login error details:', {
        error,
        message: error.message,
        stack: error.stack,
      })
      alert(`Login error: ${error.message || 'Failed to redirect to Auth0. Please check the browser console for details.'}`)
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  const register = async (options = {}) => {
    try {
      await loginWithRedirect({
        ...options,
        screen_hint: 'signup',
      })
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: error.message || 'Registration failed' }
    }
  }

  const logout = async () => {
    try {
      // Call backend logout endpoint for audit logging
      try {
        await authAPI.logout()
      } catch (error) {
        // Don't fail logout if backend call fails
        console.error('Backend logout error:', error)
      }
      
      // Clear local state
      setUser(null)
      localStorage.removeItem('admin_api_key')
      
      // Clear Auth0 cache from localStorage
      const auth0CacheKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('@@auth0spajs@@') || 
        key.startsWith('auth0') ||
        key.includes('auth0')
      )
      auth0CacheKeys.forEach(key => localStorage.removeItem(key))
      
      // Auth0 logout - this will clear the session and redirect
      auth0Logout({
        returnTo: window.location.origin,
        federated: false, // Don't logout from identity provider
      })
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout fails, clear local state
      setUser(null)
      localStorage.removeItem('admin_api_key')
    }
  }

  const getAccessToken = useCallback(async () => {
    try {
      return await getAccessTokenSilently()
    } catch (error) {
      console.error('Error getting access token:', error)
      return null
    }
  }, [getAccessTokenSilently])

  // Set token getter for API service
  useEffect(() => {
    setTokenGetter(getAccessToken)
    return () => setTokenGetter(null)
  }, [getAccessToken])

  const value = {
    user,
    loading: loading || syncing,
    login,
    register,
    logout,
    getAccessToken,
    isAuthenticated: auth0IsAuthenticated && !!user,
    isAdmin: user?.role === 'admin',
    isMember: user?.role === 'member',
    isVendor: user?.role === 'vendor',
    auth0User, // Expose Auth0 user for advanced use cases
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
