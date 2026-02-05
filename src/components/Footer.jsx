import React, { useState } from 'react'
import { contactAPI } from '../services/api'
import './Footer.css'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' })
      return
    }

    setIsSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      const result = await contactAPI.subscribe(email)
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Thank you for subscribing!' })
        setEmail('') // Clear the input
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to subscribe. Please try again.' })
      }
    } catch (error) {
      console.error('Subscription error:', error)
      setMessage({ type: 'error', text: 'Failed to subscribe. Please try again later.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <img src="/assets/Logos/WWC.png" alt="Wish Waves Club" className="footer-logo" />
            <p className="footer-mission">
              Our mission at Wish Waves Club is to unlock exclusive experiences 
              and meaningful connections for our members.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4 className="footer-heading">Support</h4>
              <ul className="footer-list">
                <li><a href="#member-support">Member Support</a></li>
                <li><a href="#order-status">Order Status</a></li>
                <li><a href="#rejoin">Rejoin WWC</a></li>
                <li><a href="#login">Member Login</a></li>
                <li><a href="#community">WWC Community</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Company</h4>
              <ul className="footer-list">
                <li><a href="#support">Support</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#mission">Our Mission</a></li>
                <li><a href="#press">Press Center</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Legal</h4>
              <ul className="footer-list">
                <li><a href="#terms">Terms of Use</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#security">Security</a></li>
                <li><a href="#cookies">Cookie Policy</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Join WWC</h4>
              <ul className="footer-list">
                <li><a href="#get-wwc">Get WWC</a></li>
                <li><a href="#refer">Refer a Friend</a></li>
                <li><a href="#gift">Gift Membership</a></li>
                <li><a href="#corporate">Corporate Gifting</a></li>
                <li><a href="#student">Student Discount</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-newsletter">
            <h4 className="newsletter-title">Stay Connected</h4>
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
              <button 
                type="submit" 
                className="newsletter-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
            {message.text && (
              <p className={`newsletter-message ${message.type === 'success' ? 'newsletter-success' : 'newsletter-error'}`}>
                {message.text}
              </p>
            )}
            <p className="newsletter-disclaimer">
              By signing up, I agree with the data protection policy.
            </p>
          </div>
          <div className="footer-copyright">
            <p>&copy; 2025 Wish Waves Club</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


