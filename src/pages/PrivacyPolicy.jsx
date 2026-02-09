import React from 'react'
import { Link } from 'react-router-dom'
import LegalPage from '../components/LegalPage'

const PrivacyPolicy = () => {
  const title = 'Privacy Policy | Wish Waves Club (WWC)'
  const description = 'Learn how Wish Waves Club collects, uses, and protects your personal data. Understand your privacy rights, data retention, and how we handle your information.'
  const path = '/privacy-policy'
  const baseUrl = 'https://wishwavesclub.com'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    url: `${baseUrl}${path}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Wish Waves Club',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Wish Waves Club',
      url: baseUrl,
    },
    dateModified: '2026-02-07',
  }

  return (
    <LegalPage title={title} description={description} path={path} jsonLd={jsonLd}>
      <section>
        <h2>1. Introduction</h2>
        <p>
          Wish Waves Club ("WWC", "we", "us", "our") is committed to protecting your privacy and personal data. 
          This Privacy Policy explains how we collect, use, store, and protect your information when you use our 
          membership platform, website, and services.
        </p>
        <p>
          By using WWC services, you consent to the data practices described in this policy. If you do not agree 
          with this policy, please do not use our services.
        </p>
        <div className="policy-summary">
          <p><strong>Summary:</strong></p>
          <p>We collect your identity, contact, membership, and usage data to provide membership services, process payments, and improve our platform. We share data only with necessary service providers and partners. We retain data as required by law and our retention policy. You have rights to access, correct, delete, and port your data, and to object or withdraw consent. We use security measures including encryption and access controls. For cookies, see our <Link to="/cookie-policy">Cookie Policy</Link>.</p>
        </div>
      </section>

      <section>
        <h2>2. Data Controller</h2>
        <p>
          Wish Waves Club is the data controller responsible for your personal data. For privacy-related inquiries, 
          please contact us at:
        </p>
        <ul>
          <li><strong>Email:</strong> privacy@wishwavesclub.com</li>
          <li><strong>Website:</strong> <a href="https://wishwavesclub.com">www.wishwavesclub.com</a></li>
        </ul>
      </section>

      <section>
        <h2>3. Personal Data We Collect</h2>
        <p>
          We collect the following categories of personal data:
        </p>
        
        <h3>3.1 Identity and Contact Information</h3>
        <ul>
          <li>Full name, first name, last name</li>
          <li>Email address</li>
          <li>Phone number and mobile number</li>
          <li>Physical address (street, city, country)</li>
          <li>Date of birth (for age verification)</li>
          <li>Nationality</li>
        </ul>

        <h3>3.2 Identification Documents</h3>
        <ul>
          <li>ID number (Emirates ID, passport number, or other government-issued ID)</li>
          <li>ID type and document details (for verification purposes)</li>
        </ul>

        <h3>3.3 Membership Information</h3>
        <ul>
          <li>Membership type (Annual or Lifetime)</li>
          <li>Membership status and activation date</li>
          <li>Payment history and transaction records</li>
          <li>NFC card details (card UID, status, issuance date)</li>
        </ul>

        <h3>3.4 Financial Information</h3>
        <ul>
          <li>Payment method preferences</li>
          <li>Transaction amounts and payment status</li>
          <li>Bank transfer receipts (for verification)</li>
          <li><strong>Note:</strong> Credit card details are processed securely by third-party payment processors and are not stored by WWC</li>
        </ul>

        <h3>3.5 Usage and Technical Data</h3>
        <ul>
          <li>NFC card tap logs (location, timestamp, vendor information)</li>
          <li>Website usage data (pages visited, time spent, interactions)</li>
          <li>Device information (browser type, operating system, IP address)</li>
          <li>Login history and session data</li>
          <li>Support ticket communications</li>
        </ul>

        <h3>3.6 Communication Data</h3>
        <ul>
          <li>Email communications with support</li>
          <li>Support ticket messages and history</li>
          <li>Newsletter subscription preferences</li>
        </ul>
      </section>

      <section>
        <h2>4. How We Use Your Data</h2>
        <p>
          We use your personal data for the following purposes:
        </p>
        
        <h3>4.1 Membership Services</h3>
        <ul>
          <li>Process and manage your membership application</li>
          <li>Activate and maintain your membership account</li>
          <li>Issue and manage your NFC membership card</li>
          <li>Provide access to member benefits and services</li>
          <li>Validate NFC card usage at partner vendors</li>
        </ul>

        <h3>4.2 Payment Processing</h3>
        <ul>
          <li>Process membership payments and renewals</li>
          <li>Verify bank transfer receipts</li>
          <li>Manage payment sessions and transaction records</li>
          <li>Prevent fraud and unauthorized transactions</li>
        </ul>

        <h3>4.3 Communication</h3>
        <ul>
          <li>Send membership confirmations and welcome emails</li>
          <li>Notify you about events, offers, and member benefits</li>
          <li>Respond to support inquiries and provide customer service</li>
          <li>Send important account updates and policy changes</li>
        </ul>

        <h3>4.4 Security and Fraud Prevention</h3>
        <ul>
          <li>Detect and prevent fraudulent activity</li>
          <li>Monitor NFC card usage for suspicious patterns</li>
          <li>Protect the security and integrity of our platform</li>
          <li>Comply with legal and regulatory requirements</li>
        </ul>

        <h3>4.5 Analytics and Improvement</h3>
        <ul>
          <li>Analyze website usage and member behavior (anonymized where possible)</li>
          <li>Improve our services and user experience</li>
          <li>Conduct business intelligence and reporting</li>
        </ul>
      </section>

      <section>
        <h2>5. Legal Basis for Processing</h2>
        <p>
          We process your personal data based on the following legal grounds:
        </p>
        <ul>
          <li><strong>Contract Performance:</strong> To fulfill our membership agreement and provide services you have requested</li>
          <li><strong>Legal Obligation:</strong> To comply with applicable laws, regulations, and tax requirements</li>
          <li><strong>Legitimate Interests:</strong> For fraud prevention, security, and business operations</li>
          <li><strong>Consent:</strong> For marketing communications and optional data processing (where applicable)</li>
        </ul>
      </section>

      <section>
        <h2>6. Data Sharing and Disclosure</h2>
        <p>
          We may share your data with the following parties:
        </p>
        
        <h3>6.1 Service Providers</h3>
        <ul>
          <li><strong>Payment Processors:</strong> To process payments securely (CC Avenue, Stripe, or bank transfer services)</li>
          <li><strong>Email Services:</strong> To send transactional and marketing emails</li>
          <li><strong>Hosting Providers:</strong> To store and process data on secure servers</li>
          <li><strong>Analytics Services:</strong> To analyze website usage (with anonymized data where possible)</li>
        </ul>

        <h3>6.2 Partner Vendors</h3>
        <ul>
          <li>When you use your NFC card at partner locations, we share necessary information (card UID, membership status) to validate your membership and apply benefits</li>
          <li>Partner vendors do not receive your full personal information unless required for specific services</li>
        </ul>

        <h3>6.3 Legal Requirements</h3>
        <ul>
          <li>We may disclose data if required by law, court order, or government regulation</li>
          <li>We may share data to protect our rights, property, or safety, or that of our members</li>
        </ul>

        <h3>6.4 Business Transfers</h3>
        <p>
          In the event of a merger, acquisition, or sale of assets, your data may be transferred to the new entity, 
          subject to the same privacy protections.
        </p>
      </section>

      <section>
        <h2>7. Data Retention</h2>
        <p>
          We retain your personal data for as long as necessary to fulfill the purposes outlined in this policy:
        </p>
        <ul>
          <li><strong>Active Members:</strong> Data is retained for the duration of your membership and for a reasonable period after cancellation to comply with legal obligations</li>
          <li><strong>Payment Records:</strong> Financial transaction records are retained for 7 years as required by accounting and tax laws</li>
          <li><strong>NFC Card Logs:</strong> Tap logs and transaction history are retained for fraud detection and analytics purposes</li>
          <li><strong>Support Communications:</strong> Support tickets and communications are retained for customer service and dispute resolution</li>
        </ul>
        <p>
          When data is no longer needed, it is securely deleted or anonymized in accordance with our data retention 
          policies and legal requirements.
        </p>
      </section>

      <section>
        <h2>8. Your Privacy Rights</h2>
        <p>
          Depending on your jurisdiction, you may have the following rights regarding your personal data:
        </p>
        
        <h3>8.1 Access Rights</h3>
        <p>
          You have the right to request access to your personal data and receive a copy of the information we hold about you.
        </p>

        <h3>8.2 Correction Rights</h3>
        <p>
          You can update your personal information through your member dashboard or by contacting support. We will 
          correct inaccurate or incomplete data upon request.
        </p>

        <h3>8.3 Deletion Rights</h3>
        <p>
          You may request deletion of your personal data, subject to legal and contractual obligations. Note that 
          we may retain certain data (such as payment records) as required by law.
        </p>

        <h3>8.4 Data Portability</h3>
        <p>
          You have the right to receive your data in a structured, machine-readable format and to transfer it to 
          another service provider where technically feasible.
        </p>

        <h3>8.5 Objection and Restriction</h3>
        <p>
          You may object to certain processing activities or request restriction of processing in specific circumstances.
        </p>

        <h3>8.6 Withdraw Consent</h3>
        <p>
          Where processing is based on consent, you may withdraw consent at any time. This does not affect the 
          lawfulness of processing before withdrawal.
        </p>

        <p>
          To exercise these rights, contact us at <a href="mailto:privacy@wishwavesclub.com">privacy@wishwavesclub.com</a>. 
          We will respond to your request within 30 days.
        </p>
      </section>

      <section>
        <h2>9. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal data:
        </p>
        <ul>
          <li>Encryption of sensitive data in transit and at rest</li>
          <li>Secure password hashing (bcrypt) for account authentication</li>
          <li>Regular security assessments and updates</li>
          <li>Access controls and authentication for administrative systems</li>
          <li>Secure file storage for uploaded documents (bank receipts)</li>
          <li>Fraud detection and monitoring systems</li>
        </ul>
        <p>
          However, no method of transmission over the internet is 100% secure. While we strive to protect your data, 
          we cannot guarantee absolute security.
        </p>
      </section>

      <section>
        <h2>10. International Data Transfers</h2>
        <p>
          Your data may be processed and stored in servers located outside your country of residence. We ensure 
          that appropriate safeguards are in place to protect your data in accordance with applicable data protection 
          laws.
        </p>
      </section>

      <section>
        <h2>11. Children's Privacy</h2>
        <p>
          Wish Waves Club membership is available to individuals aged 15 and older. We do not knowingly collect 
          personal data from children under 15. If we become aware that we have collected data from a child under 
          15, we will take steps to delete such information promptly.
        </p>
      </section>

      <section>
        <h2>12. Cookies and Tracking Technologies</h2>
        <p>
          We use cookies and similar technologies to enhance your experience. For detailed information about our 
          cookie practices, please see our <Link to="/cookie-policy">Cookie Policy</Link>.
        </p>
      </section>

      <section>
        <h2>13. Third-Party Links</h2>
        <p>
          Our website may contain links to third-party websites, including partner vendors. We are not responsible 
          for the privacy practices of these external sites. We encourage you to review their privacy policies.
        </p>
      </section>

      <section>
        <h2>14. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes will be posted on this page with 
          an updated "Last updated" date. We may also notify you of significant changes via email.
        </p>
        <p>
          Your continued use of WWC services after changes become effective constitutes acceptance of the updated policy.
        </p>
      </section>

      <section className="contact-section">
        <h2>15. Contact Us</h2>
        <p>
          For privacy-related questions, data requests, or to exercise your rights, please contact us:
        </p>
        <p>
          <strong>Privacy Email:</strong> <a href="mailto:privacy@wishwavesclub.com">privacy@wishwavesclub.com</a><br />
          <strong>Support Email:</strong> <a href="mailto:support@wishwavesclub.com">support@wishwavesclub.com</a><br />
          <strong>Website:</strong> <a href="https://wishwavesclub.com">www.wishwavesclub.com</a>
        </p>
        <p>
          For general inquiries, visit our <Link to="/support">Support Center</Link>.
        </p>
        <p style={{ marginBottom: 0, fontSize: '0.9rem', color: '#666' }}>
          <em>Last updated: February 7, 2026</em>
        </p>
      </section>
    </LegalPage>
  )
}

export default PrivacyPolicy



