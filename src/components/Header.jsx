import React, { useState } from 'react'
import logo from '../../WWC_WBE/10x/logo.png'
import './Header.css'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <a href="/" className="logo-link">
            <img src={logo} alt="Wish Waves Club" className="logo" />
          </a>
        </div>
        
        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <a href="#memberships" className="nav-link">Memberships</a>
          <a href="#how-it-works" className="nav-link">How it works</a>
          <a href="#why-wwc" className="nav-link">Why WWC</a>
          <a href="#benefits" className="nav-link">Benefits</a>
          <a href="#events" className="nav-link">Events</a>
        </nav>

        <div className="header-right">
          <button className="btn-secondary">Join Now</button>
          <button className="btn-primary">Gift Membership</button>
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

