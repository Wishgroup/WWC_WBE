import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../utils/analytics'

/**
 * Hook to track page views with Google Analytics
 * Automatically tracks page changes in React Router
 */
export const usePageTracking = () => {
  const location = useLocation()

  useEffect(() => {
    // Track page view on route change
    const path = location.pathname + location.search
    const title = document.title || 'Wish Waves Club'
    
    try {
      trackPageView(path, title)
    } catch (error) {
      // Silently fail if tracking is not available
      console.warn('Error tracking page view:', error)
    }
  }, [location])
}

