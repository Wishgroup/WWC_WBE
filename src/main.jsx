import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'
import './styles/animations.css'
import './styles/text-justify.css'

// Add error logging (ignore ERR_BLOCKED_BY_CLIENT - it's usually from browser extensions)
window.addEventListener('error', (event) => {
  // Ignore blocked by client errors (usually from ad blockers)
  const errorMessage = event.message || event.error?.message || ''
  const errorSource = event.filename || event.target?.src || ''
  
  if (errorMessage.includes('ERR_BLOCKED_BY_CLIENT') || 
      errorSource.includes('CookiePolicy') ||
      errorSource.includes('PrivacyPolicy') ||
      errorSource.includes('cookie') ||
      errorSource.includes('privacy')) {
    // Silently ignore - this is just a browser extension blocking the resource
    return
  }
  
  // Log actual errors
  if (event.error) {
    console.error('Global error:', event.error)
  }
}, true)

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

try {
  const root = ReactDOM.createRoot(document.getElementById('root'))
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  )
} catch (error) {
  console.error('Failed to render app:', error)
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h1>Application Error</h1>
      <p>${error.message}</p>
      <button onclick="window.location.reload()">Reload Page</button>
    </div>
  `
}

