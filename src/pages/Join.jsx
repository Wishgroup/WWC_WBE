import React from 'react'
import Header from '../components/Header'
import MembershipForm from '../components/MembershipForm'
import Footer from '../components/Footer'
import './Join.css'

function Join() {
  return (
    <div className="join-page">
      <Header />
      <div className="join-wrapper">
        <div className="join-container">
          <div className="join-left">
            <div className="join-branding">
              <div className="brand-logo">
                <img src="/assets/Logos/WWC.png" alt="Wish Waves Club" />
              </div>
              <h1 className="brand-title">Join Wish Waves Club</h1>
              <p className="brand-subtitle">
                Become a member and unlock exclusive benefits, premium access, and unforgettable experiences that last a lifetime
              </p>
              <div className="brand-features">
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                      <path d="M2 17L12 22L22 17" />
                      <path d="M2 12L12 17L22 12" />
                    </svg>
                  </div>
                  <div className="feature-content">
                    <h3>Exclusive Benefits</h3>
                    <p>Access to premium services and exclusive member-only offers</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" />
                      <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" />
                      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" />
                      <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" />
                    </svg>
                  </div>
                  <div className="feature-content">
                    <h3>Premium Events</h3>
                    <p>Invitations to exclusive events and destination experiences</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </div>
                  <div className="feature-content">
                    <h3>Lifetime Value</h3>
                    <p>Choose between annual or lifetime membership options</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                      <path d="M12 8V12L15 15" />
                    </svg>
                  </div>
                  <div className="feature-content">
                    <h3>Secure & Trusted</h3>
                    <p>Your information is protected with industry-leading security</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="join-right">
            <div className="join-form-wrapper">
              <MembershipForm />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Join
