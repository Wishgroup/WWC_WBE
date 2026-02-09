# API Reference

Base URL: `/api` (e.g. `http://localhost:3001/api`)

## Response format

- **Success:** `{ "success": true, ...data }`
- **Error:** `{ "success": false, "error": "message", "code": "optional" }`
- **404:** `{ "success": false, "error": "Not Found", "message": "Route ..." }`

---

## Auth

### POST /api/auth/register

Register a new member.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "secret123",
  "fullName": "John Doe",
  "membershipType": "annual"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "jwt...",
  "user": { "id": "1", "email": "user@example.com", "fullName": "John Doe", "role": "member", "membershipType": "annual" }
}
```

### POST /api/auth/login

Login (member, admin, or vendor).

**Body:**
```json
{
  "email": "user@example.com",
  "password": "secret123",
  "userType": "member"
}
```
`userType`: `member` | `admin` | `vendor`

**Response (200) – allowed:**
```json
{
  "success": true,
  "token": "jwt...",
  "user": { "id": "1", "email": "user@example.com", "fullName": "John Doe", "role": "member", "membershipType": "annual" },
  "allowed": true,
  "next_action": "dashboard"
}
```

**Response (200) – member/vendor not yet active (blocked):**
```json
{
  "success": true,
  "token": "jwt...",
  "user": { "id": "1", "email": "...", "fullName": "...", "role": "member", "membershipType": "annual" },
  "allowed": false,
  "next_action": "application_pending",
  "status_reason": "payment_pending"
}
```
`next_action`: `application_pending` | `payment_pending` | `application_rejected` | `dashboard`

### GET /api/auth/me

Current user (requires `Authorization: Bearer <token>`). Returns `allowed`, `next_action`, `status_reason` for member/vendor.

**Response (200):**
```json
{
  "success": true,
  "user": { "id": "1", "email": "...", "fullName": "...", "role": "member", "membershipType": "annual" },
  "allowed": true,
  "next_action": "dashboard"
}
```

---

## Members dashboard (JWT, role: member)

All require `Authorization: Bearer <token>` and role `member`.

### GET /api/members/me

Dashboard profile: member + card (from `cards` or `nfc_cards`) + referral_code + referred_count.

**Response (200):**
```json
{
  "success": true,
  "profile": { "id", "email", "fullName", "membershipType", "membershipStatus", "subscriptionStart", "subscriptionEnd", "referralCode", "referredCount" },
  "card": { "cardPublicId", "cardUid", "tier", "expiresAt", "status" } | null
}
```

### GET /api/members/redemptions

List redemptions for the member (vendor name, amount, discount, date).

**Response (200):**
```json
{ "success": true, "redemptions": [ { "id", "vendor", "amount", "discount", "currency", "date" } ] }
```

### GET /api/members/event-checkins

List event check-ins for the member.

**Response (200):**
```json
{ "success": true, "eventCheckins": [ { "id", "event", "eventCode", "date" } ] }
```

### GET /api/members/vendors

List active vendors (business listing).

**Response (200):**
```json
{ "success": true, "vendors": [ { "id", "name", "code", "location", "category", "currency", "maxDiscount" } ] }
```

---

## Vendors dashboard (JWT, role: vendor)

All require `Authorization: Bearer <token>` and role `vendor`.

### GET /api/vendors/me

Vendor profile (vendor_code, name, location, currency, etc.).

**Response (200):**
```json
{ "success": true, "profile": { "id", "vendorName", "vendorCode", "email", "country", "city", "currency", "category", "status" } }
```

### GET /api/vendors/pos-devices

List POS readers for this vendor (no device key).

**Response (200):**
```json
{ "success": true, "devices": [ { "id", "readerId", "readerName", "locationDescription", "isActive", "createdAt" } ] }
```

### POST /api/vendors/pos-devices

Register a POS reader. Body: `{ "readerId", "deviceKey", "readerName?", "locationDescription?" }`. Device key stored as SHA256 hash.

**Response (201):**
```json
{ "success": true, "message": "POS device registered. Use X-POS-READER-ID and X-POS-DEVICE-KEY when calling /api/nfc/validate." }
```

### GET /api/vendors/transactions

List redemptions (transactions) for this vendor.

**Response (200):**
```json
{ "success": true, "transactions": [ { "id", "invoiceId", "memberName", "memberId", "amount", "discount", "currency", "createdAt" } ] }
```

---

## NFC validation (vendor POS)

### POST /api/nfc/validate

Validate an NFC tap. **Vendor auth:** `X-Vendor-API-Key: <vendor_code>`.

**Body:**
```json
{
  "cardUid": "CARD_0001",
  "posReaderId": "POS_1_1",
  "latitude": 25.2,
  "longitude": 55.27,
  "transactionAmount": 100
}
```
`latitude`, `longitude`, `transactionAmount` optional.

**Response (200) – approved:**
```json
{
  "success": true,
  "approved": true,
  "memberId": 1,
  "membershipType": "annual",
  "offer": { ... },
  "currency": "AED",
  "timestamp": "2025-01-28T12:00:00.000Z"
}
```

**Response (200) – rejected:**
```json
{
  "success": false,
  "approved": false,
  "reason": "card_blocked",
  "fraudScore": 0
}
```

**New flow (signed credential):** Body `payload` (object with member_public_id, card_public_id, tier, expires_at, key_version, nonce), `signature` (hex); optional `amount`, `currency`. Auth: X-Vendor-API-Key or X-POS-READER-ID + X-POS-DEVICE-KEY. Returns `validationId` (short-lived) for redeem.

**Response (200) – approved (signed):**
```json
{
  "success": true,
  "approved": true,
  "validationId": "...",
  "memberId": 1,
  "membershipType": "annual",
  "offer": { ... },
  "currency": "AED",
  "timestamp": "..."
}
```

**Rate limit:** 20 requests/minute per IP (configurable).

---

### POST /api/nfc/redeem

Commit a redemption. **Idempotent by vendor+invoiceId.** Auth: X-Vendor-API-Key or X-POS-READER-ID + X-POS-DEVICE-KEY.

**Body:** `{ "validationId": "...", "invoiceId": "...", "finalAmount": 100, "discountApplied": 10, "currency": "AED" }`

**Response (200):** `{ "success": true, "message": "Redemption recorded", "validationId": "...", "invoiceId": "..." }`

If same vendor+invoiceId already exists: `{ "success": true, "message": "Redemption already recorded (idempotent)", "redemptionId": ... }`

---

## Events

### GET /api/events

List upcoming/active events (end_at >= now, is_active). Query: `limit` (default 50, max 100). No auth required.

**Response (200):**
```json
{ "success": true, "events": [ { "id", "eventCode", "name", "description", "startAt", "endAt", "timezone", "isActive" }, ... ] }
```

### POST /api/events/checkin

Card check-in for an event. Body: `eventId`, `payload`, `signature` (same signed credential as validate). Verify signature + member active; check event time window; anti-passback (one check-in per event per member).

**Body:** `{ "eventId": 1, "payload": { ... }, "signature": "hex..." }`

**Response (200):** `{ "success": true, "message": "Check-in recorded", "eventId": 1, "eventCode": "...", "eventName": "...", "memberId": 1, "checkedInAt": "..." }`

**Response (400) – anti-passback:** `{ "success": false, "error": "already_checked_in", "anti_passback": true }`

---

## Admin (RBAC: admin)

All admin routes require **Admin auth:** `X-Admin-API-Key: <key>` or JWT (admin user).

### GET /api/admin/work-queue

Single admin queue: pending member applications, pending vendor applications, pending bank receipts, pending card issuance (approved member, no card yet).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "pending_bank_receipts": [ ... ],
    "pending_member_applications": [ ... ],
    "pending_vendor_applications": [ ... ],
    "pending_card_issuance": [ ... ]
  }
}
```

### GET /api/admin/offers

List offers. Query: `is_active` (true/false), `limit`, `offset`.

**Response (200):**
```json
{ "success": true, "offers": [ { "id", "offer_code", "offer_type", "discount_percentage", "vendor_category", "country_code", "usage_limit", "priority", "is_active", "valid_until", "created_at", "updated_at" }, ... ] }
```

### POST /api/admin/offers

Create an offer. **Body:** `offer_code` (required), `offer_type` (percentage|fixed_amount|free_addon|vip_access|event_access|flash), `discount_percentage`, `membership_type`, `vendor_category`, `country_code`, `valid_from`, `valid_until`, `usage_limit`, `priority`, `is_active`, `conditions`.

**Response (201):** `{ "success": true, "offer": { ... } }`  
**Response (409):** `{ "success": false, "error": "Offer code already exists" }`

### PUT /api/admin/offers/:id

Update an offer (partial). Same body fields as POST; only provided fields are updated.

**Response (200):** `{ "success": true, "offer": { ... } }`

---

### POST /api/admin/cards/prepare

Prepare DESFire EV2 credential for a member. **Checks:** member must be active + paid.

**Body:** `{ "memberId": 1 }`

**Response (200):**
```json
{
  "success": true,
  "issueSessionId": "...",
  "card_public_id": "c...",
  "payload": { "member_public_id": "m1", "card_public_id": "c...", "tier": "annual", "expires_at": "...", "key_version": 1, "nonce": "..." },
  "signature": "hex...",
  "key_version": 1,
  "expires_at": "..."
}
```

### POST /api/admin/cards/confirm

Confirm card issuance after local bridge has written the credential. **UID is optional (audit only).**

**Body:** `{ "issueSessionId": "...", "card_public_id": "c...", "card_uid": "optional" }`

**Response (200):** `{ "success": true, "message": "Card issuance confirmed", "card_public_id": "c..." }`

### GET /api/admin/fraud/logs

Query params: `memberId`, `cardUid`, `severity`, `resolved`, `startDate`, `endDate`, `limit`, `offset`.

**Response (200):**
```json
{ "success": true, "data": [ ... ], "count": 10 }
```

### GET /api/admin/fraud/stats

**Response (200):** `{ "success": true, "data": { "total_events", ... } }`

### GET /api/admin/cards/blocked

**Response (200):** `{ "success": true, "data": [ ... ] }`

### POST /api/admin/cards/block

**Body:** `{ "cardId": 1, "reason": "lost" }`

### POST /api/admin/cards/unblock

**Body:** `{ "cardId": 1 }`

### POST /api/admin/cards/reissue

**Body:** `{ "memberId": 1, "reason": "damaged" }`

### GET /api/admin/vendors/analytics

Query: `vendorId`, `startDate`, `endDate`.

**Response (200):** Vendor usage (taps, unique members, etc.)

### GET /api/admin/bank-transfers/pending

**Response (200):** Pending receipt list for approval.

### POST /api/admin/bank-transfers/:receiptId/review

**Body:** `{ "action": "approve" | "reject", "notes": "optional" }`

---

## Payment

### POST /api/payment/create-session

**Body:** `{ "userId": "1", "membershipType": "annual" }`  
**Response:** Stripe session URL (if Stripe enabled).

### POST /api/payment/ccavenue/initiate

**Body:** `membershipType`, `amount`, `billingDetails`, `formData`, `paymentMethod` (`card` | `bank_transfer`).  
**Response:** Order ID, bank transfer instructions or payment URL.

### POST /api/payment/bank-transfer/upload-receipt

**Body:** multipart with `orderId` and `receipt` file.  
**Response:** `{ "success": true, "message": "Receipt uploaded...", "receiptId", "orderId" }`

---

## Health

### GET /health | GET /api/health

**Response (200):**
```json
{ "status": "healthy", "timestamp": "...", "service": "Wish Waves Club Backend API", "version": "1.0.0" }
```
