# Smoke Test Checklist - Wish Waves Club Final Product

**Purpose**: High-level smoke test checklist to verify core flows after each implementation phase.

**Usage**: After each phase completion, run through relevant test cases to ensure core functionality works.

---

## Pre-Implementation Baseline Tests

### Authentication & Authorization
- [ ] Member can register via `/api/auth/register`
- [ ] Member can login via `/api/auth/login`
- [ ] Admin can login via `/api/auth/login` (userType='admin')
- [ ] Vendor can login via `/api/auth/login` (userType='vendor')
- [ ] `/api/auth/me` returns user info with JWT
- [ ] Protected routes require authentication
- [ ] Role-based routing works (member → member dashboard, admin → admin dashboard)

### Payment Flow
- [ ] Payment session can be created
- [ ] CC Avenue payment initiation works
- [ ] Payment webhook processes successfully
- [ ] Payment success updates member status

### NFC Validation
- [ ] `/api/nfc/validate` endpoint exists
- [ ] Vendor API key authentication works
- [ ] NFC validation returns response

### Database
- [ ] Database connection works
- [ ] All core tables exist (members, vendors, nfc_cards, etc.)
- [ ] Can query members table
- [ ] Can query vendors table

---

## Phase 1 - Active Gating Enforcement

### Backend Tests
- [ ] **Login with inactive member**
  - Member with `membership_status='pending'` cannot login
  - Returns `allowed: false` in response
  - Returns appropriate `next_action`

- [ ] **Login with active member**
  - Member with `membership_status='active'` AND `payment_status='success'` can login
  - Returns `allowed: true`
  - Returns `next_action: '/member/dashboard'`

- [ ] **Login with expired member**
  - Member with expired subscription cannot login
  - Returns `allowed: false`

- [ ] **`/api/auth/me` returns status**
  - Returns `{ role, allowed, account_status, next_action }`
  - Status reflects current membership/vendor state

- [ ] **Middleware blocks inactive users**
  - `requireActiveMember` blocks inactive members from protected routes
  - `requireActiveVendor` blocks inactive vendors from protected routes
  - Returns 403 with appropriate message

### Frontend Tests
- [ ] **ProtectedRoute redirects based on status**
  - Inactive member → redirects to `/application/pending`
  - Rejected member → redirects to `/application/rejected`
  - Active member → allows access to dashboard

- [ ] **Status pages exist and render**
  - `/application/submitted` page exists
  - `/application/pending` page exists
  - `/application/rejected` page exists
  - `/payment/pending` page exists (if needed)

- [ ] **AuthContext handles status**
  - `fetchUser()` calls `/api/auth/me`
  - Status is stored in context
  - Status changes trigger re-routing

### Integration Tests
- [ ] **End-to-end: Inactive member flow**
  1. Register new member
  2. Payment succeeds (status='submitted')
  3. Try to access `/member/dashboard`
  4. Should redirect to `/application/pending`

- [ ] **End-to-end: Active member flow**
  1. Admin approves member
  2. Member logs in
  3. Should access `/member/dashboard` successfully

---

## Phase 2 - Unified Applications + Admin Approval Queue

### Backend Tests
- [ ] **Payment sets status to 'submitted'**
  - CC Avenue payment success → `membership_status='submitted'`
  - Stripe payment success → `membership_status='submitted'`
  - Bank transfer → `membership_status='submitted'`

- [ ] **Work queue endpoint**
  - `GET /api/admin/work-queue` returns pending applications
  - Returns card issuance pending items
  - Returns bank transfer receipts pending approval

- [ ] **Admin approval endpoint**
  - `POST /api/admin/applications/:id/approve` works
  - Sets `membership_status='active'` or `vendor_status='active'`
  - Sets `payment_status='success'`
  - Sends acceptance email

- [ ] **Admin rejection endpoint**
  - `POST /api/admin/applications/:id/reject` works
  - Sets status to 'rejected'
  - Does NOT send acceptance email

- [ ] **Vendor application**
  - Vendor can submit application
  - Application stored in database
  - Status starts as 'pending'

### Frontend Tests
- [ ] **Admin work queue UI**
  - Work queue page displays pending applications
  - Can approve applications
  - Can reject applications
  - Shows card issuance pending

- [ ] **Member sees submitted state**
  - After payment, member sees "Application Submitted"
  - After admin approval, member sees active status

### Integration Tests
- [ ] **End-to-end: Member application flow**
  1. Member registers
  2. Member pays
  3. Status = 'submitted'
  4. Admin views work queue
  5. Admin approves
  6. Status = 'active'
  7. Acceptance email sent
  8. Member can access dashboard

- [ ] **End-to-end: Vendor application flow**
  1. Vendor submits application
  2. Vendor pays fee
  3. Status = 'submitted'
  4. Admin approves
  5. Status = 'active'
  6. Vendor can access dashboard

---

## Phase 3 - Cards Module

### Backend Tests
- [ ] **Card prepare endpoint**
  - `POST /api/admin/cards/prepare` generates payload
  - Payload includes: `member_public_id`, `card_public_id`, `tier`, `expires_at`, `key_version`, `nonce`, `issued_at`
  - Generates HMAC-SHA256 signature
  - Creates issue session

- [ ] **Card confirm endpoint**
  - `POST /api/admin/cards/confirm` updates card status
  - Card stored in database with payload + signature
  - Issue session marked as 'confirmed'

- [ ] **Card validation verifies signature**
  - Card validation checks signature (not just UID)
  - Invalid signature → rejection
  - Valid signature → approval

- [ ] **Card credential structure**
  - Payload is valid JSON
  - Signature is HMAC-SHA256(payload, CARD_SIGNING_SECRET_vX)
  - Key version is tracked

### Frontend Tests
- [ ] **Admin card issuance page**
  - Can prepare card payload
  - Displays `issueSessionId` and `card_public_id`
  - Shows "Tap card using Issuer Bridge" instructions

### Integration Tests
- [ ] **End-to-end: Card issuance flow**
  1. Admin prepares card for member
  2. Payload + signature generated
  3. Admin writes to physical card (via local bridge)
  4. Admin confirms issuance
  5. Card stored in database
  6. Card can be validated with signature

---

## Phase 4 - NFC Validate/Redeem with POS Device Auth

### Backend Tests
- [ ] **POS device authentication**
  - `X-POS-READER-ID` header required
  - `X-POS-DEVICE-KEY` header required
  - Device key is hashed in database
  - Invalid device key → 401

- [ ] **Validate endpoint (fast)**
  - `POST /api/nfc/validate` verifies signature
  - Checks active status
  - Returns offer quote
  - Does NOT send notifications
  - Response time < 100ms

- [ ] **Redeem endpoint**
  - `POST /api/nfc/redeem` commits redemption
  - Requires device authentication
  - Idempotent (same `invoice_id` → returns existing redemption)
  - Enqueues notifications (email + SMS)
  - Creates redemption record

- [ ] **Idempotency**
  - Same `vendor_id` + `invoice_id` → returns existing redemption
  - Does NOT create duplicate redemption

### Frontend Tests
- [ ] **Vendor POS readers management**
  - Can list POS readers
  - Can register new POS reader
  - Can view device keys

- [ ] **Vendor transactions**
  - Can view transaction history
  - Shows validations + redemptions
  - Filters by date/reader

### Integration Tests
- [ ] **End-to-end: Validation flow**
  1. POS device authenticates
  2. Card tapped
  3. Signature verified
  4. Status checked
  5. Offer calculated
  6. Response returned (< 100ms)

- [ ] **End-to-end: Redemption flow**
  1. POS device authenticates
  2. Card tapped
  3. Redemption committed
  4. Notification enqueued
  5. Idempotency enforced

---

## Phase 5 - Events Module

### Backend Tests
- [ ] **Event check-in endpoint**
  - `POST /api/events/checkin` verifies:
    - Membership active
    - Time window valid
    - Tier eligible
    - Anti-passback (if enabled)
  - Creates check-in record
  - Enqueues notifications

- [ ] **Event rules validation**
  - Tier eligibility checked
  - Time window enforced
  - Anti-passback prevents duplicate entry

- [ ] **Admin event management**
  - `GET /api/admin/events` lists events
  - `POST /api/admin/events` creates event
  - `PUT /api/admin/events/:id` updates event
  - `GET /api/admin/events/:id/checkins` shows check-in logs

### Frontend Tests
- [ ] **Admin events management UI**
  - Can create events
  - Can update events
  - Can view check-in logs

- [ ] **Member usage page**
  - Shows event check-ins
  - Shows redemptions
  - Filters by date

### Integration Tests
- [ ] **End-to-end: Event check-in flow**
  1. Admin creates event with rules
  2. Member taps card at event
  3. Time window checked
  4. Tier eligibility checked
  5. Anti-passback checked
  6. Check-in recorded
  7. Notification enqueued

---

## Phase 6 - Notifications Outbox + Worker

### Backend Tests
- [ ] **Notification outbox**
  - `notifications_outbox` table exists
  - Notifications enqueued on redeem
  - Notifications enqueued on event check-in
  - Status = 'pending' initially

- [ ] **Worker process**
  - Worker processes pending notifications
  - Email sent via existing SMTP service
  - SMS logged (mock implementation)
  - Status updated to 'sent' or 'failed'
  - Retry logic works (on failure)

- [ ] **SMS provider interface**
  - Provider-agnostic interface exists
  - Mock implementation logs SMS
  - Ready for real SMS provider integration

- [ ] **Notification enqueue service**
  - `enqueueNotification()` function exists
  - Supports email channel
  - Supports SMS channel
  - Template-based (redeem_success, event_checkin)

### Integration Tests
- [ ] **End-to-end: Notification flow**
  1. Redemption occurs
  2. Notification enqueued (status='pending')
  3. Worker processes notification
  4. Email sent via SMTP
  5. SMS logged (mock)
  6. Status updated to 'sent'

- [ ] **End-to-end: Event check-in notification**
  1. Event check-in occurs
  2. Notification enqueued
  3. Worker processes
  4. Email + SMS sent

---

## Post-Implementation Full System Tests

### Complete User Flows

#### Member Onboarding Flow
1. [ ] Member registers
2. [ ] Member fills details
3. [ ] Member pays fee
4. [ ] Status = 'submitted'
5. [ ] Member sees "Application Submitted"
6. [ ] Admin approves
7. [ ] Acceptance email sent
8. [ ] Status = 'active'
9. [ ] Member can access dashboard

#### Vendor Onboarding Flow
1. [ ] Vendor submits application
2. [ ] Vendor pays fee
3. [ ] Status = 'submitted'
4. [ ] Admin approves
5. [ ] Acceptance email sent
6. [ ] Status = 'active'
7. [ ] Vendor can access dashboard

#### Card Issuance Flow
1. [ ] Admin prepares card
2. [ ] Payload + signature generated
3. [ ] Admin writes to physical card
4. [ ] Admin confirms issuance
5. [ ] Card stored in database
6. [ ] Card can be validated

#### Redemption Flow
1. [ ] POS device authenticates
2. [ ] Card tapped
3. [ ] Signature verified
4. [ ] Redemption committed
5. [ ] Notification enqueued
6. [ ] Email + SMS sent

#### Event Check-in Flow
1. [ ] Admin creates event
2. [ ] Member taps card
3. [ ] Rules validated
4. [ ] Check-in recorded
5. [ ] Notification enqueued
6. [ ] Email + SMS sent

---

## Performance Tests

- [ ] **NFC validation response time**
  - `/api/nfc/validate` responds in < 100ms (p95)

- [ ] **Login response time**
  - `/api/auth/login` responds in < 500ms (p95)

- [ ] **Dashboard load time**
  - Member dashboard loads in < 2s
  - Admin dashboard loads in < 3s

- [ ] **Worker processing**
  - Worker processes notifications within 1 minute of enqueue
  - No notification backlog > 100 items

---

## Security Tests

- [ ] **Authentication**
  - Invalid JWT → 403
  - Expired JWT → 403
  - Missing JWT → 401

- [ ] **Authorization**
  - Member cannot access admin routes
  - Vendor cannot access member routes
  - Inactive users cannot access dashboards

- [ ] **Card security**
  - Invalid signature → rejection
  - Expired card → rejection
  - Blocked card → rejection

- [ ] **Device authentication**
  - Invalid device key → 401
  - Missing device headers → 401

---

## Database Integrity Tests

- [ ] **Foreign keys**
  - All foreign keys enforced
  - Cascade deletes work correctly

- [ ] **Unique constraints**
  - `invoice_id` + `vendor_id` unique (redemptions)
  - `card_public_id` unique
  - `email` unique (members, vendors)

- [ ] **Data consistency**
  - Member status matches payment status
  - Card status matches member status
  - Vendor status matches payment status

---

## Deployment Tests

- [ ] **cPanel compatibility**
  - App runs via Passenger
  - `run.cjs` works
  - Environment variables loaded

- [ ] **Worker process**
  - Worker can run as separate process
  - Worker can run via cron/interval
  - Worker does not block main API

- [ ] **Build process**
  - `npm run build:cpanel` works
  - Frontend builds successfully
  - Backend builds successfully

---

## Regression Tests

After each phase, verify existing functionality still works:

- [ ] Member registration still works
- [ ] Payment processing still works
- [ ] Admin login still works
- [ ] Vendor login still works
- [ ] NFC validation still works (if enhanced)
- [ ] Fraud detection still works
- [ ] Audit logging still works

---

## Test Execution Notes

1. **Run tests after each phase** - Don't wait until all phases complete
2. **Fix issues before proceeding** - Don't accumulate technical debt
3. **Document failures** - Track what doesn't work and why
4. **Test in staging first** - Don't test directly in production
5. **Use test data** - Create test members/vendors/cards for testing

---

## Success Criteria

All tests must pass before considering a phase complete:

- ✅ All backend tests pass
- ✅ All frontend tests pass
- ✅ All integration tests pass
- ✅ Performance targets met
- ✅ Security tests pass
- ✅ No regressions introduced

---

**End of Smoke Test Checklist**




