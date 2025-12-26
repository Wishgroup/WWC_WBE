import React from 'react'
import ReactDOM from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'
import './styles/animations.css'

const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID
const audience = import.meta.env.VITE_AUTH0_AUDIENCE

// Check if Auth0 is configured
if (!domain || !clientId || !audience) {
  console.error('⚠️  Auth0 configuration missing!')
  console.error('Please set the following environment variables:')
  console.error('  - VITE_AUTH0_DOMAIN')
  console.error('  - VITE_AUTH0_CLIENT_ID')
  console.error('  - VITE_AUTH0_AUDIENCE')
  console.error('\nCreate a .env file in the project root with these values.')
} else {
  console.log('✅ Auth0 Configuration loaded:')
  console.log('  Domain:', domain)
  console.log('  Client ID:', clientId)
  console.log('  Audience:', audience)
}

// Render app with Auth0 provider if configured, otherwise show error message
const AppWithAuth = () => {
  if (!domain || !clientId || !audience) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
      }}>
        <h1 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>Auth0 Configuration Required</h1>
        <div style={{ maxWidth: '600px', lineHeight: '1.6', color: '#666' }}>
          <p>Please configure Auth0 environment variables to use authentication.</p>
          <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>Required environment variables:</p>
          <ul style={{ textAlign: 'left', marginTop: '0.5rem' }}>
            <li><code>VITE_AUTH0_DOMAIN</code> - Your Auth0 domain</li>
            <li><code>VITE_AUTH0_CLIENT_ID</code> - Your Auth0 application client ID</li>
            <li><code>VITE_AUTH0_AUDIENCE</code> - Your Auth0 API audience</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>
            Create a <code>.env</code> file in the project root with these values.
            See <code>.env.example</code> for a template.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
        scope: 'openid profile email offline_access',
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      skipRedirectCallback={false}
      onRedirectCallback={(appState) => {
        console.log('Auth0 redirect callback, appState:', appState)
        // Navigate to the original page or dashboard after login
        if (appState?.returnTo) {
          window.history.replaceState({}, document.title, appState.returnTo)
        }
      }}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </Auth0Provider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWithAuth />
  </React.StrictMode>,
)

