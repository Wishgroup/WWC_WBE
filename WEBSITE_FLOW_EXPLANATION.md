# 🌊 Wish Waves Club - Complete Website Flow Explanation

## 📍 Overview

This document explains the complete user journey from the moment someone visits the website to becoming a member and accessing their dashboard.

---

## 🚀 **PHASE 1: User Enters the Website**

### Step 1: Initial Page Load

**What Happens:**
1. User types `https://wishwavesclub.com` in browser
2. Browser requests the website from the server
3. Server returns `index.html` (React application)
4. React app loads and initializes

**Technical Details:**
- **Frontend:** React application built with Vite
- **Entry Point:** `src/main.jsx` → `src/App.jsx`
- **Authentication Check:** `AuthContext` checks if user has a stored token
- **Routing:** React Router determines which page to show

**Files Involved:**
- `src/main.jsx` - Application entry point
- `src/App.jsx` - Main routing component
- `src/contexts/AuthContext.jsx` - Authentication state management

---

## 🏠 **PHASE 2: Homepage Experience**

### Step 2: Homepage Display

**URL:** `https://wishwavesclub.com/` or `/`

**What User Sees:**
1. **Header** - Navigation bar with logo, menu items
2. **Hero Section** - Eye-catching banner with call-to-action
3. **Intro Section** - Introduction to Wish Waves Club
4. **Three Pillars** - Core values/benefits
5. **Memberships** - Membership tiers (Annual/Lifetime)
6. **Features** - Key features and benefits
7. **Value Program** - Additional value propositions
8. **Footer** - Links, newsletter signup ("Stay Connected" form)

**Components Loaded:**
- `src/pages/Home.jsx`
- `src/components/Header.jsx`
- `src/components/Hero.jsx`
- `src/components/Footer.jsx`
- Various feature components

**User Actions Available:**
- Click "Join Now" → Goes to `/join`
- Click "Login" → Goes to `/login`
- Browse benefits/features
- Subscribe to newsletter (footer form)

---

## 📧 **PHASE 3: Newsletter Subscription (Footer Form)**

### Step 3: "Stay Connected" Form Submission

**What Happens:**
1. User enters email in footer newsletter form
2. Clicks "Submit" button
3. Frontend validates email format
4. API call to: `POST /api/contact/subscribe`

**Backend Processing:**
1. Validates email format
2. Checks if email already subscribed
3. Saves to `newsletter_subscriptions` table
4. Sends thank you email via `EmailService.sendSubscriptionThankYou()`

**Email Sent:**
- **To:** User's email
- **Subject:** "Thank You for Subscribing to Wish Waves Club"
- **Content:** Welcome message and information about updates

**Result:**
- Success message displayed to user
- Email saved in database
- Thank you email sent immediately

**Files Involved:**
- `src/components/Footer.jsx` - Form component
- `backend/routes/contact.js` - Subscription endpoint
- `backend/services/EmailService.js` - Email sending

---

## 🎯 **PHASE 4: User Wants to Join**

### Step 4: Navigate to Join Page

**URL:** `https://wishwavesclub.com/join`

**What User Sees:**
- Branding section (left side)
- Membership registration form (right side)
- Multi-step form with validation

**Form Steps:**
1. **Step 1:** Personal Information
   - First Name, Last Name
   - Date of Birth
   - Nationality
   - Gender
   - ID Type (Emirates ID/Passport)
   - ID Number
   - ID Upload (optional)

2. **Step 2:** Contact Details
   - Mobile Number
   - Email Address
   - Address
   - Country

3. **Step 3:** Membership Selection
   - Annual Membership (AED 1,000/year)
   - Lifetime Membership (AED 5,000 one-time)

4. **Step 4:** Professional Information (Optional)
   - Company
   - Job Title
   - Industry

5. **Step 5:** Emergency Contact
   - Name
   - Relationship
   - Phone Number

6. **Step 6:** Policies & Agreements
   - Terms of Service
   - Privacy Policy
   - Data Protection
   - Marketing Consent

**Files Involved:**
- `src/pages/Join.jsx` - Join page container
- `src/components/MembershipForm.jsx` - Main form component

---

## 💳 **PHASE 5: Registration & Payment Flow**

### Step 5: User Submits Registration Form

**What Happens:**

1. **Form Validation:**
   - All required fields validated
   - Email format checked
   - Phone number validated
   - Policies must be accepted

2. **Save Personal Info:**
   - API call: `POST /api/auth/save-personal-info`
   - Backend saves to database temporarily
   - Returns `userId` for payment

3. **Payment Initiation:**
   - API call: `POST /api/payment/ccavenue/initiate`
   - Backend processes:
     - Creates unique `order_id`
     - Saves form data to `payment_sessions` table
     - Encrypts payment data using CC Avenue encryption
     - Generates payment URL

4. **Redirect to CC Avenue:**
   - Frontend creates hidden form
   - Submits to CC Avenue payment gateway
   - User redirected to secure payment page

**Backend Processing:**
- `backend/routes/payment.js` - Payment initiation endpoint
- `backend/services/CCAvenueService.js` - Payment encryption
- Data saved to `payment_sessions` table (NOT to members table yet)

**Files Involved:**
- `src/components/MembershipForm.jsx` - Form submission
- `backend/routes/payment.js` - Payment endpoint
- `backend/services/CCAvenueService.js` - CC Avenue integration

---

## 🔐 **PHASE 6: Payment Processing**

### Step 6: User Completes Payment on CC Avenue

**What Happens:**
1. User enters card details on CC Avenue secure page
2. CC Avenue processes payment
3. Payment result determined (Success/Failure)

**Payment Scenarios:**

#### ✅ **Success Scenario:**
1. CC Avenue redirects back to: `https://wishwavesclub.com/payment/response?encResponse=...`
2. Frontend `PaymentSuccess` component loads
3. API call: `POST /api/payment/ccavenue/response`
4. Backend processes:
   - Decrypts payment response
   - Verifies payment status
   - **ONLY IF SUCCESS:**
     - Saves membership application to `membership_applications` table
     - Creates member account in `members` table
     - Updates payment session status
     - Sends welcome email
   - Logs audit trail

#### ❌ **Failure Scenario:**
1. CC Avenue redirects with failure status
2. Backend receives failure response
3. **Data NOT saved** to members table
4. Payment session marked as failed
5. User sees error message

**Files Involved:**
- `src/pages/PaymentSuccess.jsx` - Payment response handler
- `backend/routes/payment.js` - Payment response endpoint
- `backend/services/EmailService.js` - Welcome email

---

## 📧 **PHASE 7: Post-Payment Email Notifications**

### Step 7: Automatic Email Sending

**If Payment Successful:**

1. **Welcome Email Sent:**
   - **To:** User's email address
   - **Subject:** "Welcome to Wish Waves Club - Welcome to the Oceanic Lifestyle"
   - **Content:**
     - Personalized welcome message
     - Membership details (type, status)
     - Link to member dashboard
     - Contact information
   - **Triggered by:** `EmailService.sendWelcomeEmail()`

2. **Email Configuration:**
   - **SMTP Server:** `mail.wishwavesclub.com:465`
   - **From:** `info@wishwavesclub.com`
   - **Encryption:** SSL/TLS

**Files Involved:**
- `backend/services/EmailService.js` - Email service
- `backend/routes/payment.js` - Calls email service after successful payment

---

## 🔑 **PHASE 8: User Logs In**

### Step 8: Login Process

**URL:** `https://wishwavesclub.com/login`

**What Happens:**

1. **User Enters Credentials:**
   - Email address
   - Password
   - User type (Member/Admin/Vendor)

2. **Form Submission:**
   - API call: `POST /api/auth/login`
   - Backend validates:
     - Email exists in database
     - Password matches (bcrypt hash)
     - Account is active

3. **Backend Processing:**
   - Verifies credentials
   - Generates JWT token
   - Checks account status
   - Determines access level
   - **Sends login notification email**

4. **Login Notification Email:**
   - **To:** User's email
   - **Subject:** "Login Notification - Wish Waves Club"
   - **Content:**
     - Login confirmation
     - Login time and IP address
     - Security notice
   - **Triggered by:** `EmailService.sendLoginNotification()`

5. **Frontend Response:**
   - Token saved to `localStorage`
   - User data stored in `AuthContext`
   - Redirect based on role:
     - Member → `/member/dashboard`
     - Admin → `/admin/dashboard`
     - Vendor → `/vendor/dashboard`

**Account Status Checks:**
- If payment pending → Redirect to `/payment/pending`
- If application pending → Redirect to `/application/pending`
- If rejected → Redirect to `/application/rejected`
- If active → Access granted to dashboard

**Files Involved:**
- `src/pages/Login.jsx` - Login page
- `src/contexts/AuthContext.jsx` - Authentication logic
- `backend/routes/auth.js` - Login endpoint
- `backend/services/EmailService.js` - Login notification email

---

## 👤 **PHASE 9: Member Dashboard Access**

### Step 9: Accessing Protected Routes

**URL:** `https://wishwavesclub.com/member/dashboard`

**What Happens:**

1. **Route Protection:**
   - `ProtectedRoute` component checks authentication
   - Verifies user has valid token
   - Checks user role matches required role
   - Validates account status

2. **If Not Authenticated:**
   - Redirects to `/login`

3. **If Authenticated:**
   - Loads `MemberDashboard` component
   - Fetches member data from API
   - Displays dashboard content

**Member Dashboard Features:**
- Profile information
- Membership details
- NFC card status (if issued)
- Upcoming events
- Available offers
- Transaction history
- Account settings

**Files Involved:**
- `src/components/ProtectedRoute.jsx` - Route protection
- `src/pages/MemberDashboard.jsx` - Dashboard component
- `backend/routes/auth.js` - User data endpoint

---

## 🔄 **PHASE 10: Ongoing User Interactions**

### Step 10: Various User Actions

**Newsletter Subscription:**
- User subscribes via footer form
- Thank you email sent immediately
- Email saved to database

**Contact/Inquiry Submission:**
- User submits contact form
- Inquiry saved to `contact_inquiries` table
- Email sent to `info@wishwavesclub.com`
- Reply-to set to user's email

**Event Registration:**
- User views events page
- Registers for event
- Check-in via NFC card (if applicable)

**NFC Card Usage:**
- Member uses NFC card at vendor location
- Card validated via API
- Transaction logged
- Fraud detection checks performed

---

## 📊 **Complete Flow Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ENTERS WEBSITE                       │
│              https://wishwavesclub.com                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    HOMEPAGE LOADS                            │
│  • Header with navigation                                    │
│  • Hero section                                              │
│  • Features & benefits                                       │
│  • Membership tiers                                          │
│  • Footer with newsletter form                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌───────────────┐          ┌──────────────────────┐
│  CLICKS JOIN  │          │  SUBSCRIBES TO       │
│               │          │  NEWSLETTER          │
└───────┬───────┘          └──────────┬───────────┘
        │                             │
        │                             ▼
        │                  ┌──────────────────────┐
        │                  │  Email Saved to DB   │
        │                  │  Thank You Email     │
        │                  │  Sent Immediately    │
        │                  └──────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│              REGISTRATION FORM (Multi-Step)                  │
│  Step 1: Personal Info                                      │
│  Step 2: Contact Details                                     │
│  Step 3: Membership Selection                                │
│  Step 4: Professional Info (Optional)                       │
│  Step 5: Emergency Contact                                   │
│  Step 6: Policies & Agreements                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              FORM SUBMITTED                                  │
│  • Personal info saved to DB                                │
│  • Payment session created                                  │
│  • Data encrypted for CC Avenue                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         REDIRECTED TO CC AVENUE                              │
│         (Secure Payment Gateway)                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌───────────────┐          ┌──────────────────────┐
│  PAYMENT      │          │  PAYMENT              │
│  SUCCESS      │          │  FAILED               │
└───────┬───────┘          └──────────┬───────────┘
        │                             │
        │                             ▼
        │                  ┌──────────────────────┐
        │                  │  Data NOT Saved       │
        │                  │  Error Message        │
        │                  └──────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│         REDIRECTED BACK TO WEBSITE                           │
│         /payment/response?encResponse=...                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         BACKEND PROCESSES PAYMENT                            │
│  • Decrypts payment response                                 │
│  • Verifies payment status                                   │
│  • IF SUCCESS:                                               │
│    - Saves to membership_applications                        │
│    - Creates member account                                  │
│    - Sends welcome email                                     │
│  • IF FAILED:                                                │
│    - Marks payment as failed                                 │
│    - Does NOT save data                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              WELCOME EMAIL SENT                              │
│  To: user@example.com                                        │
│  Subject: Welcome to Wish Waves Club                        │
│  Content: Membership details + dashboard link                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              USER LOGS IN                                    │
│  • Credentials validated                                     │
│  • JWT token generated                                       │
│  • Login notification email sent                             │
│  • Redirected to dashboard                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              MEMBER DASHBOARD                                 │
│  • Profile information                                       │
│  • Membership details                                        │
│  • Events & offers                                           │
│  • Account management                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 **Security & Authentication Flow**

### Authentication State Management

**Initial Load:**
1. `AuthContext` checks `localStorage` for token
2. If token exists, validates with backend: `GET /api/auth/me`
3. User data loaded into context
4. Account status determined

**Protected Routes:**
- `ProtectedRoute` component wraps protected pages
- Checks: Authentication → Role → Account Status
- Redirects if any check fails

**Token Storage:**
- Stored in `localStorage` (persists across sessions)
- Sent in `Authorization: Bearer <token>` header
- Expires after 7 days (configurable)

---

## 📧 **Email Flow Summary**

### All Email Triggers

1. **Newsletter Subscription:**
   - Trigger: User submits email in footer
   - Email: "Thank You for Subscribing"
   - Sent: Immediately

2. **Registration Welcome:**
   - Trigger: Successful payment completion
   - Email: "Welcome to Wish Waves Club"
   - Sent: After payment verification

3. **Login Notification:**
   - Trigger: User successfully logs in
   - Email: "Login Notification"
   - Sent: Immediately after login
   - Includes: Login time, IP address

4. **Contact Inquiry:**
   - Trigger: User submits contact form
   - Email: Inquiry details
   - Sent: To `info@wishwavesclub.com`
   - Reply-to: User's email

---

## 🗄️ **Database Flow**

### Data Storage Timeline

**During Registration:**
- Form data → `payment_sessions` table (temporary)
- Status: `pending`

**After Payment Success:**
- Membership data → `membership_applications` table
- User account → `members` table
- Payment record → `payment_sessions` (updated)
- Status: `active` / `paid`

**After Payment Failure:**
- Data remains in `payment_sessions` only
- Status: `failed`
- No member account created

---

## 🎯 **Key Points to Remember**

1. **Data is ONLY saved after successful payment**
   - Registration form data is stored temporarily
   - Member account created only after payment success

2. **Email notifications are automatic**
   - Newsletter subscription → Thank you email
   - Successful payment → Welcome email
   - Login → Notification email
   - Contact form → Inquiry email to admin

3. **Authentication is role-based**
   - Members, Admins, and Vendors have different dashboards
   - Account status determines access level

4. **Payment is secure**
   - CC Avenue handles all payment processing
   - No card details stored on our servers
   - Encrypted communication

5. **All actions are logged**
   - Audit trail for all important actions
   - Fraud detection on transactions
   - Security monitoring

---

## 📱 **Mobile & Responsive Design**

- All pages are responsive
- Works on desktop, tablet, and mobile
- Touch-friendly interface
- Optimized for all screen sizes

---

## 🚀 **Performance Optimizations**

- React code splitting
- Lazy loading of components
- Optimized images and assets
- Caching strategies
- API rate limiting

---

This flow ensures a smooth, secure, and user-friendly experience from initial visit to active membership! 🌊




