# Wish Waves Club – Full Website Documentation for Comprehensive Analysis

This document describes the **entire Wish Waves Club (WWC)** system: frontend, backend, database, stakeholders, deployment, and APIs. Use it for ChatGPT or any external analysis.

---

## 1. Project Overview

**Wish Waves Club** is an exclusive membership platform offering events, discounts, and premium experiences. The system consists of:

- **Frontend:** React 18 + Vite SPA with multi-page routing (React Router), membership tiers, registration, payment flows, and role-based dashboards (Member, Admin, Vendor).
- **Backend:** Node.js 18+ with Express, **MySQL** (mysql2), JWT + API-key auth, NFC validation, fraud detection, multi-country rules, dynamic offers, CCAvenue/bank-transfer payments.
- **Deployment:** Local dev (Vite + Node); production via cPanel (Apache, Passenger, Node app, MySQL).

**Domain (production):** wishwavesclub.com

---

## 2. Architecture (High-Level)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React + Vite)                         │
│  Public: /, /join, /benefits, /events, /login, /register, /support,      │
│          /terms, /privacy, /security, /cookie-policy                      │
│  Payment: /payment/success, /payment/bank-transfer/receipt/:orderId       │
│  Protected: /member/dashboard, /admin/dashboard, /vendor/dashboard        │
└─────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTP/REST (CORS: FRONTEND_URL)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js + Express)                           │
│  config/, routes/, middleware/, services/, validations/, utils/           │
│  Auth: JWT (member/admin/vendor), X-Admin-API-Key, X-Vendor-API-Key        │
│  API: /api/auth/*, /api/nfc/validate, /api/admin/*, /api/payment/*        │
└─────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           MySQL Database                                  │
│  members, nfc_cards, vendors, pos_readers, country_rules, nfc_tap_logs,   │
│  fraud_events, offers, offer_usage_logs, admin_users, audit_logs,         │
│  payment_sessions, bank_transfer_receipts, membership_applications, etc.  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Frontend (React + Vite)

### 3.1 Tech Stack

- **Framework:** React 18.2.0  
- **Build:** Vite 5.x  
- **Routing:** React Router (BrowserRouter)  
- **Auth:** Context (AuthContext), JWT in storage, ProtectedRoute by role  

### 3.2 Routes (App.jsx)

| Path | Component | Access |
|------|-----------|--------|
| `/` | Home | Public |
| `/join` | Join | Public |
| `/benefits` | Benefits | Public |
| `/events` | Events | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/register/success`, `/payment/success`, `/payment/failed`, `/payment/response` | PaymentSuccess | Public |
| `/payment/bank-transfer/receipt/:orderId` | BankTransferReceipt | Public |
| `/support` | Support | Public |
| `/terms` | Terms | Public |
| `/privacy` | Privacy | Public |
| `/security` | Security | Public |
| `/cookie-policy` | ConsentPolicy | Public |
| `/application/submitted` | ApplicationSubmitted | Public (status page) |
| `/application/pending` | ApplicationPending | Public (status page) |
| `/application/rejected` | ApplicationRejected | Public (status page) |
| `/payment/pending` | PaymentPending | Public (status page) |
| `/admin/dashboard` | AdminDashboard | Admin only |
| `/member/dashboard` | MemberDashboard | Member only |
| `/vendor/dashboard` | VendorDashboard | Vendor only |
| `/admin` | Redirects to AdminDashboard | Admin only |

### 3.3 Global UI

- **FloatingButton** – “Join Now” scrolls to memberships; fixed bottom-right.  
- **ConsentBanner** – Cookie/consent.  
- **TermsPrivacySummary** – Terms/privacy summary.  
- **PageTransition** – Wraps routes for transitions.

### 3.4 Key Pages / Sections (from WEBSITE_DOCUMENTATION)

- **Home:** Hero (LiquidEther 3D), Memberships (#memberships), Features/Benefits (#benefits), Testimonials, Footer.  
- **Header:** Logo, nav (Memberships, How it works, Why WWC, Benefits, Events), Join Now, Gift Membership, mobile menu.  
- **Memberships:** Essential ($129), Premium ($216), Elite ($324); gift section.  
- **Features:** Six benefit cards + four showcase items.  
- **Footer:** Support, Company, Legal, Join WWC links; newsletter; copyright.

### 3.5 File Structure (Frontend)

```
src/
├── App.jsx, main.jsx, index.css
├── components/     (Header, Hero, Memberships, Features, Footer, LiquidEther,
│                   ProtectedRoute, FloatingButton, ConsentBanner, admin/*, etc.)
├── pages/          (Home, Join, Benefits, Events, Login, Register, PaymentSuccess,
│                   AdminDashboard, MemberDashboard, VendorDashboard, Support, Terms, Privacy, etc.)
├── contexts/      (AuthContext.jsx)
├── services/       (api.js)
├── hooks/          (useScrollAnimation.js)
└── styles/         (animations.css)
```

### 3.6 Design

- **Colors:** Dark teal (#1a4d4d), medium teal (#2d6b6b, #4a9a9a), gray (#8b8b8b, #e5e5e5).  
- **Behavior:** Responsive, scroll animations, 3D (Three.js/React Three Fiber in LiquidEther).

---

## 4. Backend (Node.js + Express + MySQL)

### 4.1 Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 18+ |
| Framework | Express |
| Database | MySQL (mysql2) |
| Auth | JWT, X-Admin-API-Key, X-Vendor-API-Key |
| Validation | Zod |
| Logging | Winston, morgan |
| Security | Helmet, CORS, rate-limit |

### 4.2 API Response Format

- **Success:** `{ "success": true, ...data }`  
- **Error:** `{ "success": false, "error": "message", "code": "optional" }`  
- **404:** `{ "success": false, "error": "Not Found", "message": "Route ..." }`

### 4.3 API Endpoints Summary

| Area | Endpoints |
|------|-----------|
| **Auth** | POST /api/auth/register, POST /api/auth/login, GET /api/auth/me (returns allowed, next_action, status_reason for member/vendor), PUT /api/auth/profile-icon |
| **Members** | GET /api/members/me, /api/members/redemptions, /api/members/event-checkins, /api/members/vendors (JWT, role member) |
| **Vendors** | GET /api/vendors/me, /api/vendors/pos-devices; POST /api/vendors/pos-devices; GET /api/vendors/transactions (JWT, role vendor) |
| **NFC** | POST /api/nfc/validate (X-Vendor-API-Key or X-POS-READER-ID + X-POS-DEVICE-KEY; body: payload+signature or legacy cardUid+posReaderId), POST /api/nfc/redeem (validationId, invoiceId, finalAmount, currency) |
| **Events** | GET /api/events (upcoming/active events), POST /api/events/checkin (eventId, payload, signature) |
| **Admin** | GET /api/admin/work-queue; GET/POST/PUT /api/admin/offers; GET/POST /api/admin/cards/prepare, /api/admin/cards/confirm; GET/POST /api/admin/fraud/*, /api/admin/cards/blocked|block|unblock|reissue|report, /api/admin/vendors/analytics, /api/admin/bank-transfers/*, country-rules, audit-logs |
| **Payment** | POST /api/payment/create-session, /api/payment/ccavenue/*, /api/payment/bank-transfer/upload-receipt |
| **Health** | GET /health, GET /api/health |

### 4.4 Auth

- **Register:** Body: email, password, fullName, membershipType → JWT + user.  
- **Login:** Body: email, password, userType (member | admin | vendor) → JWT + user. Response includes `allowed`, `next_action`, `status_reason` for member/vendor (dashboard access only when active + paid).  
- **Me:** GET /api/auth/me with `Authorization: Bearer <token>`. Returns user + `allowed`, `next_action`, `status_reason` for member/vendor.  
- **Profile icon:** PUT /api/auth/profile-icon { iconStyle } (optional; requires profile_icon_style column or returns 503).  
- **Admin API:** Header `X-Admin-API-Key` or JWT (admin).  
- **NFC validate:** Header `X-Vendor-API-Key` (vendor_code) or X-POS-READER-ID + X-POS-DEVICE-KEY (POS device auth).

### 4.5 NFC Validation (POST /api/nfc/validate)

- **Auth:** X-Vendor-API-Key or X-POS-READER-ID + X-POS-DEVICE-KEY.  
- **Body (new flow):** payload, signature (signed card credential) → returns validationId for redeem.  
- **Body (legacy):** cardUid, posReaderId; optional: latitude, longitude, transactionAmount.  
- **Flow:** Card credential or UID → card status → fraud check → country rules → offer calculation.  
- **Response (approved):** success, approved: true, memberId, membershipType, offer, currency, timestamp; new flow also returns validationId.  
- **Response (rejected):** success: false, approved: false, reason (e.g. card_blocked), fraudScore.  
- **Redeem:** POST /api/nfc/redeem with validationId, invoiceId, finalAmount, currency (idempotent by vendor+invoiceId); enqueues notifications.

### 4.5a Events

- **GET /api/events:** List upcoming/active events (optional query: limit).  
- **POST /api/events/checkin:** Body: eventId, payload, signature. Verifies credential, event time, anti-passback; enqueues notifications.

### 4.6 Admin Endpoints (examples)

- GET /api/admin/work-queue (pending bank receipts, member applications, vendor applications, card issuance)  
- GET /api/admin/offers (query: is_active, limit, offset); POST /api/admin/offers (create); PUT /api/admin/offers/:id (update)  
- POST /api/admin/cards/prepare { memberId }; POST /api/admin/cards/confirm { issueSessionId, card_public_id, card_uid? }  
- GET /api/admin/fraud/logs (query: memberId, cardUid, severity, resolved, startDate, endDate, limit, offset)  
- GET /api/admin/fraud/stats  
- GET /api/admin/cards/blocked  
- POST /api/admin/cards/block { cardId, reason }  
- POST /api/admin/cards/unblock { cardId }  
- POST /api/admin/cards/reissue { memberId, reason }  
- GET /api/admin/vendors/analytics (vendorId, startDate, endDate)  
- GET /api/admin/bank-transfers/pending  
- POST /api/admin/bank-transfers/:receiptId/review { action: approve | reject, notes }

### 4.7 Payment

- POST /api/payment/create-session { userId, membershipType } → Stripe session (if enabled).  
- POST /api/payment/ccavenue/initiate (membershipType, amount, billingDetails, formData, paymentMethod).  
- POST /api/payment/bank-transfer/upload-receipt (multipart: orderId, receipt file).

### 4.8 Backend Structure

```
backend/
├── config/           # Env-based config (index.js)
├── database/        # MySQL connection, mysql-schema.sql
├── middleware/      # auth, rateLimit, errorHandler, requestLogger, upload
├── routes/          # auth, members, vendors, nfc, admin, payment, events
├── services/        # Audit, Fraud, NFC, Offer, CountryRule, NFCCard, Email, CCAvenue
├── utils/           # response, pagination
├── validations/     # nfc (Zod), common
├── scripts/         # migrate-mysql, add-indexes, seed
├── analytics/       # Synthetic data + KPI/fraud scripts (portfolio-safe)
├── docs/            # api.md
├── server.js        # Entry (dev)
├── run.cjs          # cPanel/Passenger entry
└── .env.example
```

### 4.9 Features (Backend)

- **NFC:** Card lifecycle (active, blocked, expired, lost, stolen, damaged, blacklisted); issuance/reissue; UID blacklist.  
- **Vendor RBAC:** Vendors by X-Vendor-API-Key; admin-only card/offer/country management.  
- **Fraud:** Rapid repeat scans, cross-vendor bursts, frequency anomalies, geo inconsistency; logged in fraud_events.  
- **Offers:** Eligibility and redemption constraints (per-day, per-vendor, usage limits); offer_usage_logs.  
- **Audit:** audit_logs + nfc_tap_logs; validation latency in audit details.  
- **Best practices:** Central error handler, Zod validation, rate limiting, Winston request logging, Helmet, CORS, pagination on list endpoints, MySQL indexes for critical lookups.

---

## 5. Database (MySQL)

### 5.1 Main Tables

| Table | Purpose |
|-------|---------|
| members | User profile, membership_type, membership_status, payment_status, fraud_score |
| nfc_cards | card_uid, member_id, card_status (active, blocked, expired, lost, stolen, damaged, blacklisted) |
| vendors | vendor_code, country, city, category, allowed_membership_tiers |
| pos_readers | vendor_id, reader_id |
| country_rules | country_code, allowed_membership_types, max_discount_percentage, tax_rules, currency |
| nfc_tap_logs | member_id, vendor_id, card_uid, pos_reader_id, tap_timestamp, fraud_score, offer_applied |
| fraud_events | member_id, card_uid, vendor_id, event_type, severity, fraud_score, resolved |
| offers | offer_code, offer_type, membership_type, vendor_category, country_code, discount_*, valid_*, usage_limit |
| offer_usage_logs | offer_id, member_id, vendor_id, nfc_tap_log_id, discount_amount, used_at |
| admin_users | email, password_hash, role (admin/super_admin/operator) |
| audit_logs | action, entity_type, entity_id, details (e.g. validation_latency_ms), created_at |
| payment_sessions | Stripe/CCAvenue session state |
| bank_transfer_receipts | order_id, receipt file path, status, reviewed_by |
| membership_applications | Application form data |
| cards | member_id, card_public_id, card_uid (optional), tier, status, expires_at (DESFire EV2 identity) |
| card_issue_sessions | member_id, issue_session_id, card_public_id, payload, signature, status |
| nfc_validations | validation_id, member_id, vendor_id, card_public_id, redeemed, expires_at |
| redemptions | validation_id, vendor_id, invoice_id, member_id, final_amount, discount_applied, currency |
| events | event_code, name, start_at, end_at, is_active |
| event_checkins | event_id, member_id, card_public_id, checked_in_at (anti-passback) |
| notifications_outbox | channel, type, member_id, payload, status (email/SMS queue) |
| pos_readers | vendor_id, reader_id, device_key_hash (POS device auth) |

### 5.2 Indexes (Performance)

- **nfc_tap_logs:** (member_id, tap_timestamp DESC), (vendor_id, tap_timestamp DESC)  
- **audit_logs:** (created_at DESC)  
- **members:** email, membership_status, fraud_status  
- **nfc_cards:** card_uid, member_id, card_status  

Optional script: `node scripts/add-indexes.js`

---

## 6. Stakeholders

| Stakeholder | Login role | Entry | Dashboard | Key APIs |
|-------------|------------|-------|-----------|----------|
| **Member** | member | Register → Pay → Approve → Login | /member/dashboard | /api/auth/*, /api/members/me, /api/members/redemptions, /api/members/event-checkins, /api/members/vendors, /api/events |
| **Admin** | admin | Login (admin) | /admin/dashboard | /api/admin/* (work-queue, offers, cards/prepare, cards/confirm, fraud, bank-transfers, etc.) |
| **Vendor** | vendor | Login (vendor) | /vendor/dashboard | /api/auth/*, /api/vendors/me, /api/vendors/pos-devices, /api/vendors/transactions, /api/nfc/validate, /api/nfc/redeem |

- **Members:** Register, pay (bank transfer or card), get approved; dashboard access only when active + paid (allowed, next_action from /api/auth/me). Use NFC at vendors, view benefits/events, redemptions, event check-ins.  
- **Admins:** Approve bank transfers (work-queue), manage fraud/cards/vendors/offers/country rules, card issuance (prepare/confirm), audit logs, NFC test.  
- **Vendors:** Login to dashboard (access when active); profile, POS device registration, transaction history. At POS use X-Vendor-API-Key or X-POS-READER-ID + X-POS-DEVICE-KEY for validate/redeem.

---

## 7. Environment Variables

### 7.1 Backend (.env)

| Variable | Description |
|----------|-------------|
| NODE_ENV | development \| production |
| PORT | Server port (default 3001) |
| HOST | 0.0.0.0 for listen all |
| DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD | MySQL |
| JWT_SECRET | Min 32 chars |
| JWT_EXPIRES_IN | e.g. 7d |
| FRONTEND_URL | CORS origin |
| ADMIN_API_KEY | Admin API key |
| RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS | Rate limit |
| LOG_LEVEL | e.g. debug |
| DISABLE_CCAVENUE | 1 to disable CCAvenue |
| SMTP_* | Email (welcome, bank-transfer instructions) |
| NFC_ENCRYPTION_KEY, NFC_TOKEN_SECRET | NFC security |

**Important for cPanel:** No leading/trailing spaces in DB_USER, DB_PASSWORD, DB_NAME in cPanel env vars and .env.

### 7.2 Local Run

```bash
cd backend
npm install
cp .env.example .env   # edit DB and secrets
npm run migrate
npm run dev
```

Frontend:

```bash
npm install
npm run dev   # http://localhost:5173
```

Backend health: `GET http://localhost:3001/health` or `GET http://localhost:3001/api/health`.

---

## 8. Deployment (cPanel)

- **Build:** `npm run build:cpanel` → `cpanel-build/` (public_html for frontend, backend folder for Node app).  
- **Frontend:** Upload `cpanel-build/public_html/` to cPanel `public_html`.  
- **Backend:** Upload backend to a subfolder (e.g. `backend`); in cPanel “Setup Node.js App” point to this folder, set env vars (DB_*, JWT_SECRET, etc.), run `npm install`, `npm run migrate`.  
- **Apache/Passenger:** cPanel uses Passenger for Node; do **not** put a proxy from `/api` to `127.0.0.1:3001` in `.htaccess` (Passenger uses dynamic ports).  
- **Database:** Create MySQL database and user in cPanel; add user to database with ALL PRIVILEGES; set DB_* in Node app env.  
- **Known issues:**  
  - “npm: command not found” in SSH → Node is in the Node.js app environment; use “Run script” or source the Node env.  
  - “Access denied” for DB user → Check for trailing/leading spaces in DB_USER/DB_PASSWORD/DB_NAME.  
  - “Can't acquire lock for app” → Passenger lock; wait and retry or contact host.  
  - 503 on /api → Ensure no incorrect proxy in `.htaccess` and Node app is started in cPanel.

---

## 9. Analytics (Portfolio-Safe)

- **Location:** `backend/analytics/`.  
- **Data:** Synthetic/anonymized only; no real customer data.  
- **Scripts:**  
  - `synthetic_data_generator.js` → `analytics/output/synthetic_scans.json`, `synthetic_fraud_events.json`.  
  - `transaction_kpi_analysis.py` → KPIs (scans/day/week/month, unique members, top vendors, success rate, latency); outputs `kpi_summary.json`, `kpi_results.png`.  
  - `fraud_rule_analysis.py` → Counts per fraud rule type → `fraud_rule_summary.json`.  
- **Docs:** `analytics/README.md`, `analytics/system_metrics.md`.

---

## 10. Security Summary

- Do not commit `.env`; use strong JWT_SECRET and ADMIN_API_KEY in production.  
- CORS restricted to FRONTEND_URL in production.  
- Rate limiting on /api and stricter on NFC validate.  
- Vendor and admin routes protected by API key or JWT; member routes by JWT.  
- Helmet, request logging, central error handler; 5xx logged to audit.

---

## 11. File / Doc Reference

- **Frontend:** `src/App.jsx`, `src/pages/*`, `src/components/*`, `src/contexts/AuthContext.jsx`, `src/services/api.js`.  
- **Backend:** `backend/server.js`, `backend/routes/*`, `backend/services/*`, `backend/database/mysql-schema.sql`.  
- **Docs:** `README.md`, `WEBSITE_DOCUMENTATION.md`, `STAKEHOLDERS.md`, `backend/README.md`, `backend/docs/api.md`, `backend/DELIVERABLES.md`, `CPANEL_DEPLOYMENT.md`.  
- **Env:** `backend/.env.example`.

---

## 12. Suggested Analysis Topics for ChatGPT

- Consistency between frontend routes and backend APIs.  
- Gaps in WEBSITE_DOCUMENTATION sitemap vs implemented routes (e.g. #how-it-works, #why-wwc, #events).  
- Member login vs membership_status (active-only access).  
- NFC validation flow, fraud rules, and indexing.  
- cPanel deployment checklist and .htaccess/proxy pitfalls.  
- API error handling and response format usage.  
- Security (CORS, rate limits, API keys, JWT).  
- Analytics pipeline and KPI definitions.

---

*Generated for comprehensive external analysis. Last consolidated from project state including backend enhancements, STAKEHOLDERS, WEBSITE_DOCUMENTATION, api.md, DELIVERABLES, and cPanel deployment notes.*
