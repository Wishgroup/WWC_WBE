# Wish Waves Club (WWC) – Stakeholders

This document describes who the stakeholders are, how they interact with the system, and where they are represented in the codebase.

---

## 1. Members (End users / customers)

**Who they are**  
People who join WWC, pay for a membership (annual or lifetime), and use benefits at partner venues via NFC card or web.

**What they do**
- Register on the website (Create Account)
- Choose membership type (annual / lifetime)
- Pay via bank transfer (upload receipt) or card (CC Avenue; currently directed to bank transfer)
- Receive approval; membership status becomes **active**
- Log in and use the **Member Dashboard**
- Use NFC card at vendor POS for validation and offers
- View benefits, events, support, and policies

**Where in the system**
| Layer | Location |
|-------|----------|
| **Database** | `members` (profile, membership_type, membership_status, payment_status), `nfc_cards`, `payment_sessions`, `bank_transfer_receipts`, `membership_applications` |
| **Backend API** | `POST /api/auth/register`, `POST /api/auth/login` (userType=member), `GET /api/auth/me`, `POST /api/auth/save-personal-info`, `/api/payment/*` (create-session, bank-transfer, receipt upload) |
| **Frontend** | `/register`, `/login` (userType: member), `/member/dashboard`, `/payment/bank-transfer/receipt/:orderId`, `PaymentSuccess`, `BankTransferReceipt` |
| **Auth** | JWT with `role: 'member'`. `ProtectedRoute` with `requiredRole="member"` for `/member/dashboard`. |

**Notes**
- Login does **not** currently restrict by `membership_status`; any row in `members` can log in. To allow only active members, add a check in the login flow (e.g. `membership_status = 'active'`).
- Member dashboard shows profile, benefits, and (when implemented) NFC card and upcoming events.

---

## 2. Admins (WWC internal staff)

**Who they are**  
Internal operators who manage the platform: approve payments, manage cards, monitor fraud, configure rules and offers, and review audit logs.

**What they do**
- Log in with admin credentials (email + password, userType=admin)
- Approve or reject **bank transfer receipts** → activates member and sends welcome email
- View and manage **fraud** (logs, stats, resolve events)
- Manage **NFC cards** (block, unblock, reissue, report)
- View **vendor analytics** (taps, unique members per vendor)
- Manage **country rules** and **offers**
- Use **NFC test interface** for validation testing
- View **audit logs**
- Download receipt files for bank transfer reviews

**Where in the system**
| Layer | Location |
|-------|----------|
| **Database** | `admin_users` (email, password_hash, full_name, role: admin/super_admin/operator, is_active) |
| **Backend API** | All under `/api/admin/*`: fraud/logs, fraud/stats, fraud/resolve, cards/blocked, cards/block, cards/unblock, cards/reissue, cards/report, vendors/analytics, country-rules, audit-logs, bank-transfers/pending, bank-transfers/:id, bank-transfers/:id/download, bank-transfers/:id/review |
| **Frontend** | `/login` (userType: admin), `/admin/dashboard` (tabs: Fraud, Cards, Vendor Analytics, Offers, Country Rules, NFC Test, Audit Logs, Bank Transfer Review) |
| **Auth** | JWT with `role: 'admin'` **or** `X-Admin-API-Key` header for API calls. `ProtectedRoute` with `requiredRole="admin"` for `/admin/dashboard`. |

**Notes**
- Admin API can accept either JWT (from login) or `X-Admin-API-Key` (e.g. for server-side or scripted access). See `backend/middleware/auth.js` and routes in `backend/routes/admin.js`.
- Admin users are created manually (e.g. seed script or direct DB insert); there is no public “admin registration”.

---

## 3. Vendors (Partner businesses)

**Who they are**  
Partner venues (restaurant, wellness, retail, travel, etc.) that accept WWC members and validate NFC taps at their POS.

**What they do**
- Log in with vendor credentials (email + password, userType=vendor) to access **Vendor Dashboard**
- At the POS: call **NFC validate** API with card UID, reader ID, and optional transaction amount; receive approval/rejection and offer details
- No direct access to member PII beyond what’s needed for the tap (e.g. membership tier for offers)

**Where in the system**
| Layer | Location |
|-------|----------|
| **Database** | `vendors` (vendor_name, vendor_code, email, password_hash, country, city, category, allowed_membership_tiers, etc.), `pos_readers` (per vendor/location) |
| **Backend API** | `POST /api/auth/login` (userType=vendor), `GET /api/auth/me`, `POST /api/nfc/validate` (authenticated with `X-Vendor-API-Key` or vendor code) |
| **Frontend** | `/login` (userType: vendor), `/vendor/dashboard` |
| **Auth** | JWT with `role: 'vendor'` for dashboard. NFC validation uses `X-Vendor-API-Key` (vendor identity for POS integration). `ProtectedRoute` with `requiredRole="vendor"` for `/vendor/dashboard`. |

**Notes**
- Vendors are created by admins (or via seed/DB); no public vendor sign-up in the current flow.
- Tap logs are stored in `nfc_tap_logs` (member_id, vendor_id, pos_reader_id, fraud_score, offer_applied, etc.) and drive fraud detection and vendor analytics.

---

## 4. External / system (not login roles)

| Stakeholder | Role | How they interact |
|-------------|------|-------------------|
| **Payment processor** | CCAvenue (card), Stripe (optional), bank | Backend calls gateway APIs; webhooks (e.g. Stripe) or redirects (CC Avenue) update payment status. |
| **Email** | SMTP (e.g. mail.wishwavesclub.com) | Backend sends welcome, bank-transfer instructions, receipt rejection via `EmailService.js`. |
| **Hosting / cPanel** | Apache, Passenger, Node, MySQL | Serves frontend and API; Passenger runs Node app; MySQL holds all persistent data. |

---

## 5. Summary table

| Stakeholder | Login role | Main entry | Dashboard | Key APIs |
|-------------|------------|------------|-----------|----------|
| **Member** | `member` | Register → Pay → Approve → Login | `/member/dashboard` | `/api/auth/*`, `/api/payment/*` |
| **Admin** | `admin` | Login (admin) | `/admin/dashboard` | `/api/admin/*` |
| **Vendor** | `vendor` | Login (vendor) | `/vendor/dashboard` | `/api/auth/*`, `/api/nfc/validate` |

---

## 6. Optional: restricting member login to active only

Currently any `members` row can log in. If only **active** members should access the member dashboard:

1. **Backend** (`backend/routes/auth.js`): In the member branch of `POST /api/auth/login`, add a condition so that if `user.membership_status !== 'active'`, return 403 with a message like “Your membership is pending approval” (or “inactive” / “expired” as needed).
2. **Frontend**: On login response, you can also check `user.membership_status` and show a “Pending approval” or “Inactive” message and avoid redirecting to `/member/dashboard` until active.

This keeps the stakeholder model clear: **members** are end users whose access is gated by membership status once you add this check.
