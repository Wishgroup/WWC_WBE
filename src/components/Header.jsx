import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Header.css'

const Header = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout, isAdmin, isMember, isVendor, auth0User } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

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
            <div className="user-menu-container" ref={userMenuRef}>
              <button 
                className="user-menu-button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="User menu"
              >
                <div className="user-avatar">
                  {user?.fullName || user?.vendor_name || auth0User?.name ? (
                    <span className="user-initials">
                      {(user?.fullName || user?.vendor_name || auth0User?.name || 'U')
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </span>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
                      <path d="M12.0002 14.5C6.99016 14.5 2.91016 17.86 2.91016 22C2.91016 22.28 3.13016 22.5 3.41016 22.5H20.5902C20.8702 22.5 21.0902 22.28 21.0902 22C21.0902 17.86 17.0102 14.5 12.0002 14.5Z" fill="currentColor"/>
                    </svg>
                  )}
                </div>
                <span className="user-name">
                  {user?.fullName || user?.vendor_name || auth0User?.name || 'User'}
                </span>
                <svg 
                  className={`user-menu-arrow ${isUserMenuOpen ? 'open' : ''}`}
                  width="12" 
                  height="12" 
                  viewBox="0 0 12 12" 
                  fill="none"
                >
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {isUserMenuOpen && (
                <div className="user-menu-dropdown">
                  <div className="user-menu-header">
                    <div className="user-menu-avatar">
                      {user?.fullName || user?.vendor_name || auth0User?.name ? (
                        <span className="user-initials-large">
                          {(user?.fullName || user?.vendor_name || auth0User?.name || 'U')
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      ) : (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                          <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
                          <path d="M12.0002 14.5C6.99016 14.5 2.91016 17.86 2.91016 22C2.91016 22.28 3.13016 22.5 3.41016 22.5H20.5902C20.8702 22.5 21.0902 22.28 21.0902 22C21.0902 17.86 17.0102 14.5 12.0002 14.5Z" fill="currentColor"/>
                        </svg>
                      )}
                    </div>
                    <div className="user-menu-info">
                      <div className="user-menu-name">
                        {user?.fullName || user?.vendor_name || auth0User?.name || 'User'}
                      </div>
                      <div className="user-menu-email">
                        {user?.email || auth0User?.email || ''}
                      </div>
                      {user?.role && (
                        <div className="user-menu-role">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="user-menu-divider"></div>
                  <button 
                    className="user-menu-item"
                    onClick={() => {
                      if (isAdmin) navigate('/admin/dashboard')
                      else if (isVendor) navigate('/vendor/dashboard')
                      else if (isMember) navigate('/member/dashboard')
                      setIsUserMenuOpen(false)
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Dashboard
                  </button>
                  <button 
                    className="user-menu-item"
                    onClick={() => {
                      logout()
                      setIsUserMenuOpen(false)
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
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


