import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Policy.css'

const Privacy = () => {
  return (
    <div className="policy-page">
      <Header />
      <div className="policy-container">
        <div className="policy-content">
          <section className="policy-section">
            <h2>1. Data Controller & DPO</h2>
            <ul>
              <li><strong>Controller:</strong> Wish Waves Club, UAE</li>
              <li><strong>Data Protection Officer (DPO):</strong> [To be specified]</li>
              <li><strong>Contact Email:</strong> privacy@wishwavesclub.com</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>2. Personal Data Collected</h2>
            <div className="data-categories">
              <div className="data-category">
                <h3>During Registration:</h3>
                <p>Name, email, password, mobile number, DOB, nationality, gender, ID documents, address, emergency contacts, optional professional info.</p>
              </div>
              <div className="data-category">
                <h3>Payment Information:</h3>
                <p>Billing name, email, phone, address; payment status; transaction IDs (processed by Stripe/CC Avenue).</p>
              </div>
              <div className="data-category">
                <h3>NFC Usage:</h3>
                <p>Card UID, vendor info, location, timestamp, transaction details, validation results.</p>
              </div>
              <div className="data-category">
                <h3>Technical Data:</h3>
                <p>IP address, device/browser info, session data, API keys.</p>
              </div>
              <div className="data-category">
                <h3>Audit Logs:</h3>
                <p>Actions performed on the platform (registrations, payments, card taps, etc.).</p>
              </div>
              <div className="data-category">
                <h3>Third-Party Data:</h3>
                <p>Payment confirmations, geolocation services, analytics (if implemented).</p>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>3. Purpose of Data Processing</h2>
            <ul>
              <li>Membership registration and management</li>
              <li>Payment processing and reconciliation</li>
              <li>NFC card validation and benefit redemption</li>
              <li>Fraud detection and prevention</li>
              <li>Business analytics and reporting</li>
              <li>Compliance with legal obligations</li>
              <li>Customer support and notifications</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>4. Data Retention</h2>
            <ul>
              <li><strong>Active Member Data:</strong> Duration of membership + legal requirement</li>
              <li><strong>Payment Records:</strong> 7 years for accounting</li>
              <li><strong>NFC Tap Logs & Fraud Events:</strong> Indefinite</li>
              <li><strong>Inactive Accounts:</strong> 3 years post last activity</li>
              <li><strong>Deleted Accounts:</strong> Soft delete 90 days, hard delete after, subject to legal requirements</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>5. Third-Party Sharing</h2>
            <ul>
              <li><strong>Payment Processors:</strong> Stripe (US), CC Avenue (India/UAE)</li>
              <li><strong>Vendors:</strong> Limited transaction and validation data</li>
              <li><strong>Analytics Services:</strong> If implemented, anonymized and aggregated</li>
              <li><strong>No other third parties</strong> receive personal data without consent or legal requirement.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>6. International Transfers</h2>
            <p>
              Cross-border transfers occur for payment processing, hosting, and multi-country vendor operations. 
              Transfers comply with GDPR and UAE regulations using adequate safeguards.
            </p>
          </section>

          <section className="policy-section">
            <h2>7. User Rights (GDPR/CCPA/UAE)</h2>
            <div className="rights-grid">
              <div className="right-item">
                <h3>Access & Portability</h3>
                <p>Export profile, payment, and NFC usage data (JSON/CSV).</p>
              </div>
              <div className="right-item">
                <h3>Rectification</h3>
                <p>Update profile, email, address.</p>
              </div>
              <div className="right-item">
                <h3>Erasure</h3>
                <p>Request account deletion (payment records retained 7 years).</p>
              </div>
              <div className="right-item">
                <h3>Restriction & Objection</h3>
                <p>Limit processing or opt-out of marketing.</p>
              </div>
            </div>
            <p className="rights-note">
              Requests handled via email/contact within 30 days with identity verification.
            </p>
          </section>

          <section className="policy-section">
            <h2>8. Data Security</h2>
            <ul>
              <li>Encrypted storage (AES-256 for NFC tokens), HTTPS/TLS, bcrypt password hashing</li>
              <li>Audit logs, role-based access, API key authentication</li>
              <li>Regular backups and monitoring</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>9. Data Breach Procedure</h2>
            <ul>
              <li>Detection via monitoring and audit logs</li>
              <li>Immediate containment and assessment</li>
              <li>Notification to regulators and affected users within 72 hours</li>
              <li>Remediation and post-incident review</li>
            </ul>
          </section>

          <section className="policy-section policy-contact">
            <h2>Contact Information</h2>
            <p>
              <strong>Email (Privacy / Data Requests):</strong> privacy@wishwavesclub.com<br />
              <strong>Support Email:</strong> support@wishwavesclub.com<br />
              <strong>Website:</strong> www.wishwavesclub.com<br />
              <strong>Business Address:</strong> [To be specified]<br />
              <strong>Regulatory Authority (UAE):</strong> [To be specified]
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Privacy
