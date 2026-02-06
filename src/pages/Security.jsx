import React from 'react'
import { Link } from 'react-router-dom'
import LegalPage from '../components/LegalPage'

const Security = () => {
  const title = 'Security | Wish Waves Club (WWC)'
  const description = 'Learn about Wish Waves Club security practices, data protection measures, file upload safety, and how we protect your membership information.'
  const path = '/security'
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
    dateModified: '2026-02-06',
  }

  return (
    <LegalPage title={title} description={description} path={path} jsonLd={jsonLd}>
      <section>
        <h2>1. Our Commitment to Security</h2>
        <p>
          Wish Waves Club ("WWC") is committed to protecting the security and integrity of your personal information, 
          membership data, and financial transactions. We implement industry-standard security measures to safeguard 
          your data against unauthorized access, disclosure, alteration, or destruction.
        </p>
        <p>
          This Security Policy outlines our security practices, your responsibilities, and how we protect your 
          information when using WWC services.
        </p>
      </section>

      <section>
        <h2>2. Data Encryption and Protection</h2>
        
        <h3>2.1 Encryption in Transit</h3>
        <p>
          All data transmitted between your device and our servers is encrypted using Transport Layer Security (TLS) 
          protocols. This ensures that your information cannot be intercepted during transmission.
        </p>
        <ul>
          <li>HTTPS encryption for all website communications</li>
          <li>Secure API endpoints with TLS 1.2 or higher</li>
          <li>Encrypted NFC card token transmission</li>
        </ul>

        <h3>2.2 Encryption at Rest</h3>
        <p>
          Sensitive data stored in our databases is encrypted to protect against unauthorized access:
        </p>
        <ul>
          <li>Password hashing using bcrypt with salt rounds</li>
          <li>NFC card tokens encrypted before storage</li>
          <li>Payment information processed through PCI-DSS compliant payment processors</li>
          <li>Secure storage of identification documents and bank receipts</li>
        </ul>
      </section>

      <section>
        <h2>3. Authentication and Access Controls</h2>
        
        <h3>3.1 Member Account Security</h3>
        <ul>
          <li><strong>Password Requirements:</strong> Passwords must be at least 6 characters long. We recommend using strong, unique passwords.</li>
          <li><strong>Password Storage:</strong> Passwords are never stored in plain text. We use bcrypt hashing with salt for secure storage.</li>
          <li><strong>Session Management:</strong> JWT tokens are used for authentication with 7-day expiration. Tokens are stored securely in browser localStorage.</li>
          <li><strong>Login Notifications:</strong> Members receive email notifications for account logins, including IP address and timestamp.</li>
        </ul>

        <h3>3.2 Admin Access Controls</h3>
        <p>
          Administrative access to WWC systems is strictly controlled:
        </p>
        <ul>
          <li>Admin accounts require strong authentication and are limited to authorized personnel only</li>
          <li>Role-based access control ensures admins only access data necessary for their functions</li>
          <li>All admin actions are logged in audit trails with IP addresses and timestamps</li>
          <li>Admin API keys are required for sensitive operations and are rotated regularly</li>
          <li>Multi-factor authentication may be required for high-privilege operations</li>
        </ul>
      </section>

      <section>
        <h2>4. File Upload Security</h2>
        <p>
          When you upload files (such as bank transfer receipts), we implement the following security measures:
        </p>
        <ul>
          <li><strong>File Type Validation:</strong> Only approved file types (JPG, PNG, PDF) are accepted</li>
          <li><strong>File Size Limits:</strong> Maximum file size of 5MB to prevent abuse</li>
          <li><strong>Virus Scanning:</strong> Uploaded files are scanned for malware and viruses</li>
          <li><strong>Secure Storage:</strong> Files are stored in isolated directories with restricted access</li>
          <li><strong>Access Control:</strong> Only authorized admins can access uploaded files for verification purposes</li>
          <li><strong>File Naming:</strong> Files are renamed with unique identifiers to prevent path traversal attacks</li>
        </ul>
        <p>
          Never upload files containing sensitive information beyond what is required. Bank receipts should only 
          contain payment confirmation details, not full account numbers or other unnecessary sensitive data.
        </p>
      </section>

      <section>
        <h2>5. Payment Security</h2>
        <p>
          Financial transactions are processed through secure, PCI-DSS compliant payment processors:
        </p>
        <ul>
          <li><strong>Credit Card Processing:</strong> Card details are never stored on our servers. All card transactions are processed by authorized payment gateways (CC Avenue, Stripe)</li>
          <li><strong>Bank Transfer Verification:</strong> Bank receipts are securely stored and only accessible to authorized admin personnel for verification</li>
          <li><strong>Transaction Monitoring:</strong> All payment transactions are monitored for suspicious activity and fraud patterns</li>
          <li><strong>Fraud Detection:</strong> Automated systems detect and flag potentially fraudulent transactions</li>
        </ul>
        <p>
          If you suspect unauthorized payment activity, contact us immediately at 
          <a href="mailto:support@wishwavesclub.com">support@wishwavesclub.com</a>.
        </p>
      </section>

      <section>
        <h2>6. NFC Card Security</h2>
        <p>
          Your NFC membership card is protected by multiple security layers:
        </p>
        <ul>
          <li><strong>Unique Card UID:</strong> Each card has a unique identifier that cannot be duplicated</li>
          <li><strong>Encrypted Tokens:</strong> Card tokens are encrypted before storage and transmission</li>
          <li><strong>Real-Time Validation:</strong> Every card tap is validated in real-time against our database</li>
          <li><strong>Fraud Detection:</strong> Unusual usage patterns trigger fraud alerts and may result in card blocking</li>
          <li><strong>Card Status Management:</strong> Lost, stolen, or compromised cards can be immediately blocked through your dashboard</li>
        </ul>
        <p>
          If your card is lost or stolen, report it immediately through your member dashboard or contact support 
          to prevent unauthorized use.
        </p>
      </section>

      <section>
        <h2>7. Network and Infrastructure Security</h2>
        <p>
          Our technical infrastructure is protected by:
        </p>
        <ul>
          <li><strong>Firewalls:</strong> Network firewalls protect servers from unauthorized access</li>
          <li><strong>DDoS Protection:</strong> Distributed denial-of-service attack mitigation</li>
          <li><strong>Regular Updates:</strong> Security patches and updates are applied regularly</li>
          <li><strong>Intrusion Detection:</strong> Systems monitor for suspicious network activity</li>
          <li><strong>Secure Hosting:</strong> Servers are hosted in secure data centers with physical access controls</li>
        </ul>
      </section>

      <section>
        <h2>8. Security Monitoring and Incident Response</h2>
        <p>
          We continuously monitor our systems for security threats:
        </p>
        <ul>
          <li><strong>Audit Logging:</strong> All system actions are logged, including admin operations, login attempts, and data access</li>
          <li><strong>Fraud Monitoring:</strong> Automated systems detect fraud patterns in NFC card usage and payments</li>
          <li><strong>Security Alerts:</strong> Real-time alerts for suspicious activities or potential breaches</li>
          <li><strong>Incident Response:</strong> We have procedures in place to respond quickly to security incidents</li>
        </ul>
        <p>
          In the event of a security breach that may affect your data, we will notify affected users and relevant 
          authorities as required by law.
        </p>
      </section>

      <section>
        <h2>9. Your Security Responsibilities</h2>
        <p>
          While we implement strong security measures, you also play a crucial role in protecting your account:
        </p>
        
        <h3>9.1 Account Security</h3>
        <ul>
          <li>Use a strong, unique password for your WWC account</li>
          <li>Never share your login credentials with anyone</li>
          <li>Log out from shared or public computers</li>
          <li>Monitor your account for unauthorized activity</li>
          <li>Report suspicious activity immediately</li>
        </ul>

        <h3>9.2 NFC Card Security</h3>
        <ul>
          <li>Keep your NFC card secure and do not share it with others</li>
          <li>Report lost or stolen cards immediately</li>
          <li>Do not attempt to clone, modify, or tamper with your card</li>
          <li>Monitor card usage through your dashboard</li>
        </ul>

        <h3>9.3 Communication Security</h3>
        <ul>
          <li>Be cautious of phishing emails. WWC will never ask for your password via email</li>
          <li>Verify email authenticity before clicking links or providing information</li>
          <li>Only use official WWC channels for support and communication</li>
          <li>Never share sensitive information in unsecured communications</li>
        </ul>
      </section>

      <section>
        <h2>10. Third-Party Security</h2>
        <p>
          We work with trusted third-party service providers who maintain high security standards:
        </p>
        <ul>
          <li><strong>Payment Processors:</strong> PCI-DSS compliant payment gateways</li>
          <li><strong>Email Services:</strong> Secure SMTP servers with encryption</li>
          <li><strong>Hosting Providers:</strong> Reputable hosting services with security certifications</li>
        </ul>
        <p>
          We regularly assess our third-party vendors to ensure they meet our security requirements.
        </p>
      </section>

      <section>
        <h2>11. Security Best Practices</h2>
        <p>
          We follow industry best practices for security:
        </p>
        <ul>
          <li>Regular security assessments and penetration testing</li>
          <li>Employee security training and awareness programs</li>
          <li>Principle of least privilege for system access</li>
          <li>Regular backup and disaster recovery procedures</li>
          <li>Compliance with applicable data protection regulations</li>
        </ul>
      </section>

      <section>
        <h2>12. Reporting Security Issues</h2>
        <p>
          If you discover a security vulnerability or suspect a security breach, please report it immediately:
        </p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:security@wishwavesclub.com">security@wishwavesclub.com</a> or <a href="mailto:support@wishwavesclub.com">support@wishwavesclub.com</a></li>
          <li><strong>Support Center:</strong> <Link to="/support">Create a support ticket</Link></li>
        </ul>
        <p>
          We take security reports seriously and will investigate all reported issues promptly. Please do not 
          publicly disclose vulnerabilities until we have had an opportunity to address them.
        </p>
      </section>

      <section>
        <h2>13. Data Breach Notification</h2>
        <p>
          In the unlikely event of a data breach that may affect your personal information, we will:
        </p>
        <ul>
          <li>Investigate the breach immediately and take steps to contain it</li>
          <li>Notify affected users via email within 72 hours of discovery</li>
          <li>Report to relevant data protection authorities as required by law</li>
          <li>Provide guidance on steps you can take to protect yourself</li>
        </ul>
      </section>

      <section>
        <h2>14. Compliance and Certifications</h2>
        <p>
          We strive to comply with applicable security standards and regulations:
        </p>
        <ul>
          <li>General Data Protection Regulation (GDPR) compliance where applicable</li>
          <li>Payment Card Industry Data Security Standard (PCI-DSS) for payment processing</li>
          <li>Industry best practices for data protection and cybersecurity</li>
        </ul>
      </section>

      <section>
        <h2>15. Updates to Security Practices</h2>
        <p>
          We continuously improve our security measures and may update this Security Policy to reflect new practices 
          or technologies. Material changes will be posted on this page with an updated "Last updated" date.
        </p>
      </section>

      <section className="contact-section">
        <h2>Contact Information</h2>
        <p>
          For security-related questions or to report security issues:
        </p>
        <p>
          <strong>Security Email:</strong> <a href="mailto:security@wishwavesclub.com">security@wishwavesclub.com</a><br />
          <strong>Support Email:</strong> <a href="mailto:support@wishwavesclub.com">support@wishwavesclub.com</a><br />
          <strong>Website:</strong> <a href="https://wishwavesclub.com">www.wishwavesclub.com</a>
        </p>
        <p>
          For privacy-related inquiries, see our <Link to="/privacy-policy">Privacy Policy</Link>.
        </p>
      </section>
    </LegalPage>
  )
}

export default Security
