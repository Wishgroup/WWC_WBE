import React from 'react'
import { Link } from 'react-router-dom'
import LegalPage from '../components/LegalPage'

const CookiePolicy = () => {
  const title = 'Cookie Policy | Wish Waves Club (WWC)'
  const description = 'Learn about how Wish Waves Club uses cookies, what types of cookies we use, how to manage your cookie preferences, and your rights regarding cookies.'
  const path = '/cookie-policy'
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
        <h2>1. What Are Cookies?</h2>
        <p>
          Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you visit 
          a website. They are widely used to make websites work more efficiently and provide information to website 
          owners about user behavior and preferences.
        </p>
        <p>
          Cookies can be "persistent" (remain on your device until deleted or expired) or "session" cookies 
          (deleted when you close your browser).
        </p>
      </section>

      <section>
        <h2>2. How Wish Waves Club Uses Cookies</h2>
        <p>
          Wish Waves Club ("WWC") uses cookies and similar tracking technologies to enhance your experience, 
          analyze website usage, and provide personalized services. We use cookies for the following purposes:
        </p>
        <ul>
          <li>To enable essential website functionality and maintain your login session</li>
          <li>To remember your preferences and settings</li>
          <li>To analyze how visitors use our website and improve our services</li>
          <li>To track conversions and measure the effectiveness of our marketing efforts</li>
          <li>To provide personalized content and recommendations</li>
        </ul>
      </section>

      <section>
        <h2>3. Types of Cookies We Use</h2>
        
        <h3>3.1 Essential Cookies</h3>
        <p>
          These cookies are necessary for the website to function properly. They enable core functionality such 
          as security, network management, and accessibility. These cookies cannot be disabled.
        </p>
        <ul>
          <li><strong>Authentication Cookies:</strong> Maintain your login session and remember that you are logged in</li>
          <li><strong>Security Cookies:</strong> Protect against fraud and ensure secure transactions</li>
          <li><strong>Session Management:</strong> Remember your actions and preferences during a browsing session</li>
        </ul>
        <p>
          <strong>Storage:</strong> JWT authentication tokens are stored in browser localStorage (not traditional cookies) 
          for session management. These are essential for maintaining your login state.
        </p>

        <h3>3.2 Functional Cookies</h3>
        <p>
          These cookies enable enhanced functionality and personalization. They remember your choices and preferences 
          to provide a more personalized experience.
        </p>
        <ul>
          <li>Language preferences</li>
          <li>Cookie consent preferences</li>
          <li>User interface settings</li>
        </ul>

        <h3>3.3 Analytics Cookies</h3>
        <p>
          These cookies help us understand how visitors interact with our website by collecting and reporting 
          information anonymously. We use Google Analytics to track:
        </p>
        <ul>
          <li>Number of visitors and page views</li>
          <li>Time spent on pages</li>
          <li>Traffic sources (direct, search, referral, social media)</li>
          <li>Device and browser information</li>
          <li>Geographic location (country-level, anonymized)</li>
          <li>Conversion events (membership signups, payments)</li>
        </ul>
        <p>
          Analytics data is aggregated and anonymized. It does not identify individual users.
        </p>

        <h3>3.4 Marketing Cookies (If Applicable)</h3>
        <p>
          These cookies are used to track visitors across websites to display relevant advertisements. Currently, 
          WWC does not use third-party advertising cookies, but this may change in the future. You will be notified 
          of any changes to our cookie practices.
        </p>
      </section>

      <section>
        <h2>4. Third-Party Cookies</h2>
        <p>
          We may use services from third parties that set their own cookies:
        </p>
        
        <h3>4.1 Google Analytics</h3>
        <p>
          We use Google Analytics to analyze website traffic and user behavior. Google Analytics uses cookies to 
          collect information about how visitors use our site. This information is used to compile reports and help 
          us improve the site.
        </p>
        <ul>
          <li><strong>Provider:</strong> Google LLC</li>
          <li><strong>Purpose:</strong> Website analytics and performance measurement</li>
          <li><strong>Privacy Policy:</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
          <li><strong>Opt-out:</strong> You can opt-out of Google Analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a></li>
        </ul>

        <h3>4.2 Payment Processors</h3>
        <p>
          When making payments, our payment processors (CC Avenue, Stripe) may set cookies to process transactions 
          securely. These cookies are essential for payment functionality.
        </p>
      </section>

      <section>
        <h2>5. Managing Your Cookie Preferences</h2>
        <p>
          You have control over cookies. You can manage your preferences in the following ways:
        </p>
        
        <h3>5.1 Cookie Consent Banner</h3>
        <p>
          When you first visit our website, you will see a cookie consent banner. You can:
        </p>
        <ul>
          <li>Accept all cookies</li>
          <li>Accept only essential cookies</li>
          <li>Manage your preferences and choose which cookie categories to allow</li>
        </ul>
        <p>
          Your preferences are saved in your browser's localStorage and will be remembered for future visits.
        </p>

        <h3>5.2 Browser Settings</h3>
        <p>
          Most web browsers allow you to control cookies through their settings. You can:
        </p>
        <ul>
          <li>Block all cookies</li>
          <li>Block third-party cookies only</li>
          <li>Delete existing cookies</li>
          <li>Set your browser to notify you when cookies are set</li>
        </ul>
        <p>
          <strong>Note:</strong> Blocking essential cookies may affect website functionality. You may not be able to 
          log in or use certain features if essential cookies are disabled.
        </p>

        <h3>5.3 Browser-Specific Instructions</h3>
        <ul>
          <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
          <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
          <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
          <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
        </ul>
      </section>

      <section>
        <h2>6. LocalStorage and SessionStorage</h2>
        <p>
          In addition to cookies, WWC uses browser storage technologies:
        </p>
        
        <h3>6.1 LocalStorage</h3>
        <ul>
          <li><strong>JWT Tokens:</strong> Authentication tokens stored for login session management</li>
          <li><strong>Cookie Preferences:</strong> Your cookie consent choices</li>
          <li><strong>User Preferences:</strong> Interface settings and preferences</li>
        </ul>

        <h3>6.2 SessionStorage</h3>
        <p>
          Temporary data stored only for the duration of your browser session, automatically cleared when you close 
          the browser.
        </p>
        <p>
          You can clear localStorage and sessionStorage through your browser settings or by clearing browser data.
        </p>
      </section>

      <section>
        <h2>7. Impact of Disabling Cookies</h2>
        <p>
          If you choose to disable cookies, some features of our website may not function properly:
        </p>
        <ul>
          <li>You may not be able to log in to your member account</li>
          <li>Your preferences and settings may not be saved</li>
          <li>Some website features may not work as intended</li>
          <li>You may need to re-enter information repeatedly</li>
        </ul>
        <p>
          Essential cookies are required for basic website functionality and cannot be disabled without impacting 
          your ability to use our services.
        </p>
      </section>

      <section>
        <h2>8. Cookies and Personal Data</h2>
        <p>
          Most cookies we use do not directly identify you as an individual. However, when combined with other 
          information (such as your account login), cookies may be linked to your personal data.
        </p>
        <p>
          For information about how we handle your personal data, please see our <Link to="/privacy-policy">Privacy Policy</Link>.
        </p>
      </section>

      <section>
        <h2>9. Do Not Track Signals</h2>
        <p>
          Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want to 
          be tracked. Currently, there is no industry standard for how websites should respond to DNT signals.
        </p>
        <p>
          WWC does not currently respond to DNT signals. However, you can control tracking through our cookie 
          consent preferences and browser settings as described above.
        </p>
      </section>

      <section>
        <h2>10. Updates to This Cookie Policy</h2>
        <p>
          We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, 
          operational, or regulatory reasons. Material changes will be posted on this page with an updated 
          "Last updated" date.
        </p>
        <p>
          We encourage you to review this policy periodically to stay informed about our cookie practices.
        </p>
      </section>

      <section className="contact-section">
        <h2>11. Contact Us</h2>
        <p>
          If you have questions about our use of cookies or this Cookie Policy, please contact us:
        </p>
        <p>
          <strong>Email:</strong> <a href="mailto:privacy@wishwavesclub.com">privacy@wishwavesclub.com</a><br />
          <strong>Support:</strong> <a href="mailto:support@wishwavesclub.com">support@wishwavesclub.com</a><br />
          <strong>Website:</strong> <a href="https://wishwavesclub.com">www.wishwavesclub.com</a>
        </p>
        <p>
          For more information about data protection, see our <Link to="/privacy-policy">Privacy Policy</Link>.
        </p>
      </section>
    </LegalPage>
  )
}

export default CookiePolicy
