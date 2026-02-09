import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Policy.css'

const CookiePolicy = () => {
  return (
    <div className="policy-page">
      <Header />
      <div className="policy-container">

        <div className="policy-content">
          <section className="policy-section">
            <h2>1. What Are Cookies</h2>
            <p>
              Cookies and similar technologies store information in your browser or device.
              WWC uses localStorage and sessionStorage for functionality.
            </p>
          </section>

          <section className="policy-section">
            <h2>2. Types of Cookies / Storage</h2>
            <div className="cookie-table-wrapper">
              <table className="cookie-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Purpose</th>
                    <th>Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Essential</strong></td>
                    <td>JWT authentication, session management</td>
                    <td>7 days / session</td>
                  </tr>
                  <tr>
                    <td><strong>Functional</strong></td>
                    <td>User preferences, language settings</td>
                    <td>As configured</td>
                  </tr>
                  <tr>
                    <td><strong>Analytics</strong></td>
                    <td>Page views, performance metrics</td>
                    <td>Not currently implemented</td>
                  </tr>
                  <tr>
                    <td><strong>Marketing</strong></td>
                    <td>Advertising, retargeting</td>
                    <td>Not currently implemented</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="policy-section">
            <h2>3. Third-Party Cookies</h2>
            <ul>
              <li>Payment processors and vendors may use cookies for transaction purposes.</li>
              <li>Analytics or advertising cookies may be added in the future (user consent required).</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>4. User Consent & Control</h2>
            <ul>
              <li>Users can <strong>manage or delete browser storage</strong> through browser settings.</li>
              <li><strong>Essential cookies cannot be disabled</strong> without losing platform functionality.</li>
              <li>Users will be <strong>notified of any new cookies</strong> requiring consent.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>5. Managing Your Cookie Preferences</h2>
            <p>
              You can manage your cookie preferences at any time by clicking the "Manage Preferences"
              button in the cookie consent banner, or by clearing your browser's localStorage and
              refreshing the page to see the consent banner again.
            </p>
          </section>

          <section className="policy-section policy-contact">
            <h2>Contact Information</h2>
            <p>
              <strong>Email (Privacy / Cookie Questions):</strong> privacy@wishwavesclub.com<br />
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

export default CookiePolicy
