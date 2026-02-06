import React from 'react'
import LegalPage from '../components/LegalPage'

const TermsOfUse = () => {
  const title = 'Terms of Use | Wish Waves Club (WWC)'
  const description = 'Read the Terms of Use for Wish Waves Club membership platform. Learn about eligibility, membership terms, payments, activation, conduct rules, and termination policies.'
  const path = '/terms-of-use'
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
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using the Wish Waves Club ("WWC") website, membership platform, or NFC card services, 
          you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, you must 
          not use our services. Your continued use of WWC services constitutes acceptance of these terms and any 
          future modifications.
        </p>
      </section>

      <section>
        <h2>2. Eligibility and Membership Requirements</h2>
        <p>
          Membership in Wish Waves Club is available to individuals who meet the following criteria:
        </p>
        <ul>
          <li><strong>Age Requirement:</strong> You must be <strong>15 years of age or older</strong> to become a member.</li>
          <li><strong>Accurate Information:</strong> You must provide accurate, current, and complete information during registration and membership application.</li>
          <li><strong>Legal Capacity:</strong> You must have the legal capacity to enter into binding agreements in your jurisdiction.</li>
          <li><strong>One Account Per Person:</strong> Each individual may maintain only one active membership account.</li>
        </ul>
        <p>
          WWC reserves the right to verify your identity and eligibility at any time. Providing false information 
          may result in immediate termination of your membership without refund.
        </p>
      </section>

      <section>
        <h2>3. Membership Types and Pricing</h2>
        <p>
          Wish Waves Club offers two membership types:
        </p>
        <ul>
          <li><strong>Annual Membership:</strong> Valid for one year from the date of activation, renewable annually.</li>
          <li><strong>Lifetime Membership:</strong> Valid for the lifetime of the member, subject to these terms.</li>
        </ul>
        <div className="highlight-box">
          <p>
            <strong>Special Pricing:</strong> Lifetime membership may be available at special pricing for the first 
            1,000 members, subject to availability and promotional terms. This offer is limited and may be withdrawn 
            at any time without notice.
          </p>
        </div>
        <p>
          All membership fees are <strong>non-refundable and non-transferable</strong>. Membership benefits are 
          personal to the registered member and cannot be shared, transferred, or assigned to another individual.
        </p>
      </section>

      <section>
        <h2>4. Membership Activation</h2>
        <p>
          Your membership becomes active only after all of the following conditions are met:
        </p>
        <ol>
          <li><strong>Application Submission:</strong> You have completed and submitted the membership application form with all required information.</li>
          <li><strong>Payment Confirmation:</strong> Your payment has been successfully processed and confirmed through our authorized payment channels (bank transfer, credit card, or other approved methods).</li>
          <li><strong>Team Approval:</strong> Our team has reviewed and approved your application.</li>
          <li><strong>Account Verification:</strong> Your account has been verified and activated in our system.</li>
        </ol>
        <p>
          You will receive email confirmation once your membership is activated. Until activation is complete, 
          you do not have access to member benefits or services.
        </p>
      </section>

      <section>
        <h2>5. Payment Terms</h2>
        <p>
          All payments must be made through our authorized payment channels only. WWC does not accept payments 
          through unofficial channels, third-party agents, or any method not explicitly authorized on our website.
        </p>
        <ul>
          <li><strong>Payment Proof:</strong> For bank transfers, you may be required to provide proof of payment (receipt or transaction confirmation) for verification purposes.</li>
          <li><strong>Payment Verification:</strong> All payments are subject to verification. Processing may take 24-48 hours for bank transfers.</li>
          <li><strong>Fraud Prevention:</strong> Any attempt to defraud, manipulate payment systems, or use unauthorized payment methods will result in immediate suspension or cancellation of your membership without refund.</li>
          <li><strong>Failed Payments:</strong> If payment fails or is declined, your membership application will remain pending until successful payment is received.</li>
        </ul>
      </section>

      <section>
        <h2>6. Membership Benefits and Limitations</h2>
        <p>
          As a WWC member, you gain access to exclusive benefits including partner discounts, events, experiences, 
          and other privileges. However, please note:
        </p>
        <ul>
          <li><strong>Benefit Availability:</strong> Benefits are subject to availability and may vary based on partner relationships, seasonal changes, and operational considerations.</li>
          <li><strong>Partner Changes:</strong> WWC partners may change, and benefits may be modified, added, or removed at any time without prior notice.</li>
          <li><strong>Geographic Limitations:</strong> Some benefits may be limited to specific geographic regions or countries.</li>
          <li><strong>Capacity Restrictions:</strong> Events and experiences may have limited capacity and are available on a first-come, first-served basis.</li>
        </ul>
        <p>
          WWC reserves the right to modify, suspend, or discontinue any benefit or service at any time without 
          liability to members.
        </p>
      </section>

      <section>
        <h2>7. Events and Experiences</h2>
        <p>
          WWC organizes exclusive events and experiences for members. The following terms apply:
        </p>
        <ul>
          <li><strong>Booking Requirements:</strong> Advance booking may be required for events. Booking availability is subject to capacity limits.</li>
          <li><strong>Cancellation Policy:</strong> Event cancellations or changes may occur due to operational needs, partner availability, or force majeure circumstances.</li>
          <li><strong>Force Majeure:</strong> WWC is not liable for event cancellations or modifications due to circumstances beyond our control, including natural disasters, pandemics, government restrictions, or partner unavailability.</li>
          <li><strong>Member Conduct:</strong> Members must comply with event rules and codes of conduct. Violations may result in removal from events and membership termination.</li>
        </ul>
      </section>

      <section>
        <h2>8. Code of Conduct</h2>
        <p>
          All members are expected to maintain appropriate conduct when using WWC services, attending events, 
          or interacting with partners. Prohibited conduct includes:
        </p>
        <ul>
          <li>Harassment, abuse, or discrimination toward other members, WWC staff, or partner representatives</li>
          <li>Fraudulent use of membership benefits or NFC card</li>
          <li>Sharing or transferring membership access to unauthorized individuals</li>
          <li>Violation of partner terms and conditions</li>
          <li>Any illegal activity or violation of applicable laws</li>
        </ul>
        <p>
          Violation of the code of conduct may result in immediate termination of membership without refund.
        </p>
      </section>

      <section>
        <h2>9. Membership Termination</h2>
        <p>
          Your membership may be terminated in the following circumstances:
        </p>
        <ul>
          <li><strong>By You:</strong> You may cancel your membership at any time by contacting support. Cancellation does not entitle you to a refund of fees already paid.</li>
          <li><strong>By WWC:</strong> WWC may terminate your membership immediately, without refund, for violations of these terms, code of conduct, fraud, or any activity that harms WWC or its partners.</li>
          <li><strong>Non-Payment:</strong> Annual memberships that are not renewed by the expiry date will automatically terminate.</li>
        </ul>
        <p>
          Upon termination, all access to member benefits, services, and the member dashboard will be revoked. 
          Termination does not affect any obligations you may have incurred prior to termination.
        </p>
      </section>

      <section>
        <h2>10. Limitation of Liability</h2>
        <p>
          Wish Waves Club acts as a facilitator connecting members with third-party partners, experiences, and 
          services. WWC is not responsible for:
        </p>
        <ul>
          <li>The quality, safety, or delivery of third-party services, products, or experiences</li>
          <li>Disputes between members and partner vendors</li>
          <li>Changes to partner offerings, pricing, or availability</li>
          <li>Event cancellations or modifications due to force majeure</li>
          <li>Any indirect, incidental, or consequential damages arising from membership use</li>
        </ul>
        <p>
          To the maximum extent permitted by law, WWC's total liability for any claims related to membership 
          shall not exceed the amount of fees paid by you in the 12 months preceding the claim.
        </p>
      </section>

      <section>
        <h2>11. Intellectual Property</h2>
        <p>
          All content on the WWC website and platform, including text, graphics, logos, images, and software, 
          is the property of Wish Waves Club or its licensors and is protected by copyright and trademark laws. 
          You may not reproduce, distribute, or create derivative works without express written permission.
        </p>
      </section>

      <section>
        <h2>12. Modifications to Terms</h2>
        <p>
          WWC reserves the right to modify these Terms of Use at any time. Material changes will be posted on 
          this page with an updated "Last updated" date. Your continued use of WWC services after such modifications 
          constitutes acceptance of the updated terms.
        </p>
        <p>
          If you do not agree with any modifications, you must discontinue use of WWC services and may cancel 
          your membership (subject to non-refundable fee terms).
        </p>
      </section>

      <section>
        <h2>13. Governing Law and Jurisdiction</h2>
        <p>
          These Terms of Use are governed by and construed in accordance with the laws of the jurisdiction where 
          Wish Waves Club operates. Any disputes arising from or related to these terms or your membership shall 
          be subject to the exclusive jurisdiction of the courts in that jurisdiction.
        </p>
        <p>
          If any provision of these terms is found to be unenforceable, the remaining provisions shall continue 
          in full force and effect.
        </p>
      </section>

      <section className="contact-section">
        <h2>Contact Information</h2>
        <p>
          For questions about these Terms of Use, please contact us:
        </p>
        <p>
          <strong>Email:</strong> privacy@wishwavesclub.com<br />
          <strong>Website:</strong> <a href="https://wishwavesclub.com">www.wishwavesclub.com</a>
        </p>
        <p>
          For membership inquiries, visit our <a href="/support">Support Center</a> or contact 
          <a href="mailto:support@wishwavesclub.com">support@wishwavesclub.com</a>.
        </p>
      </section>
    </LegalPage>
  )
}

export default TermsOfUse

