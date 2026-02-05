import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Policy.css'

const Security = () => {
  return (
    <div className="policy-page">
      <Header />
      <div className="policy-container">
        
        <div className="policy-content">
          <section className="policy-section">
            <h2>1. Overview</h2>
            <p>
              WWC implements technical and operational measures to protect personal data, account integrity, 
              and NFC card systems.
            </p>
          </section>

          <section className="policy-section">
            <h2>2. Authentication & Account Security</h2>
            <ul>
              <li><strong>Bcrypt password hashing</strong> with salt</li>
              <li><strong>JWT token-based sessions</strong> (7-day expiry)</li>
              <li><strong>API key authentication</strong> for vendors/admins</li>
              <li><strong>Role-based access control</strong></li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>3. Data Encryption</h2>
            <ul>
              <li><strong>HTTPS/TLS</strong> for all transmission</li>
              <li><strong>Database encryption</strong> (MySQL / MongoDB Atlas)</li>
              <li><strong>AES-256-CBC</strong> for NFC tokens</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>4. NFC Card Security</h2>
            <ul>
              <li><strong>UID + encrypted token</strong> validation server-side</li>
              <li><strong>Blacklisting</strong> for compromised cards</li>
              <li><strong>Card reissuance</strong> and token rotation</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>5. Fraud Detection & Monitoring</h2>
            <ul>
              <li><strong>Geo-inconsistency checks</strong>, tap frequency monitoring</li>
              <li><strong>Card sharing detection</strong> and fraud scoring (0–100)</li>
              <li><strong>Automated blocking</strong> of high-risk accounts</li>
              <li><strong>Admin manual review</strong> and appeal process</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>6. Application & Infrastructure Security</h2>
            <ul>
              <li><strong>Helmet.js</strong> for headers, CORS configured, rate limiting</li>
              <li><strong>Input validation</strong>, SQL injection prevention, XSS protection</li>
              <li><strong>Firewall</strong> and DDoS mitigation measures</li>
              <li><strong>Audit logging</strong> and error tracking</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>7. Incident Response</h2>
            <ul>
              <li>Immediate containment, scope assessment</li>
              <li>Notification to users, vendors, regulators as required</li>
              <li>Remediation, documentation, and post-incident review</li>
            </ul>
          </section>

          <section className="policy-section policy-contact">
            <h2>Contact Information</h2>
            <p>
              <strong>Email (Security Concerns):</strong> privacy@wishwavesclub.com<br />
              <strong>Support Email:</strong> support@wishwavesclub.com<br />
              <strong>Website:</strong> www.wishwavesclub.com
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Security
