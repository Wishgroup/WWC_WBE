# Changelog – Final Product Refactor

Short log of changes for the WWC final product architecture. Phases implemented incrementally.

---

## Phase 0 (Baseline)

- **docs/FINAL_PRODUCT_REFACTOR_PLAN.md** – Audit and refactor plan (no code changes).

---

## Phase 1 – Enforce correct lifecycle (P0)

**What changed:** Member/vendor dashboard access only when approved and active. Backend returns `allowed`, `next_action`, `status_reason`; frontend gates by status.

- **Backend**
  - **routes/auth.js:** `memberAccess()` / `vendorAccess()`; login and `/me` return `allowed`, `next_action`, `status_reason`. Vendor login/me resilient to missing `vendor_status`/`payment_status` columns.
  - **scripts/migrations/001-vendor-status-fields.js:** Add `vendor_status`, `payment_status` to `vendors`; backfill existing vendors as active/paid.
  - **package.json:** `migrate:vendor-status` script.

- **Frontend**
  - **contexts/AuthContext.jsx:** Store and expose `allowed`, `next_action`, `status_reason` from login and `getCurrentUser`.
  - **components/ProtectedRoute.jsx:** Status gate – redirect member/vendor to `/application/pending`, `/payment/pending`, or `/application/rejected` when `allowed === false`.
  - **pages/Login.jsx:** After login, redirect by `allowed` and `next_action` (no dashboard when not allowed).
  - **pages/ApplicationSubmitted.jsx, ApplicationPending.jsx, ApplicationRejected.jsx, PaymentPending.jsx:** Lightweight status pages.
  - **pages/ApplicationStatus.css:** Shared styles for status pages.
  - **App.jsx:** Routes for `/application/submitted`, `/application/pending`, `/application/rejected`, `/payment/pending`.

**Risk:** Low. Existing API shape kept; new fields additive.

---

## Phase 2 – Unified applications / work queue (P0/P1)

**What changed:** Single admin work-queue endpoint; idempotent bank-transfer approval.

- **Backend**
  - **routes/admin.js:** `GET /api/admin/work-queue` – returns `pending_bank_receipts`, `pending_member_applications`, `pending_vendor_applications`, `pending_card_issuance`. Idempotent approve: if receipt already `approved`, return success without sending welcome email again.

**Risk:** Low.

---

## Phase 3 – DESFire EV2 card issuance (P1)

**What changed:** Cards module (prepare/confirm), payload + HMAC-SHA256 signature, DB tables, issuance station doc. **UID not used as identity;** optional for audit only.

- **Backend**
  - **modules/cards/cardCredential.js:** `buildPayload()`, `signPayload()`, `verifySignature()`. Payload: `member_public_id`, `card_public_id`, `tier`, `expires_at`, `key_version`, `nonce`. Signature: HMAC-SHA256(payload, `CARD_SIGNING_SECRET_v{key_version}`).
  - **modules/cards/routes.js:** `cardsPrepare`, `cardsConfirm` – exported handlers. Prepare: member active+paid → issue session, payload, signature. Confirm: store `cards` row, mark session confirmed, audit.
  - **routes/admin.js:** `POST /api/admin/cards/prepare`, `POST /api/admin/cards/confirm` (admin-only).
  - **scripts/migrations/002-cards-and-sessions.js:** Tables `card_issue_sessions`, `cards` (identity by `card_public_id`; `card_uid` nullable).
  - **package.json:** `migrate:cards` script.
  - **.env.example:** `CARD_SIGNING_SECRET`, `CARD_SIGNING_SECRET_v*`, `CARD_SIGNING_KEY_VERSION`.

- **Docs**
  - **docs/CARD_ISSUANCE_STATION.md:** AID/file layout, local-bridge contract (`/status`, `/issue/write`), read/write verification steps. Backend does not embed NFC writing.

- **backend/docs/api.md:** Auth login/me `allowed`/`next_action`/`status_reason`; work-queue; cards prepare/confirm.

**Risk:** Low. New module and routes; no change to existing NFC validate or cPanel/Passenger.

---

## Phase 4 – POS device auth + validate + redeem (P1)

**What changed:** POS device auth (X-POS-READER-ID + X-POS-DEVICE-KEY); validate accepts payload+signature and returns validationId; redeem endpoint idempotent by vendor+invoiceId; notifications enqueued.

- **Backend**
  - **middleware/auth.js:** `authenticateVendorOrPOS` – accepts X-Vendor-API-Key or X-POS-READER-ID + X-POS-DEVICE-KEY (device_key_hash on pos_readers).
  - **scripts/migrations/003-nfc-validations-redemptions-pos.js:** `nfc_validations`, `redemptions`; `pos_readers.device_key_hash`.
  - **routes/nfc.js:** Validate uses `authenticateVendorOrPOS`; new flow: body `payload`, `signature` → verify signature, resolve member from card_public_id, check active, compute offer, insert nfc_validations, return `validationId`. Legacy body `cardUid`, `posReaderId` still supported. **POST /api/nfc/redeem:** body `validationId`, `invoiceId`, `finalAmount`, `discountApplied`, `currency`; idempotent by vendor+invoiceId; enqueues email/SMS via NotificationOutbox.

**Risk:** Low. Backward compatible.

---

## Phase 5 – Events check-in (P1)

**What changed:** Events module; POST /api/events/checkin; anti-passback (unique event_id + member_id).

- **Backend**
  - **scripts/migrations/005-events.js:** Tables `events`, `event_rules`, `event_checkins`.
  - **routes/events.js:** POST /api/events/checkin – body eventId, payload, signature; verify signature + member active; check event time window; anti-passback; enqueue notifications.

**Risk:** Low.

---

## Phase 6 – Notifications outbox (P1)

**What changed:** notifications_outbox table; enqueue on redeem and event check-in; SMS placeholder.

- **Backend**
  - **scripts/migrations/004-notifications-outbox.js:** Table `notifications_outbox`.
  - **services/NotificationOutbox.js:** `enqueueNotification()`, `sendSMS()` (mock), `processOutbox()` (worker). Email uses nodemailer when SMTP configured.

**Risk:** Low.

---

## Phase 7 – Frontend portals restructure (P1/P2)

**What changed:** Portal and shared index structure; App.jsx imports from portals and shared.

- **Frontend**
  - **src/shared/index.js:** Re-exports Header, Footer, ProtectedRoute, PageTransition, FloatingButton, ConsentBanner, TermsPrivacySummary, ErrorBoundary, api, useAuth, AuthProvider.
  - **src/portals/public/index.js:** Re-exports all public pages.
  - **src/portals/member/index.js:** MemberDashboard.
  - **src/portals/vendor/index.js:** VendorDashboard.
  - **src/portals/admin/index.js:** AdminDashboard.
  - **App.jsx:** Imports from `./portals/public`, `./portals/member`, `./portals/vendor`, `./portals/admin`, `./shared`. Routes unchanged.

**Risk:** Low. No file moves; re-exports only.

---

## Phase 8 – Remove dead code (P2)

**What changed:** Removed dead file; DEPRECATED doc.

- **Removed:** src/pages/Policy.css (no Policy.jsx).
- **docs/DEPRECATED.md:** Lists removed and deprecated items.

---

## Deliverables

- **Admin UI:** Work Queue tab (work queue summary + bank receipts); Card Issuance tab (prepare by memberId, confirm with optional card UID). Components: WorkQueue.jsx, CardIssuance.jsx.
- **docs/SMOKE_TEST.md:** Smoke test checklist (registration → approve → login → card prepare/confirm → validate → redeem → event check-in).
- **Backend test:** backend/test/cardCredential.test.js – signature build/verify and tamper rejection. Run: `cd backend && node test/cardCredential.test.js` (set CARD_SIGNING_SECRET for test).
- **backend/docs/api.md:** Updated for work-queue, cards prepare/confirm, auth allowed/next_action; add NFC validate (payload+signature), redeem, events/checkin when doc is extended.

---

## Run migrations

From `backend/` with valid `.env` (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME):

```bash
cd backend
npm run migrate:all          # One command: vendor-status → cards → nfc → outbox → events → profile-icon
# Or individually:
npm run migrate              # Base schema (if needed)
npm run migrate:vendor-status   # Phase 1 – vendors
npm run migrate:cards           # Phase 3 – cards, card_issue_sessions
npm run migrate:nfc             # Phase 4 – nfc_validations, redemptions, pos_readers.device_key_hash
npm run migrate:outbox          # Phase 6 – notifications_outbox
npm run migrate:events          # Phase 5 – events, event_rules, event_checkins
npm run migrate:profile-icon    # Optional – profile_icon_style on admin_users, members, vendors
```

Backend unit test (no DB): `npm run test` (card credential build/sign/verify).

Ensure `CARD_SIGNING_SECRET` (or `CARD_SIGNING_SECRET_v1`) is set before using cards prepare/confirm.

---

## Next – Dashboard APIs, debug gate, profile-icon guard

**What changed:** Member and Vendor dashboards wired to real APIs; debug instrumentation env-gated; profile-icon endpoint guarded when column is missing.

- **Backend**
  - **routes/members.js:** GET /api/members/me, /redemptions, /event-checkins, /vendors (JWT, role member).
  - **routes/vendors.js:** GET /api/vendors/me, /pos-devices; POST /api/vendors/pos-devices; GET /api/vendors/transactions (JWT, role vendor).
  - **middleware/auth.js:** `requireRole(role)` for member/vendor routes.
  - **server.js:** Mounted /api/members, /api/vendors.
  - **routes/auth.js:** PUT /api/auth/profile-icon – on `ER_BAD_FIELD_ERROR` for profile_icon_style, returns 503 with message to run migration.
  - **scripts/migrations/006-profile-icon-style.js:** Optional migration adding profile_icon_style to admin_users, members, vendors. `npm run migrate:profile-icon`.
- **Frontend**
  - **MemberDashboard.jsx:** Uses membersAPI (getMe, getRedemptions, getEventCheckins, getVendors); Welcome, Profile, Personal usage, Referrals, Business tabs backed by API.
  - **VendorDashboard.jsx:** Uses vendorsAPI (getMe, getPosDevices, registerPosDevice, getTransactions); Profile, POS devices, Transaction history backed by API.
  - **services/api.js:** membersAPI, vendorsAPI; debug fetch (127.0.0.1:7242) only when `VITE_DEBUG_AGENT=1` or `VITE_DEBUG_AGENT=true`.
- **backend/docs/api.md:** Documented Members and Vendors dashboard endpoints.

**Risk:** Low. New routes and guards; no change to existing auth or cPanel.

---

## Offer Management API + UI (P2)

**What changed:** Admin can list, create, update, and deactivate/activate offers via API and Offer Management tab.

- **Backend**
  - **routes/admin.js:** GET /api/admin/offers (query: is_active, limit, offset), POST /api/admin/offers (create), PUT /api/admin/offers/:id (update, partial). Audit log on create/update.
- **Frontend**
  - **components/admin/OfferManagement.jsx:** Fetches offers via adminAPI.getOffers(); Create New Offer opens modal with form; Edit opens modal with pre-filled form; Deactivate/Activate toggles is_active. adminAPI.getOffers(), createOffer(), updateOffer().
  - **services/api.js:** adminAPI.getOffers(params), createOffer(body), updateOffer(id, body).
  - **components/admin/OfferManagement.css:** Modal and activate-button styles.
- **backend/docs/api.md:** Documented GET/POST/PUT /api/admin/offers.

**Risk:** Low. New admin endpoints; OfferEngine continues to use existing `offers` table.

---

## Complete all – docs, events list, member dashboard

**What changed:** Documentation and smoke test brought up to date; GET /api/events and member dashboard upcoming events wired.

- **Backend**
  - **routes/events.js:** GET /api/events – list upcoming/active events (query: limit). Returns events[]; safe when `events` table missing (returns []).
- **Frontend**
  - **MemberDashboard.jsx:** Fetches upcoming events via eventsAPI.getEvents(); Welcome tab shows event cards from API (or empty state).
  - **services/api.js:** eventsAPI.getEvents(params).
- **Docs**
  - **FULL_WEBSITE_DOCUMENTATION_FOR_ANALYSIS.md:** Application status routes; Members, Vendors, Events, NFC redeem in API summary; auth allowed/next_action; admin work-queue, offers, cards prepare/confirm; backend routes (members, vendors, events); database tables (cards, nfc_validations, redemptions, events, event_checkins, notifications_outbox, pos_readers.device_key_hash).
  - **SMOKE_TEST.md:** Sections 8 (Member dashboard), 9 (Vendor dashboard), 10 (Offer Management); quick API checks for /api/events, /api/members/*, /api/vendors/*, /api/admin/offers; migrate:profile-icon in run order.
  - **FINAL_PRODUCT_REFACTOR_PLAN.md:** Document history updated (Phases 1–8 + deliverables, OfferManagement, completion).
  - **backend/docs/api.md:** GET /api/events documented.

**Risk:** Low. Additive only.
