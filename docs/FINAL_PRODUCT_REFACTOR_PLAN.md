# Final Product Refactor Plan - Wish Waves Club

**Phase 0 Audit Document**  
**Date**: 2025-01-XX  
**Status**: Planning Phase - No Code Changes

---

## Executive Summary

This document outlines the comprehensive refactoring plan to upgrade the Wish Waves Club (WWC) system from its current state to the final product requirements. The plan follows a phased approach with minimal diffs, no breaking changes, and preservation of working code.

**Key Principles**:
- ✅ Preserve existing working logic
- ✅ Maintain API response format `{ success: true/false, ... }`
- ✅ No breaking changes to existing routes
- ✅ Minimal rewrites - only upgrade what must change
- ✅ Remove only dead/duplicate/unnecessary code (after verification)

---

## Current System Analysis

### Architecture Overview

**Frontend**:
- React 18 + Vite
- React Router v6
- AuthContext with JWT storage
- ProtectedRoute by role
- Routes: public pages + role dashboards (admin/member/vendor)

**Backend**:
- Node 18 + Express
- MySQL (mysql2)
- JWT authentication
- Admin/Vendor API keys (X-Admin-API-Key, X-Vendor-API-Key)
- Zod validation (not currently used)
- Rate limiting (express-rate-limit)
- Helmet, CORS
- Existing NFC validation pipeline
- Fraud/audit logging

**Database**:
- MySQL with InnoDB
- Tables: members, vendors, nfc_cards, pos_readers, nfc_tap_logs, fraud_events, offers, offer_usage_logs, admin_users, audit_logs, payment_sessions, membership_applications, country_rules

**Deployment**:
- cPanel Passenger + run.cjs pattern
- Build scripts: build-cpanel.js

---

## Current State vs Requirements Gap Analysis

### R1 - Unified Onboarding Flow

**Current State**:
- ✅ Member registration exists (`POST /api/auth/register`)
- ✅ Payment flow exists (CC Avenue + Stripe)
- ✅ `membership_applications` table exists
- ❌ No unified flow for vendors
- ❌ No admin approval workflow
- ❌ Payment success auto-activates (should be pending → admin approval)
- ❌ No "Application Submitted" state
- ❌ No acceptance email on approval

**Gap**:
- Vendor registration/application missing
- Admin approval queue missing
- Status flow: Register → Pay → Submitted → Admin Approve → Active
- Need unified `applicationsService` abstraction

**What Stays**:
- Existing registration endpoints
- Payment processing logic
- `membership_applications` table structure (may need vendor columns)

**What Changes**:
- Payment success should set status to 'submitted' not 'active'
- Add vendor application endpoint
- Add admin approval endpoints
- Add acceptance email on approval

**What's New**:
- `vendor_applications` table (or extend `membership_applications`)
- Admin work queue endpoint
- Approval/rejection endpoints
- Unified applications service

---

### R2 - Active Gating Enforcement (P0)

**Current State**:
- ❌ `/api/auth/login` does NOT check membership_status
- ❌ `/api/auth/me` does NOT return status/next_action
- ❌ `ProtectedRoute` does NOT check active status
- ❌ No pending/rejected/payment screens
- ⚠️ Payment webhook sets status to 'active' immediately (should be 'submitted')

**Gap**:
- Backend: No active status enforcement on login/me
- Backend: No middleware to block inactive members/vendors
- Frontend: No status-based routing
- Frontend: No pending/rejected screens

**What Stays**:
- Existing JWT auth flow
- Existing ProtectedRoute component (will be enhanced)

**What Changes**:
- `/api/auth/login` must check and return status
- `/api/auth/me` must return: `{ role, allowed, account_status, next_action }`
- Add middleware: `requireActiveMember`, `requireActiveVendor`
- Update `ProtectedRoute` to check `allowed` and route via `next_action`

**What's New**:
- Frontend pages: `/application/submitted`, `/application/pending`, `/application/rejected`, `/payment/pending`
- Backend middleware: active status enforcement
- Status calculation logic

---

### R3 - Secure DESFire EV2 Credential (Option 3)

**Current State**:
- ✅ `nfc_cards` table exists
- ✅ `NFCCardService` exists (basic issue/block/reissue)
- ❌ Uses UID as identity (should NOT)
- ❌ No signature-based validation
- ❌ No payload structure (member_public_id, card_public_id, tier, expires_at, key_version, nonce, issued_at)
- ❌ No HMAC-SHA256 signing
- ❌ No admin issuance endpoints (prepare/confirm)
- ❌ No card_issue_sessions table

**Gap**:
- Card issuance is basic (no secure credential structure)
- No signature verification
- No admin-driven issuance workflow
- No local bridge integration

**What Stays**:
- `nfc_cards` table (may need new columns)
- Basic card lifecycle (block/unblock/reissue)

**What Changes**:
- Card storage: Add `card_public_id`, `payload`, `signature`, `key_version`
- Card validation: Verify signature, not just UID lookup
- Issuance: Admin-driven prepare/confirm flow

**What's New**:
- `cards` table (or extend `nfc_cards` with new fields)
- `card_issue_sessions` table
- `POST /api/admin/cards/prepare`
- `POST /api/admin/cards/confirm`
- HMAC-SHA256 signing service
- Card credential structure
- Local issuer bridge documentation

---

### R4 - Vendor Verification (Android + Mini-PC)

**Current State**:
- ✅ `POST /api/nfc/validate` exists
- ✅ `authenticateVendor` middleware exists (uses X-Vendor-API-Key)
- ✅ `pos_readers` table exists
- ❌ No POS device authentication (X-POS-READER-ID, X-POS-DEVICE-KEY)
- ❌ No device key hashing
- ❌ No `/api/nfc/redeem` endpoint
- ❌ No redemptions table
- ❌ No idempotency (invoice_id unique constraint)
- ❌ No notification enqueue on redeem

**Gap**:
- Device-level auth missing
- Redeem endpoint missing
- Redemptions tracking missing
- Idempotency missing

**What Stays**:
- Existing `/api/nfc/validate` (will be enhanced)
- Existing vendor API key auth (will coexist with device auth)
- Existing POS readers table (may need device_key_hash column)

**What Changes**:
- Add device authentication headers
- Enhance validate to support device auth
- Add signature verification (from R3)

**What's New**:
- `redemptions` table
- `nfc_validations` table (or use existing `nfc_tap_logs`)
- `POST /api/nfc/redeem`
- Device key hashing
- Idempotency logic

---

### R5 - Events Check-in via Card

**Current State**:
- ✅ Events page exists (frontend)
- ❌ No events table
- ❌ No event_rules table
- ❌ No event_checkins table
- ❌ No check-in endpoint
- ❌ No anti-passback logic
- ❌ No tier eligibility checks
- ❌ No time window validation

**Gap**:
- Complete events module missing

**What Stays**:
- Frontend Events page (will need API integration)

**What Changes**:
- None (new feature)

**What's New**:
- `events` table
- `event_rules` table
- `event_checkins` table
- `POST /api/events/checkin`
- Anti-passback logic
- Tier eligibility engine
- Time window validation

---

### R6 - Notifications Outbox + Worker

**Current State**:
- ✅ `EmailService` exists (sendWelcomeEmail)
- ✅ SMTP configured
- ❌ No notifications_outbox table
- ❌ No notification enqueue service
- ❌ No worker process
- ❌ No SMS provider interface
- ❌ Notifications sent synchronously (should be async via outbox)

**Gap**:
- No async notification system
- No SMS support
- No worker process

**What Stays**:
- Existing `EmailService` (will be used by worker)
- SMTP configuration

**What Changes**:
- Payment success: Enqueue notification instead of sending directly
- Event check-in: Enqueue notification
- Redeem: Enqueue notification

**What's New**:
- `notifications_outbox` table
- Notification enqueue service
- Worker process (compatible with cPanel)
- SMS provider interface (mock implementation)
- SMS service abstraction

---

## Database Changes Required

### New Tables

1. **`cards`** (or extend `nfc_cards`)
   - `card_public_id` VARCHAR(100) UNIQUE
   - `payload` TEXT (JSON)
   - `signature` VARCHAR(255)
   - `key_version` INT
   - `member_public_id` VARCHAR(100)
   - `tier` VARCHAR(50)
   - `expires_at` TIMESTAMP
   - `nonce` VARCHAR(100)
   - `issued_at` TIMESTAMP

2. **`card_issue_sessions`**
   - `id` INT AUTO_INCREMENT PRIMARY KEY
   - `session_id` VARCHAR(255) UNIQUE
   - `member_id` INT
   - `card_public_id` VARCHAR(100)
   - `payload` TEXT (JSON)
   - `status` VARCHAR(50) DEFAULT 'prepared' -- 'prepared', 'confirmed', 'failed'
   - `prepared_by` INT (admin user)
   - `confirmed_at` TIMESTAMP NULL
   - `created_at` TIMESTAMP

3. **`vendor_applications`** (or extend `membership_applications` with `application_type`)
   - `id` INT AUTO_INCREMENT PRIMARY KEY
   - `email` VARCHAR(255)
   - `vendor_name` VARCHAR(255)
   - `vendor_code` VARCHAR(100) UNIQUE
   - `country` VARCHAR(100)
   - `city` VARCHAR(100)
   - `category` VARCHAR(100)
   - `status` VARCHAR(50) DEFAULT 'pending' -- 'pending', 'approved', 'rejected'
   - `payment_status` VARCHAR(50) DEFAULT 'pending'
   - `payment_amount` DECIMAL(10, 2)
   - `created_at` TIMESTAMP
   - `updated_at` TIMESTAMP

4. **`events`**
   - `id` INT AUTO_INCREMENT PRIMARY KEY
   - `event_name` VARCHAR(255)
   - `event_code` VARCHAR(100) UNIQUE
   - `description` TEXT
   - `start_time` TIMESTAMP
   - `end_time` TIMESTAMP
   - `location` VARCHAR(255)
   - `max_capacity` INT
   - `is_active` BOOLEAN DEFAULT true
   - `created_at` TIMESTAMP

5. **`event_rules`**
   - `id` INT AUTO_INCREMENT PRIMARY KEY
   - `event_id` INT
   - `allowed_tiers` JSON -- ['annual', 'lifetime']
   - `time_window_start` TIME
   - `time_window_end` TIME
   - `allow_multiple_entry` BOOLEAN DEFAULT false
   - `anti_passback_minutes` INT DEFAULT 0
   - `created_at` TIMESTAMP

6. **`event_checkins`**
   - `id` INT AUTO_INCREMENT PRIMARY KEY
   - `event_id` INT
   - `member_id` INT
   - `card_public_id` VARCHAR(100)
   - `checkin_time` TIMESTAMP
   - `tier` VARCHAR(50)
   - `created_at` TIMESTAMP
   - UNIQUE KEY `unique_event_member` (`event_id`, `member_id`) -- if anti-passback enabled

7. **`redemptions`**
   - `id` INT AUTO_INCREMENT PRIMARY KEY
   - `vendor_id` INT
   - `member_id` INT
   - `card_public_id` VARCHAR(100)
   - `invoice_id` VARCHAR(255)
   - `amount` DECIMAL(10, 2)
   - `discount_amount` DECIMAL(10, 2)
   - `final_amount` DECIMAL(10, 2)
   - `pos_reader_id` VARCHAR(100)
   - `redeemed_at` TIMESTAMP
   - `created_at` TIMESTAMP
   - UNIQUE KEY `unique_vendor_invoice` (`vendor_id`, `invoice_id`)

8. **`nfc_validations`** (or use existing `nfc_tap_logs`)
   - Extend `nfc_tap_logs` with:
   - `validation_type` VARCHAR(50) -- 'validate', 'redeem'
   - `invoice_id` VARCHAR(255) NULL

9. **`notifications_outbox`**
   - `id` INT AUTO_INCREMENT PRIMARY KEY
   - `channel` VARCHAR(50) -- 'email', 'sms'
   - `recipient` VARCHAR(255) -- email or phone
   - `template` VARCHAR(100) -- 'redeem_success', 'event_checkin'
   - `data` JSON -- template variables
   - `status` VARCHAR(50) DEFAULT 'pending' -- 'pending', 'sent', 'failed'
   - `attempts` INT DEFAULT 0
   - `last_attempt_at` TIMESTAMP NULL
   - `sent_at` TIMESTAMP NULL
   - `error_message` TEXT NULL
   - `created_at` TIMESTAMP
   - INDEX `idx_status` (`status`)
   - INDEX `idx_created_at` (`created_at`)

### Table Modifications

1. **`members`**
   - ✅ Already has `membership_status`, `payment_status`
   - May need `public_id` VARCHAR(100) UNIQUE (for card payload)

2. **`vendors`**
   - Add `vendor_status` VARCHAR(50) DEFAULT 'pending' -- 'pending', 'active', 'rejected', 'expired'
   - Add `payment_status` VARCHAR(50)
   - Add `payment_amount` DECIMAL(10, 2)
   - May need `public_id` VARCHAR(100) UNIQUE

3. **`pos_readers`**
   - Add `device_key_hash` VARCHAR(255) -- hashed device key
   - Add `device_name` VARCHAR(255)
   - Add `device_type` VARCHAR(50) -- 'android', 'mini-pc'

4. **`nfc_cards`** (or merge with `cards`)
   - Add `card_public_id` VARCHAR(100) UNIQUE
   - Add `payload` TEXT
   - Add `signature` VARCHAR(255)
   - Add `key_version` INT
   - Keep `card_uid` for audit only

---

## New Endpoints Required

### Admin Endpoints

1. **`GET /api/admin/work-queue`**
   - Returns: pending applications, bank transfer receipts, pending approvals, card issuance pending
   - Response: `{ success: true, data: { applications: [], cardIssuance: [] } }`

2. **`POST /api/admin/applications/:id/approve`**
   - Approves member/vendor application
   - Sets status to 'active', sends acceptance email
   - Response: `{ success: true, message: 'Application approved' }`

3. **`POST /api/admin/applications/:id/reject`**
   - Rejects application
   - Response: `{ success: true, message: 'Application rejected' }`

4. **`POST /api/admin/cards/prepare`**
   - Prepares card credential payload
   - Creates issue session
   - Response: `{ success: true, data: { issueSessionId, card_public_id, payload } }`

5. **`POST /api/admin/cards/confirm`**
   - Confirms card issuance (after physical write)
   - Updates card status
   - Response: `{ success: true, message: 'Card confirmed' }`

6. **`GET /api/admin/events`**
   - List all events
   - Response: `{ success: true, data: [] }`

7. **`POST /api/admin/events`**
   - Create event
   - Response: `{ success: true, data: { id, ... } }`

8. **`PUT /api/admin/events/:id`**
   - Update event
   - Response: `{ success: true, data: { ... } }`

9. **`GET /api/admin/events/:id/checkins`**
   - Get event check-in logs
   - Response: `{ success: true, data: [] }`

### NFC Endpoints

1. **`POST /api/nfc/redeem`** (enhanced)
   - Commits redemption
   - Requires: POS device auth (X-POS-READER-ID, X-POS-DEVICE-KEY)
   - Enqueues notifications
   - Idempotent (invoice_id)
   - Response: `{ success: true, data: { redemption_id, ... } }`

2. **`POST /api/nfc/validate`** (enhanced)
   - Fast validation (no notifications)
   - Verifies signature (from R3)
   - Returns offer quote
   - Response: `{ success: true, approved: true, offer: {...} }`

### Events Endpoints

1. **`POST /api/events/checkin`**
   - Card-based event check-in
   - Verifies: active membership, time window, tier eligibility, anti-passback
   - Enqueues notifications
   - Response: `{ success: true, message: 'Check-in successful' }`

2. **`GET /api/events`** (public)
   - List active events
   - Response: `{ success: true, data: [] }`

### Member Endpoints

1. **`GET /api/member/usage`**
   - Personal usage (redemptions + event check-ins)
   - Response: `{ success: true, data: { redemptions: [], checkins: [] } }`

2. **`GET /api/member/referrals`**
   - Referral history
   - Response: `{ success: true, data: { referrals: [] } }`

### Vendor Endpoints

1. **`GET /api/vendor/readers`**
   - List POS readers
   - Response: `{ success: true, data: [] }`

2. **`POST /api/vendor/readers`**
   - Register new POS reader
   - Response: `{ success: true, data: { reader_id, device_key } }`

3. **`GET /api/vendor/transactions`**
   - Transaction history (validations + redemptions)
   - Response: `{ success: true, data: [] }`

---

## New Frontend Pages Required

### Application Status Pages

1. **`/application/submitted`**
   - Shows "Application Submitted" message
   - Next steps information

2. **`/application/pending`**
   - Shows "Pending Admin Review" message
   - Estimated review time

3. **`/application/rejected`**
   - Shows rejection message
   - Contact support CTA

4. **`/payment/pending`** (if needed)
   - Payment pending screen

### Member Dashboard Pages

1. **`/member/dashboard/welcome`** (or enhance existing)
   - Welcome screen

2. **`/member/dashboard/profile`**
   - Profile management

3. **`/member/dashboard/usage`**
   - Personal usage (redemptions + event check-ins)

4. **`/member/dashboard/referrals`**
   - Referral tracking

5. **`/member/dashboard/business-listing`**
   - Business listing submission/management

### Vendor Dashboard Pages

1. **`/vendor/dashboard/profile`**
   - Profile management

2. **`/vendor/dashboard/readers`**
   - POS devices/readers management

3. **`/vendor/dashboard/transactions`**
   - Transactions (validations + redemptions)

4. **`/vendor/dashboard/support`**
   - Support/overview

### Admin Dashboard Pages

1. **`/admin/dashboard/work-queue`** (new tab)
   - Work queue UI
   - Applications, bank transfers, card issuance pending

2. **`/admin/dashboard/approvals`** (new tab)
   - Approve/reject interface

3. **`/admin/dashboard/card-issuance`** (enhance existing)
   - Prepare/confirm/reissue/block interface

4. **`/admin/dashboard/events`** (new tab)
   - Events management + check-in logs

5. **`/admin/dashboard/fraud`** (existing)
   - Keep as is

6. **`/admin/dashboard/audit`** (existing)
   - Keep as is

---

## Dead Code Identification

### Potentially Dead Code (Requires Verification)

1. **MongoDB files** (if not used):
   - `backend/database/mongodb-*.js`
   - `backend/scripts/seed-mongodb.js`
   - Verify: Are these used? If MySQL only, remove.

2. **PostgreSQL schema**:
   - `backend/database/schema.sql` (PostgreSQL syntax)
   - If MySQL only, this is dead code.

3. **Stripe integration** (if CC Avenue is primary):
   - `backend/routes/payment.js` - Stripe webhook
   - Verify: Is Stripe used? If not, remove Stripe-specific code.

4. **Unused admin components**:
   - Check `src/components/admin/` for unused components
   - Verify imports in `AdminDashboard.jsx`

5. **Debug/agent logging**:
   - `src/contexts/AuthContext.jsx` - fetch calls to `127.0.0.1:7242`
   - `src/components/ProtectedRoute.jsx` - fetch calls
   - Remove debug logging before production

### Code to Keep

1. **Fraud detection engine** - Keep (required)
2. **Country rules engine** - Keep (required)
3. **Offer engine** - Keep (required)
4. **NFC validation pipeline** - Keep (will be enhanced)
5. **Audit service** - Keep (required)
6. **Email service** - Keep (will be used by worker)

---

## Inconsistent Status Checks

### Current Issues

1. **`/api/auth/login`**:
   - Does NOT check `membership_status='active'`
   - Does NOT check `payment_status='success'`
   - Does NOT check expiration
   - **Fix**: Add status checks, return `allowed: false` if inactive

2. **`/api/auth/me`**:
   - Does NOT return status information
   - Does NOT return `next_action`
   - **Fix**: Return `{ role, allowed, account_status, next_action }`

3. **Payment webhook** (`/api/payment/webhook`):
   - Sets `membership_status='active'` immediately
   - Should set to 'submitted' and require admin approval
   - **Fix**: Set status to 'submitted', admin approves later

4. **CC Avenue response** (`/api/payment/ccavenue/response`):
   - Sets `membership_status='active'` immediately
   - Should set to 'submitted'
   - **Fix**: Set status to 'submitted'

5. **Vendor login**:
   - Does NOT check `vendor_status` (if field exists)
   - Does NOT check `payment_status`
   - **Fix**: Add vendor status checks

6. **Protected routes**:
   - `ProtectedRoute` only checks role, not active status
   - **Fix**: Check `allowed` flag from `/api/auth/me`

---

## Implementation Phases

### Phase 1 - Active Gating Enforcement (P0)
**Priority**: P0 (Critical)  
**Estimated Effort**: 2-3 days

**Backend**:
- Update `/api/auth/login` to check and return status
- Update `/api/auth/me` to return `{ role, allowed, account_status, next_action }`
- Add middleware: `requireActiveMember`, `requireActiveVendor`
- Apply middleware to protected member/vendor routes

**Frontend**:
- Update `ProtectedRoute` to check `allowed` and route via `next_action`
- Create pages: `/application/submitted`, `/application/pending`, `/application/rejected`, `/payment/pending`
- Update `AuthContext` to handle status

**Database**:
- No schema changes (use existing fields)

---

### Phase 2 - Unified Applications + Admin Approval Queue (P0/P1)
**Priority**: P0/P1  
**Estimated Effort**: 3-4 days

**Backend**:
- Create `applicationsService` abstraction
- Add `GET /api/admin/work-queue`
- Add `POST /api/admin/applications/:id/approve`
- Add `POST /api/admin/applications/:id/reject`
- Update payment webhooks to set status='submitted'
- Add acceptance email on approval

**Frontend**:
- Admin: Work Queue UI
- Member/Vendor: Show submitted/pending states

**Database**:
- Add `vendor_applications` table (or extend `membership_applications`)
- Add `vendor_status` to `vendors` table

---

### Phase 3 - Cards Module (P1)
**Priority**: P1  
**Estimated Effort**: 4-5 days

**Backend**:
- Create card credential structure (payload + signature)
- Add HMAC-SHA256 signing service
- Add `POST /api/admin/cards/prepare`
- Add `POST /api/admin/cards/confirm`
- Update card validation to verify signature (not UID)

**Frontend**:
- Admin card issuance page
- Prepare payload UI
- Issue session display

**Database**:
- Add `cards` table (or extend `nfc_cards`)
- Add `card_issue_sessions` table
- Add `card_public_id`, `payload`, `signature`, `key_version` columns

**Documentation**:
- `docs/CARD_ISSUANCE_STATION.md` (ACR1252U setup + local bridge)

---

### Phase 4 - NFC Validate/Redeem with POS Device Auth (P1)
**Priority**: P1  
**Estimated Effort**: 3-4 days

**Backend**:
- Add POS device authentication (X-POS-READER-ID, X-POS-DEVICE-KEY)
- Add device key hashing
- Enhance `POST /api/nfc/validate` (signature verification, offer quote)
- Add `POST /api/nfc/redeem` (idempotency, notification enqueue)
- Add vendor endpoints: `/api/vendor/readers`, `/api/vendor/transactions`

**Frontend**:
- Vendor dashboard: POS readers management
- Vendor dashboard: Transaction history

**Database**:
- Add `redemptions` table
- Add `device_key_hash` to `pos_readers`
- Extend `nfc_tap_logs` with `validation_type`, `invoice_id`

---

### Phase 5 - Events Module (P1)
**Priority**: P1  
**Estimated Effort**: 3-4 days

**Backend**:
- Add `POST /api/events/checkin`
- Add `GET /api/events` (public)
- Add admin endpoints: `GET/POST/PUT /api/admin/events`
- Implement: tier eligibility, time window, anti-passback

**Frontend**:
- Admin events management UI
- Member usage page (show event check-ins)

**Database**:
- Add `events` table
- Add `event_rules` table
- Add `event_checkins` table

---

### Phase 6 - Notifications Outbox + Worker (P1)
**Priority**: P1  
**Estimated Effort**: 3-4 days

**Backend**:
- Add `notifications_outbox` table
- Create notification enqueue service
- Create worker process (cPanel compatible)
- Create SMS provider interface + mock implementation
- Update redeem/checkin to enqueue notifications

**Frontend**:
- No frontend changes (backend only)

**Database**:
- Add `notifications_outbox` table

---

## What Stays (No Changes)

1. **Existing payment logic** (CCAvenue/bank transfer) - Keep as is, only add status gating
2. **Fraud detection engine** - Keep as is
3. **Country rules engine** - Keep as is
4. **Offer engine** - Keep as is
5. **Audit logging** - Keep as is
6. **Existing admin dashboard tabs** (fraud, audit) - Keep as is
7. **Existing routes** - Keep, only add new ones
8. **API response format** - Maintain `{ success: true/false, ... }`

---

## What Gets Removed (After Verification)

1. **MongoDB files** (if not used) - Verify first
2. **PostgreSQL schema** (if MySQL only) - Verify first
3. **Stripe code** (if CC Avenue only) - Verify first
4. **Debug logging** (agent fetch calls) - Remove before production
5. **Unused admin components** - Verify imports first

---

## Migration Strategy

### Database Migrations

1. Create migration scripts in `backend/database/migrations/`
2. Use versioned migration files: `001_add_vendor_status.sql`, `002_add_cards_table.sql`, etc.
3. Run migrations via `npm run migrate` (update script)

### Code Migration

1. **Backward Compatibility**: Keep old endpoints working during transition
2. **Feature Flags**: Use environment variables to enable new features gradually
3. **Testing**: Test each phase before moving to next

---

## Testing Strategy

### Phase 1 Testing
- ✅ Login with inactive member → should redirect to pending
- ✅ Login with active member → should access dashboard
- ✅ `/api/auth/me` returns correct status
- ✅ Protected routes block inactive users

### Phase 2 Testing
- ✅ Payment success → status='submitted'
- ✅ Admin approval → status='active', email sent
- ✅ Work queue shows pending applications

### Phase 3 Testing
- ✅ Card prepare → generates payload + signature
- ✅ Card confirm → updates card status
- ✅ Card validation → verifies signature

### Phase 4 Testing
- ✅ POS device auth → validates device key
- ✅ Redeem → idempotent, enqueues notification
- ✅ Validate → fast, no notifications

### Phase 5 Testing
- ✅ Event check-in → validates rules, anti-passback
- ✅ Event check-in → enqueues notification

### Phase 6 Testing
- ✅ Worker processes outbox
- ✅ Email sent via worker
- ✅ SMS mock logs correctly

---

## Risk Assessment

### High Risk
1. **Breaking existing auth flow** - Mitigation: Test thoroughly, backward compatible
2. **Payment status changes** - Mitigation: Update webhooks carefully
3. **Card validation changes** - Mitigation: Test with existing cards

### Medium Risk
1. **Database migrations** - Mitigation: Test on staging first
2. **Worker process** - Mitigation: Ensure cPanel compatibility

### Low Risk
1. **New endpoints** - Mitigation: Additive only, no breaking changes

---

## Documentation Updates Required

1. **`backend/docs/api.md`** - Document new endpoints
2. **`docs/CARD_ISSUANCE_STATION.md`** - Card issuance setup guide
3. **`docs/DEPRECATED.md`** - List removed code (after Phase 6)
4. **`README.md`** - Update with new features

---

## Success Criteria

### Phase 1 Complete
- ✅ Inactive members cannot access dashboards
- ✅ Status-based routing works
- ✅ All protected routes enforce active status

### Phase 2 Complete
- ✅ Unified onboarding flow works
- ✅ Admin can approve/reject applications
- ✅ Acceptance emails sent on approval

### Phase 3 Complete
- ✅ Cards use secure DESFire EV2 credentials
- ✅ Admin can prepare/confirm card issuance
- ✅ Card validation verifies signature

### Phase 4 Complete
- ✅ POS device authentication works
- ✅ Redeem endpoint functional
- ✅ Idempotency enforced

### Phase 5 Complete
- ✅ Event check-in works
- ✅ Anti-passback enforced
- ✅ Tier eligibility checked

### Phase 6 Complete
- ✅ Notifications sent asynchronously
- ✅ Worker processes outbox
- ✅ SMS provider interface ready

---

## Next Steps

1. ✅ **Phase 0 Complete** - This document
2. ⏳ **Phase 1** - Active gating enforcement
3. ⏳ **Phase 2** - Unified applications
4. ⏳ **Phase 3** - Cards module
5. ⏳ **Phase 4** - NFC validate/redeem
6. ⏳ **Phase 5** - Events module
7. ⏳ **Phase 6** - Notifications worker

---

**End of Phase 0 Audit Document**



