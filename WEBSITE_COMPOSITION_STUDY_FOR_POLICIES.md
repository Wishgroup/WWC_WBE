# Wish Waves Club - Complete Website Composition Study for Policy Formulation

**Document Purpose**: Comprehensive study document for ChatGPT/AI to formulate Terms of Use, Privacy Policy, Security Policy, and Cookie Policy

**Website**: www.wishwavesclub.com  
**Last Updated**: January 2026  
**Version**: 1.0

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Website Overview & Business Model](#website-overview--business-model)
3. [Data Collection & Processing](#data-collection--processing)
4. [User Registration & Authentication](#user-registration--authentication)
5. [Payment Processing](#payment-processing)
6. [NFC Card Technology & Data](#nfc-card-technology--data)
7. [Third-Party Services & Integrations](#third-party-services--integrations)
8. [Cookies & Tracking Technologies](#cookies--tracking-technologies)
9. [Data Storage & Retention](#data-storage--retention)
10. [Security Measures](#security-measures)
11. [User Rights & Data Access](#user-rights--data-access)
12. [Geographic Data & Location Services](#geographic-data--location-services)
13. [Fraud Detection & Monitoring](#fraud-detection--monitoring)
14. [Vendor & Partner Data](#vendor--partner-data)
15. [Children's Privacy](#childrens-privacy)
16. [International Data Transfers](#international-data-transfers)
17. [Data Breach Procedures](#data-breach-procedures)
18. [Contact Information](#contact-information)

---

## 1. Executive Summary

**Wish Waves Club** is an exclusive membership platform offering premium lifestyle, travel, wellness, and experience benefits. The platform operates as a web-based application with NFC card technology for physical access and benefits redemption at partner vendors.

### Core Business Activities:
- Membership sales (Annual: USD 100/AED 370, Lifetime: USD 1,000/AED 3,700)
- NFC card issuance and management
- Partner vendor network management
- Dynamic offer and discount system
- Fraud detection and prevention
- Event management and access control

### Technology Stack:
- **Frontend**: React 18.2.0 (Single-Page Application)
- **Backend**: Node.js/Express.js API
- **Database**: MySQL (cPanel hosted) with MongoDB Atlas as alternative
- **Payment**: Stripe and CC Avenue payment gateways
- **Authentication**: JWT tokens, API keys
- **Security**: Helmet.js, rate limiting, bcrypt password hashing

---

## 2. Website Overview & Business Model

### Website Structure:
- **Domain**: www.wishwavesclub.com
- **Type**: Single-Page Application (SPA) with React Router
- **Hosting**: cPanel (frontend), Node.js backend server
- **Pages**: Home, Register, Login, Join (Membership Application), Benefits, Events, Admin Dashboard

### Membership Types:
1. **Annual Membership**: USD 100 (Approx. AED 370) per annum
2. **Lifetime Membership**: USD 1,000 (Approx. AED 3,700) one-time payment

### User Roles:
- **Members**: Registered users with active memberships
- **Vendors**: Partner businesses accepting NFC cards
- **Admins**: Platform administrators
- **Guests**: Unregistered visitors

### Business Operations:
- Membership registration and payment processing
- NFC card issuance, activation, and lifecycle management
- Real-time NFC validation at vendor POS systems
- Dynamic offer calculation and application
- Fraud detection and prevention
- Multi-country operations with country-specific rules
- Event management and access control

---

## 3. Data Collection & Processing

### Personal Information Collected During Registration:

#### Required Information:
- **Email Address** (unique identifier, used for login)
- **Password** (hashed with bcrypt, never stored in plain text)
- **Full Name** (or First Name + Last Name)
- **Mobile Number/Phone Number**
- **Membership Type** (Annual or Lifetime)
- **Date of Birth**
- **Nationality**
- **Gender**
- **Identification Document**:
  - ID Number (Emirates ID, Passport, etc.)
  - ID Type
  - ID Document Upload (image file)
- **Address Information**:
  - Street Address
  - City
  - Country
- **Emergency Contact Information**:
  - Emergency Contact Name
  - Emergency Contact Relationship
  - Emergency Contact Phone Number
- **Professional Information** (Optional):
  - Company Name
  - Job Title
  - Industry

### Payment Information:
- **Billing Details**:
  - Billing Name
  - Billing Email
  - Billing Phone
  - Billing Address
  - Billing City
  - Billing State/Province
  - Billing ZIP/Postal Code
  - Billing Country
- **Payment Amount**: Membership fee (USD 100 or USD 1,000)
- **Payment Method**: Credit/Debit card (processed by third-party gateways)
- **Payment Status**: Tracked (pending, completed, failed)
- **Transaction IDs**: Stored for payment reconciliation

**Note**: Full credit card details are NOT stored. Payment processing is handled by Stripe or CC Avenue payment gateways.

### Data Collected During NFC Card Usage:

#### NFC Tap Data:
- **Card UID** (Unique card identifier)
- **Vendor Information**:
  - Vendor ID
  - Vendor Name
  - Vendor Country
  - Vendor City
  - POS Reader ID
- **Location Data**:
  - Latitude (GPS coordinates)
  - Longitude (GPS coordinates)
  - Timestamp of tap
- **Transaction Data**:
  - Transaction Amount (if applicable)
  - Offer Applied (if any)
  - Discount Amount
- **Validation Results**:
  - Approval/Rejection status
  - Fraud Score
  - Fraud Flags
  - Validation Reason

### Automatically Collected Data:

#### Technical Data:
- **IP Address**: Collected for security, fraud prevention, and audit logging
- **User Agent**: Browser and device information
- **Device Information**: Implicit through user agent
- **Session Data**: JWT tokens stored in browser localStorage
- **API Keys**: Stored in localStorage for authenticated sessions

#### Usage Data:
- **Page Views**: Tracked through application navigation
- **Form Interactions**: Form submissions and field interactions
- **Authentication Events**: Login, logout, registration attempts
- **API Calls**: All API requests logged with timestamps
- **Error Logs**: Application errors and exceptions

#### Audit Logs:
- **Action Type**: All user actions (registration, login, payment, NFC tap, etc.)
- **Resource Type**: Type of resource accessed (member, card, payment, etc.)
- **Resource ID**: Identifier of the resource
- **User Type**: Admin, member, vendor, system, or API
- **Details**: JSON object with additional context
- **IP Address**: Source IP of the action
- **User Agent**: Browser/client information
- **Timestamp**: Exact time of action

### Data from Third Parties:
- **Payment Gateway Data**: Payment confirmation, transaction status from Stripe/CC Avenue
- **Geolocation Data**: May be enhanced with third-party geolocation services
- **Analytics Data**: If analytics services are integrated (currently not explicitly implemented)

---

## 4. User Registration & Authentication

### Registration Process:

1. **Initial Registration** (`/register`):
   - User provides: Email, Password, Full Name, Membership Type
   - Account created with "pending" status
   - JWT token generated (7-day expiration)
   - User redirected to membership application form

2. **Membership Application** (`/join`):
   - User completes detailed personal information form
   - All data saved to database (status: pending payment)
   - Form validation ensures required fields are completed
   - User accepts policies and agreements

3. **Payment Processing**:
   - User redirected to payment gateway (Stripe or CC Avenue)
   - Payment processed by third-party gateway
   - Webhook callback confirms payment success
   - Membership status updated to "active"
   - NFC card issued (if applicable)

### Authentication Methods:

#### Member Authentication:
- **JWT Tokens**: JSON Web Tokens with 7-day expiration
- **Password Authentication**: Bcrypt hashed passwords
- **Session Management**: Tokens stored in browser localStorage
- **Token Refresh**: Not currently implemented (user must re-login after expiration)

#### Vendor Authentication:
- **API Key Authentication**: Vendor-specific API keys
- **Header-Based**: `X-Vendor-API-Key` header required
- **Rate Limited**: Specific rate limits for vendor API calls

#### Admin Authentication:
- **API Key Authentication**: Admin-specific API keys
- **Header-Based**: `X-Admin-API-Key` header required
- **Role-Based Access**: Different admin roles (super_admin, admin)

### Account Management:
- **Password Changes**: Supported (requires current password)
- **Email Updates**: Supported (requires verification)
- **Account Deletion**: Supported (with data retention policies)
- **Account Suspension**: Admin can suspend accounts
- **Membership Cancellation**: Supported (with refund policies)

---

## 5. Payment Processing

### Payment Gateways:

#### 1. Stripe Integration:
- **Service Provider**: Stripe, Inc.
- **Data Shared**: Billing information, payment amount, order metadata
- **Payment Flow**:
  1. User initiates payment on website
  2. Frontend creates Stripe Checkout Session
  3. User redirected to Stripe payment page
  4. Stripe processes payment
  5. Webhook callback confirms payment
  6. Membership activated
- **Data Stored**: Payment session ID, transaction ID, payment status, amount
- **Card Data**: NOT stored by Wish Waves Club (handled entirely by Stripe)

#### 2. CC Avenue Integration:
- **Service Provider**: CC Avenue (CCAvenue)
- **Data Shared**: Billing information, payment amount, order ID
- **Payment Flow**:
  1. User initiates payment on website
  2. Backend creates encrypted payment request
  3. User redirected to CC Avenue payment page
  4. CC Avenue processes payment
  5. Redirect back to website with encrypted response
  6. Backend decrypts and verifies payment
  7. Membership activated
- **Data Stored**: Order ID, payment session ID, payment status, amount, encrypted response
- **Card Data**: NOT stored by Wish Waves Club (handled entirely by CC Avenue)

### Payment Data Retention:
- **Payment Sessions**: Stored in `payment_sessions` table
- **Transaction Records**: Permanent record for accounting and compliance
- **Billing Information**: Stored as part of member profile
- **Refund Records**: Tracked if applicable

### Payment Security:
- **PCI Compliance**: Payment gateways (Stripe, CC Avenue) are PCI-DSS compliant
- **No Card Storage**: Wish Waves Club does not store credit card numbers, CVV, or expiration dates
- **Encrypted Communication**: All payment data transmitted over HTTPS/TLS
- **Webhook Verification**: Stripe webhook signatures verified, CC Avenue encrypted responses verified

---

## 6. NFC Card Technology & Data

### NFC Card System:

#### Card Technology:
- **Card Type**: DESFire EV2 NFC cards
- **Card Storage**: 
  - **UID Only**: Unique card identifier stored on card
  - **Encrypted Token**: Backend-generated encrypted token stored on card
  - **NO Personal Data**: No personal information stored on card
  - **NO Membership Data**: No membership details on card
- **Backend Validation**: All validation performed server-side using card UID

#### Card Lifecycle:
1. **Card Issuance**: 
   - Card assigned to member after successful payment
   - Unique UID registered in database
   - Encrypted token generated and written to card
   - Card status: "active"

2. **Card Activation**: 
   - Card activated upon first successful validation
   - Activation timestamp recorded

3. **Card Usage**:
   - Card tapped at vendor POS system
   - UID read and sent to backend API
   - Backend validates card, member, and applies rules
   - Response sent to POS system

4. **Card Management**:
   - **Blocking**: Card can be blocked (fraud, lost, stolen)
   - **Unblocking**: Card can be unblocked by admin
   - **Reissuance**: New card issued, old UID blacklisted
   - **Replacement**: For lost, stolen, or damaged cards
   - **Expiration**: Cards can have expiration dates

#### Data Collected from NFC Cards:
- **Card UID**: Unique identifier (permanent, cannot be changed)
- **Tap Location**: GPS coordinates (latitude, longitude) when available
- **Tap Timestamp**: Exact time of each tap
- **Vendor Information**: Which vendor/partner location
- **Transaction Context**: Transaction amount, offer applied
- **Validation Results**: Approval/rejection, fraud score

#### Card Security:
- **AES-256-CBC Encryption**: Tokens encrypted with AES-256
- **UID Blacklisting**: Compromised UIDs permanently blacklisted
- **Token Rotation**: Tokens can be regenerated for security
- **No Personal Data on Card**: Privacy protection - card contains no PII

---

## 7. Third-Party Services & Integrations

### Payment Processors:

#### Stripe:
- **Purpose**: Payment processing
- **Data Shared**: Billing information, payment amount, order metadata
- **Privacy Policy**: https://stripe.com/privacy
- **Data Processing**: Payment processing, fraud prevention
- **Location**: United States (with global operations)

#### CC Avenue:
- **Purpose**: Payment processing (primarily for UAE/India)
- **Data Shared**: Billing information, payment amount, order ID
- **Privacy Policy**: https://www.ccavenue.com/privacy-policy
- **Data Processing**: Payment processing, transaction verification
- **Location**: India (with UAE operations)

### Hosting & Infrastructure:

#### cPanel Hosting:
- **Purpose**: Website hosting (frontend)
- **Data Stored**: Website files, static assets
- **Location**: cPanel server location (to be specified)

#### Database Hosting:
- **Primary**: MySQL on cPanel server
- **Alternative**: MongoDB Atlas (cloud-hosted)
- **Data Stored**: All user data, transactions, logs
- **Location**: Server location (to be specified)

### Potential Third-Party Services (Not Currently Explicitly Implemented):

#### Analytics Services:
- **Google Analytics**: Not currently implemented but may be added
- **Purpose**: Website usage analytics
- **Data Collected**: Page views, user interactions, device information

#### Email Services:
- **Email Provider**: May use services like SendGrid, Mailchimp, or AWS SES
- **Purpose**: Transactional emails, newsletters
- **Data Shared**: Email addresses, names

#### CDN Services:
- **Purpose**: Content delivery, performance optimization
- **Data**: Static assets, may collect IP addresses

---

## 8. Cookies & Tracking Technologies

### Current Cookie Usage:

#### Authentication Cookies:
- **JWT Tokens**: Stored in browser `localStorage` (not traditional cookies)
- **Purpose**: Maintain user login session
- **Expiration**: 7 days
- **Scope**: Application-wide

#### Session Storage:
- **API Keys**: Stored in `localStorage`
- **Purpose**: Maintain authenticated API sessions
- **Expiration**: Until user logs out or clears storage

### Browser Storage:
- **localStorage**: Used for JWT tokens, API keys, user preferences
- **sessionStorage**: May be used for temporary session data
- **IndexedDB**: Not currently used

### Tracking Technologies:

#### Server-Side Logging:
- **Audit Logs**: All actions logged server-side
- **Access Logs**: Web server access logs
- **Error Logs**: Application error logging

#### Client-Side Tracking:
- **Page Navigation**: Tracked through React Router
- **Form Interactions**: Tracked for analytics and error handling
- **No Third-Party Analytics**: Currently no Google Analytics or similar services explicitly implemented

### Cookie Categories (For Policy):

#### Essential Cookies:
- **Authentication Tokens**: Required for user login
- **Session Management**: Required for application functionality
- **Security Tokens**: Required for CSRF protection

#### Functional Cookies:
- **User Preferences**: Stored preferences (if implemented)
- **Language Settings**: Language selection (if implemented)

#### Analytics Cookies:
- **Usage Analytics**: Not currently implemented but may be added
- **Performance Monitoring**: Not currently implemented

#### Marketing Cookies:
- **Advertising**: Not currently implemented
- **Retargeting**: Not currently implemented

---

## 9. Data Storage & Retention

### Database Storage:

#### Primary Database: MySQL (cPanel)
- **Location**: cPanel server (location to be specified)
- **Tables**: 
  - `members`: User accounts and profiles
  - `nfc_cards`: NFC card information
  - `vendors`: Partner vendor information
  - `pos_readers`: POS device information
  - `nfc_tap_logs`: All NFC tap transactions
  - `fraud_events`: Fraud detection events
  - `offers`: Dynamic offer definitions
  - `offer_usage_logs`: Offer usage tracking
  - `payment_sessions`: Payment transaction records
  - `country_rules`: Country-specific business rules
  - `audit_logs`: Complete system audit trail
  - `admin_users`: Administrator accounts

#### Alternative Database: MongoDB Atlas
- **Location**: Cloud-hosted (MongoDB Atlas data center location)
- **Collections**: Similar structure to MySQL tables

### Data Retention Policies:

#### Active Member Data:
- **Retention**: For duration of membership + legal requirement period
- **Deletion**: Upon account deletion request (subject to legal requirements)

#### Payment Records:
- **Retention**: 7 years (accounting and tax compliance)
- **Deletion**: Not deleted (permanent record for compliance)

#### NFC Tap Logs:
- **Retention**: Indefinite (for fraud detection, analytics, business intelligence)
- **Deletion**: May be archived but not deleted

#### Audit Logs:
- **Retention**: Indefinite (for security, compliance, dispute resolution)
- **Deletion**: Not deleted (permanent audit trail)

#### Fraud Events:
- **Retention**: Indefinite (for security and fraud prevention)
- **Deletion**: Not deleted (security records)

#### Inactive Accounts:
- **Retention**: 3 years after last activity
- **Deletion**: After retention period, subject to legal requirements

#### Deleted Accounts:
- **Soft Delete**: Data marked as deleted but retained for 90 days
- **Hard Delete**: After 90 days, subject to legal requirements (payment records retained)

### Data Backup:
- **Frequency**: Regular backups (frequency to be specified)
- **Retention**: Backup retention period (to be specified)
- **Location**: Backup storage location (to be specified)
- **Encryption**: Backups encrypted (to be confirmed)

---

## 10. Security Measures

### Technical Security:

#### Authentication Security:
- **Password Hashing**: Bcrypt with salt (10 rounds)
- **JWT Tokens**: Signed with secret key, 7-day expiration
- **API Keys**: Secure random generation, stored hashed
- **Session Management**: Secure token storage, automatic expiration

#### Data Encryption:
- **In Transit**: HTTPS/TLS for all data transmission
- **At Rest**: Database encryption (to be confirmed)
- **NFC Tokens**: AES-256-CBC encryption for card tokens
- **Sensitive Data**: Passwords, API keys encrypted

#### Application Security:
- **Helmet.js**: Security headers (XSS protection, content type sniffing prevention, etc.)
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Protection against brute force and abuse
  - General API: 100 requests per 15 minutes
  - NFC Validation: Specific limits for vendor API
  - Admin API: Specific limits for admin operations
- **Input Validation**: Express-validator for all user inputs
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: Input sanitization, output encoding

#### Infrastructure Security:
- **Firewall**: Server firewall configuration (to be specified)
- **DDoS Protection**: Protection measures (to be specified)
- **SSL/TLS Certificates**: Valid SSL certificates for HTTPS
- **Security Headers**: 
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: SAMEORIGIN
  - X-XSS-Protection: 1; mode=block

### Operational Security:

#### Access Control:
- **Role-Based Access**: Admin, vendor, member roles
- **API Key Authentication**: Required for vendor and admin access
- **Principle of Least Privilege**: Users have minimum required access

#### Monitoring & Logging:
- **Audit Logging**: All actions logged with IP, user agent, timestamp
- **Error Logging**: Application errors logged
- **Security Event Monitoring**: Fraud events, suspicious activities logged
- **Access Logs**: Web server access logs

#### Fraud Prevention:
- **Real-Time Fraud Detection**: Rule-based fraud detection engine
- **Geo-Location Validation**: Location-based fraud detection
- **Tap Frequency Monitoring**: Excessive tap detection
- **Card Sharing Detection**: Multiple location detection
- **Fraud Scoring**: 0-100 fraud score calculation

---

## 11. User Rights & Data Access

### User Rights (GDPR/CCPA Compliance):

#### Right to Access:
- **Data Export**: Users can request copy of their data
- **Account Information**: Users can view their profile data
- **Transaction History**: Users can view payment and transaction history
- **NFC Tap History**: Users can view their NFC card usage history

#### Right to Rectification:
- **Profile Updates**: Users can update their personal information
- **Email Updates**: Users can change email (with verification)
- **Address Updates**: Users can update address information

#### Right to Erasure (Right to be Forgotten):
- **Account Deletion**: Users can request account deletion
- **Data Retention**: Some data retained for legal/compliance reasons
- **Payment Records**: Payment records retained for accounting (7 years)

#### Right to Data Portability:
- **Data Export**: Users can export their data in machine-readable format
- **Format**: JSON or CSV format (to be implemented)

#### Right to Object:
- **Marketing Communications**: Users can opt-out of marketing emails
- **Data Processing**: Users can object to certain data processing (subject to legal basis)

#### Right to Restrict Processing:
- **Account Suspension**: Users can request account suspension
- **Data Processing Limitation**: Can be implemented upon request

### Data Access Methods:

#### User Portal:
- **Member Dashboard**: Access to profile, transactions, NFC card status
- **Self-Service**: Users can update most information themselves

#### Data Requests:
- **Contact Method**: Email or contact form (to be specified)
- **Response Time**: Within 30 days (GDPR requirement)
- **Verification**: Identity verification required for data requests

---

## 12. Geographic Data & Location Services

### Location Data Collection:

#### NFC Tap Location:
- **GPS Coordinates**: Latitude and longitude collected when available
- **Purpose**: 
  - Fraud detection (geo-inconsistency detection)
  - Business analytics
  - Offer targeting
  - Compliance with country rules
- **Accuracy**: Depends on POS system GPS capability
- **Collection Method**: Provided by vendor POS system

#### IP Address Location:
- **IP Geolocation**: IP address used for approximate location
- **Purpose**: 
  - Security (fraud detection)
  - Audit logging
  - Rate limiting
  - Compliance
- **Accuracy**: City/country level (not precise)

#### Address Information:
- **User-Provided**: Street address, city, country from registration
- **Purpose**: 
  - Membership management
  - Billing
  - NFC card delivery
  - Compliance

### Location Data Usage:

#### Fraud Detection:
- **Geo-Inconsistency**: Detects impossible travel (e.g., card used in two distant locations within short time)
- **Country Rules**: Validates transactions against country-specific rules
- **Travel Patterns**: Analyzes normal vs. suspicious travel patterns

#### Business Operations:
- **Vendor Analytics**: Understanding vendor usage patterns
- **Offer Targeting**: Location-based offer eligibility
- **Compliance**: Ensuring transactions comply with country regulations

### Location Data Sharing:
- **Vendors**: Location data shared with vendors for transaction processing
- **Third Parties**: Not shared with third parties (except as required by law)

---

## 13. Fraud Detection & Monitoring

### Fraud Detection System:

#### Detection Methods:
1. **Geo-Inconsistency Detection**:
   - Detects impossible travel between locations
   - Calculates distance and time between taps
   - Flags suspicious patterns

2. **Excessive Tap Detection**:
   - Monitors tap frequency (taps per hour, per day)
   - Flags excessive usage patterns
   - Configurable thresholds

3. **Card Sharing Detection**:
   - Detects multiple simultaneous uses
   - Identifies unusual usage patterns
   - Flags potential card sharing

4. **Country Rule Violations**:
   - Validates against country-specific rules
   - Checks membership type eligibility
   - Validates discount caps

5. **Fraud Scoring**:
   - Calculates fraud score (0-100)
   - Combines multiple indicators
   - Triggers actions based on score thresholds

#### Fraud Status Levels:
- **Clean**: No fraud indicators (score 0-30)
- **Monitored**: Low risk, increased monitoring (score 31-60)
- **Restricted**: Medium risk, restrictions applied (score 61-90)
- **Blocked**: High risk, card/account blocked (score 91-100)

#### Automated Actions:
- **Logging**: All fraud events logged
- **Soft Restrictions**: Limited functionality for monitored accounts
- **Card Blocking**: Automatic card blocking for high-risk scores
- **Admin Alerts**: Administrators notified of high-severity events

#### Manual Review:
- **Admin Dashboard**: Administrators can review fraud events
- **Resolution**: Administrators can resolve false positives
- **Appeals**: Members can appeal fraud decisions (process to be specified)

### Fraud Data Retention:
- **Fraud Events**: Retained indefinitely for security
- **Tap Logs**: Retained for fraud analysis
- **Fraud Scores**: Historical scores retained

---

## 14. Vendor & Partner Data

### Vendor Information:

#### Vendor Registration:
- **Vendor Details**: Name, email, country, city, category
- **Vendor Code**: Unique identifier (used as API key)
- **Business Information**: Tax rates, currency, compliance status
- **POS Readers**: Registered POS/NFC reader devices

#### Vendor Data Collection:
- **Business Data**: Company information, contact details
- **Location Data**: Business address, country, city
- **Transaction Data**: All transactions processed through vendor
- **Analytics Data**: Vendor performance metrics

### Vendor Data Usage:
- **Transaction Processing**: Required for NFC validation
- **Analytics**: Business intelligence and reporting
- **Compliance**: Ensuring vendor compliance with terms
- **Support**: Customer support and issue resolution

### Vendor Data Sharing:
- **Members**: Limited vendor information shared (name, location)
- **Third Parties**: Not shared (except as required by law)
- **Analytics**: Aggregated, anonymized data may be used

---

## 15. Children's Privacy

### Age Restrictions:
- **Minimum Age**: Membership requires user to be 18 years or older (to be confirmed)
- **Age Verification**: Date of birth collected during registration
- **Parental Consent**: Not applicable (adults only service)

### Children's Data:
- **Collection**: No intentional collection of children's data
- **If Collected**: Would be deleted immediately upon discovery
- **COPPA Compliance**: Service not directed at children under 13

### Family Information:
- **Dependent Children**: Annual gifts for members' dependent children (benefit)
- **Data Collection**: May collect children's names/ages for gift purposes
- **Consent**: Parent/guardian consent required for children's data
- **Retention**: Children's data retained only as necessary for benefit delivery

---

## 16. International Data Transfers

### Data Transfers:

#### Cross-Border Transfers:
- **Payment Processors**: Stripe (US), CC Avenue (India/UAE)
- **Database Hosting**: cPanel server location, MongoDB Atlas location
- **Vendor Operations**: Multi-country vendor network

#### Transfer Mechanisms:
- **Adequate Safeguards**: Standard contractual clauses (to be confirmed)
- **Privacy Shield**: Not applicable (program invalidated)
- **Binding Corporate Rules**: Not applicable
- **Consent**: User consent through terms acceptance

#### Countries of Operation:
- **Primary**: United Arab Emirates (UAE)
- **Secondary**: Multiple countries (vendor network)
- **Data Processing**: May occur in multiple jurisdictions

### Compliance:
- **GDPR**: Compliance with EU GDPR (if applicable)
- **Local Laws**: Compliance with UAE data protection laws
- **Other Jurisdictions**: Compliance with local laws in countries of operation

---

## 17. Data Breach Procedures

### Breach Detection:
- **Monitoring**: Continuous security monitoring
- **Alerts**: Automated alerts for suspicious activities
- **Audit Logs**: Regular review of audit logs
- **Incident Response**: Defined incident response procedures

### Breach Response:
1. **Immediate Containment**: Isolate affected systems
2. **Assessment**: Determine scope and impact
3. **Notification**:
   - **Regulators**: Notify within 72 hours (GDPR requirement)
   - **Users**: Notify affected users without undue delay
   - **Vendors**: Notify affected vendors if applicable
4. **Remediation**: Fix vulnerabilities, restore systems
5. **Documentation**: Document breach and response
6. **Review**: Post-incident review and improvements

### User Notification:
- **Method**: Email notification to affected users
- **Content**: 
  - Nature of breach
  - Data affected
  - Steps taken
  - User actions recommended
- **Timing**: Without undue delay (within 72 hours where feasible)

---

## 18. Contact Information

### Data Protection Officer (if applicable):
- **Name**: [To be specified]
- **Email**: [To be specified]
- **Address**: [To be specified]

### Privacy Inquiries:
- **Email**: [To be specified - e.g., privacy@wishwavesclub.com]
- **Phone**: [To be specified]
- **Address**: [Company address to be specified]

### General Contact:
- **Website**: www.wishwavesclub.com
- **Support**: [Support email/contact to be specified]
- **Business Address**: [To be specified]

### Regulatory Authority:
- **UAE**: [UAE data protection authority to be specified]
- **EU**: [EU supervisory authority if applicable]

---

## Additional Notes for Policy Formulation

### Key Legal Considerations:

1. **Jurisdiction**: Primary jurisdiction is UAE, with potential EU/GDPR implications
2. **Membership Agreement**: Terms should cover membership benefits, cancellation, refunds
3. **NFC Card Terms**: Specific terms for NFC card usage, loss, replacement
4. **Payment Terms**: Refund policy, chargeback policy, payment disputes
5. **Vendor Terms**: Separate vendor agreement terms
6. **Intellectual Property**: Website content, trademarks, copyrights
7. **Liability Limitations**: Service availability, third-party services, force majeure
8. **Dispute Resolution**: Arbitration, jurisdiction, governing law

### Policy Update Procedures:
- **Notification Method**: Email notification or website notice
- **Effective Date**: Policies effective upon posting
- **Version Control**: Version numbers and update dates
- **User Consent**: Continued use constitutes acceptance

### Compliance Requirements:
- **GDPR**: If processing EU residents' data
- **CCPA**: If processing California residents' data
- **UAE Data Protection Law**: UAE-specific requirements
- **PCI-DSS**: Payment card industry compliance (via payment processors)
- **Industry Standards**: Best practices for membership platforms

---

## Document Metadata

**Created**: January 2026  
**Last Updated**: January 2026  
**Version**: 1.0  
**Status**: Complete  
**Next Review**: [To be scheduled]  
**Owner**: Wish Waves Club Legal/Compliance Team

---

**End of Document**
