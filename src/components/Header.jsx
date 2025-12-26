import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Header.css'

const Header = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout, isAdmin, isMember, isVendor } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <a 
            href="/" 
            className="logo-link"
            onClick={(e) => {
              e.preventDefault()
              navigate('/')
            }}
          >
            <img src="/assets/Logos/WWC.png" alt="Wish Waves Club" className="logo" />
          </a>
        </div>
        
        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <a 
            href="#memberships" 
            className="nav-link"
            onClick={(e) => {
              e.preventDefault()
              if (window.location.pathname === '/') {
                document.querySelector('#memberships')?.scrollIntoView({ behavior: 'smooth' })
              } else {
                navigate('/#memberships')
              }
            }}
          >
            Memberships
          </a>
          <a 
            href="/benefits" 
            className="nav-link"
            onClick={(e) => {
              e.preventDefault()
              navigate('/benefits')
            }}
          >
            Benefits
          </a>
          <a 
            href="/events" 
            className="nav-link"
            onClick={(e) => {
              e.preventDefault()
              navigate('/events')
            }}
          >
            Events
          </a>
          {isAdmin && (
            <a 
              href="/admin/dashboard" 
              className="nav-link admin-link"
              onClick={(e) => {
                e.preventDefault()
                navigate('/admin/dashboard')
              }}
            >
              Admin
            </a>
          )}
        </nav>

        <div className="header-right">
          {isAuthenticated ? (
            <>
              <button 
                className="btn-secondary"
                onClick={() => {
                  if (isAdmin) navigate('/admin/dashboard')
                  else if (isVendor) navigate('/vendor/dashboard')
                  else if (isMember) navigate('/member/dashboard')
                }}
              >
                Dashboard
              </button>
              <button 
                className="btn-secondary"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn-secondary"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button 
                className="btn-secondary"
                onClick={() => navigate('/join')}
              >
                Join Now
              </button>
            </>
          )}
          <button 
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header


