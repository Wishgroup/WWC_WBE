import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Policy.css'

const Terms = () => {
  return (
    <div className="policy-page">
      <Header />
      <div className="policy-container">
        
        <div className="policy-content">
          <section className="policy-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Wish Waves Club ("WWC") website, web application, or NFC membership services, 
              you agree to comply with and be bound by these Terms of Use. If you do not agree, you must not use the services.
            </p>
          </section>

          <section className="policy-section">
            <h2>2. Eligibility & Account Creation</h2>
            <ul>
              <li>Membership is limited to individuals <strong>18 years or older</strong>.</li>
              <li>Registration requires a valid email address, password, and acceptance of all policies.</li>
              <li>Members must provide <strong>accurate and complete information</strong>.</li>
              <li>Accounts are <strong>non-transferable</strong>; sharing login credentials is prohibited.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>3. NFC Card Terms & Usage</h2>
            <ul>
              <li>Each member is issued a <strong>DESFire EV2 NFC card</strong> linked to their account.</li>
              <li>Cards contain <strong>no personal information</strong>; validation occurs server-side.</li>
              <li><strong>Lost or stolen cards</strong> must be reported immediately; WWC may issue a replacement card.</li>
              <li><strong>Unauthorized sharing or duplication</strong> of cards is prohibited and may result in account suspension.</li>
              <li>WWC may temporarily or permanently <strong>block cards for suspected fraud</strong>.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>4. Membership Payments</h2>
            <div className="payment-info">
              <p><strong>Annual Membership:</strong> USD 100 / AED 370</p>
              <p><strong>Lifetime Membership:</strong> USD 1,000 / AED 3,700</p>
            </div>
            <ul>
              <li>Payments are processed via <strong>Stripe or CC Avenue</strong>. WWC does not store full card details.</li>
              <li>Membership activation occurs after <strong>successful payment confirmation</strong>.</li>
              <li>Refunds and cancellations are subject to WWC's refund policy, available on request.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>5. User Responsibilities</h2>
            <ul>
              <li>Maintain <strong>confidentiality of account credentials</strong>.</li>
              <li>Use services in accordance with <strong>applicable laws and WWC policies</strong>.</li>
              <li>Do not attempt <strong>unauthorized access, reverse-engineering, or tampering</strong> with WWC systems.</li>
              <li>Promptly <strong>report security breaches, fraud, or suspicious activity</strong>.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>6. Vendor Interactions</h2>
            <ul>
              <li>Members may access partner vendors through <strong>NFC card validation</strong>.</li>
              <li>Vendors operate independently; <strong>WWC is not liable for vendor services or offers</strong>.</li>
              <li>Vendor information may be shared with members for transaction purposes.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>7. Intellectual Property</h2>
            <ul>
              <li>All website content, branding, designs, software, and graphics are <strong>owned by WWC or licensed</strong>.</li>
              <li>Users may not <strong>reproduce, distribute, or modify content</strong> without express permission.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>8. Liability Limitations</h2>
            <ul>
              <li>WWC is not liable for <strong>indirect, incidental, or consequential damages</strong>.</li>
              <li>WWC is not responsible for <strong>third-party services, network outages, or payment processor errors</strong>.</li>
              <li>Services are provided <strong>"as-is"</strong> without warranties of uninterrupted access or error-free operation.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>9. Dispute Resolution & Governing Law</h2>
            <ul>
              <li>Governed by the <strong>laws of the United Arab Emirates (UAE)</strong>.</li>
              <li>Disputes may be resolved via <strong>arbitration or UAE courts</strong> as required.</li>
              <li>Users consent to <strong>UAE jurisdiction</strong> for disputes related to WWC services.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>10. Modifications to Terms</h2>
            <ul>
              <li>WWC may <strong>modify these Terms at any time</strong>.</li>
              <li>Updated terms will be <strong>posted on the website</strong>; continued use constitutes acceptance.</li>
            </ul>
          </section>

          <section className="policy-section policy-contact">
            <h2>Contact Information</h2>
            <p>For questions about these Terms of Use, please contact us:</p>
            <p>
              <strong>Email:</strong> privacy@wishwavesclub.com<br />
              <strong>Website:</strong> www.wishwavesclub.com
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Terms
