import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Support.css'

const Support = () => {
  const [activeTab, setActiveTab] = useState('member-support')

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="support-page">
      <Header />
      
      {/* Support Navigation Bar */}
      <div className="support-nav-bar">
        
      </div>

      <div className="support-container">
        <div className="support-hero">
          <h1>Support Center</h1>
          <p>We're here to help you with any questions or issues</p>
        </div>

        <div className="support-content">
          <div id="member-support" className="support-section">
            <h2>Member Support</h2>
            <p>For membership-related questions, account issues, or NFC card problems:</p>
            <div className="support-contact">
              <p><strong>Email:</strong> support@wishwavesclub.com</p>
              <p><strong>Response Time:</strong> Within 24 hours</p>
            </div>
          </div>

          <div id="faq-section" className="support-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-list">
              <div className="faq-item">
                <h3>In simple terms, what is Wish Waves Club?</h3>
                <p>It's lifestyle, ocean, and value coming together.</p>
              </div>
              <div className="faq-item">
                <h3>Who is Wish Waves Club for?</h3>
                <p>It's for people who enjoy experiences and want more than one-off moments.</p>
              </div>
              <div className="faq-item">
                <h3>What makes Wish Waves Club different?</h3>
                <p>Instead of doing everything as one-off experiences, Wish Waves Club brings things together under one membership.</p>
              </div>
              <div className="faq-item">
                <h3>How do I activate my membership?</h3>
                <p>Your membership is activated automatically after successful payment confirmation. You'll receive an email confirmation with your membership details.</p>
              </div>
              <div className="faq-item">
                <h3>When will I receive my NFC card?</h3>
                <p>NFC cards are typically issued within 5-7 business days after membership activation. You'll receive tracking information via email.</p>
              </div>
              <div className="faq-item">
                <h3>What should I do if I lose my NFC card?</h3>
                <p>Report the lost card immediately through your member dashboard or contact support. We'll block the old card and issue a replacement.</p>
              </div>
              <div className="faq-item">
                <h3>How do I update my personal information?</h3>
                <p>You can update your profile information through your member dashboard. For ID document updates, please contact support.</p>
              </div>
              <div className="faq-item">
                <h3>Can I cancel my membership?</h3>
                <p>Yes, you can cancel your membership. Refund policies vary by membership type. Please contact support for assistance with cancellations.</p>
              </div>
            </div>
          </div>

          <div className="support-section">
            <h2>Contact Information</h2>
            <div className="contact-info">
              <div className="contact-item">
                <h3>General Inquiries</h3>
                <p>Email: info@wishwavesclub.com</p>
              </div>
              <div className="contact-item">
                <h3>Privacy & Data Requests</h3>
                <p>Email: privacy@wishwavesclub.com</p>
              </div>
              <div className="contact-item">
                <h3>Technical Support</h3>
                <p>Email: tech@wishwavesclub.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Support
