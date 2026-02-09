# Wish Waves Club (WWC) – Complete Website Structure

```
WWC_WBE/
├── index.html                      # SPA entry (Vite)
├── package.json
├── package-lock.json
├── vite.config.js
├── .env / .env.production
├── .gitignore
├── .htaccess                       # Root (if used)
├── netlify.toml
├── docker-compose.yml
├── Dockerfile
├── build-cpanel.js                 # cPanel build script
├── build-production-env.js
│
├── public/                         # Static assets (copied as-is)
│   ├── .htaccess
│   ├── _redirects
│   ├── landing_page/
│   │   └── events.png
│   └── assets/
│       ├── 3d/Images/
│       │   ├── anual_back.png
│       │   ├── anual_front.png
│       │   ├── card_back.png
│       │   └── card_fronts.png
│       ├── Bg Video-Dxqdev7y.mp4
│       ├── Events acc/
│       │   ├── Annual Gifts.jpg
│       │   ├── complementary events.jpg
│       │   ├── Destination experience.jpg
│       │   ├── Destinationexperience.jpg
│       │   ├── PartnerPrivilages.jpg
│       │   └── Referrelrewards.png
│       ├── Homepage/
│       │   └── membershipsection.png
│       ├── Login/
│       │   └── login.png
│       └── Logos/
│           └── WWC.png
│
├── src/                            # Frontend (React + Vite)
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   │
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AuditLogs.jsx, .css
│   │   │   ├── BankTransferReview.jsx, .css
│   │   │   ├── CardIssuance.jsx, .css
│   │   │   ├── CardManagement.jsx, .css
│   │   │   ├── CountryRules.jsx, .css
│   │   │   ├── FraudDashboard.jsx, .css
│   │   │   ├── NFCTestInterface.jsx, .css
│   │   │   ├── OfferManagement.jsx, .css
│   │   │   ├── VendorAnalytics.jsx, .css
│   │   │   ├── WorkQueue.jsx, .css
│   │   ├── BenefitsCarousel.jsx, .css
│   │   ├── BlurText.jsx
│   │   ├── ConsentBanner.jsx, .css
│   │   ├── CreditCard.jsx, .css
│   │   ├── ErrorBoundary.jsx
│   │   ├── Features.jsx, .css
│   │   ├── FloatingButton.jsx, .css
│   │   ├── Footer.jsx, .css
│   │   ├── Header.jsx, .css
│   │   ├── Hero.jsx, .css
│   │   ├── Intro.jsx, .css
│   │   ├── LiquidEther.jsx, .css
│   │   ├── MembershipBenefits.jsx, .css
│   │   ├── MembershipForm.jsx, .css
│   │   ├── Memberships.jsx, .css
│   │   ├── PageTransition.jsx, .css
│   │   ├── ProtectedRoute.jsx
│   │   ├── ScrollReveal.jsx, .css
│   │   ├── TermsPrivacySummary.jsx, .css
│   │   ├── ThreePillars.jsx, .css
│   │   ├── ValueProgram.jsx, .css
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/
│   │   └── useScrollAnimation.js
│   │
│   ├── pages/
│   │   ├── Home.jsx, .css
│   │   ├── Login.jsx, .css
│   │   ├── Register.jsx, .css
│   │   ├── Join.jsx, .css
│   │   ├── Benefits.jsx, .css
│   │   ├── Events.jsx, .css
│   │   ├── Support.jsx, .css
│   │   ├── AdminDashboard.jsx, .css
│   │   ├── MemberDashboard.jsx, .css
│   │   ├── VendorDashboard.jsx, .css
│   │   ├── ApplicationSubmitted.jsx
│   │   ├── ApplicationPending.jsx
│   │   ├── ApplicationRejected.jsx
│   │   ├── PaymentPending.jsx
│   │   ├── ApplicationStatus.css
│   │   ├── BankTransferReceipt.jsx, .css
│   │   ├── PaymentSuccess.jsx, .css
│   │   ├── ConsentPolicy.jsx
│   │   ├── Policy.css
│   │   ├── Privacy.jsx
│   │   ├── Security.jsx
│   │   └── Terms.jsx
│   │
│   ├── portals/
│   │   ├── admin/index.js
│   │   ├── member/index.js
│   │   ├── public/index.js
│   │   └── vendor/index.js
│   │
│   ├── services/
│   │   └── api.js                  # API client (auth, members, vendors, events, admin)
│   │
│   ├── shared/
│   │   └── index.js
│   │
│   ├── styles/
│   │   └── animations.css
│   │
│   └── utils/
│       └── cookieConsent.js
│
├── backend/                        # Node.js API (Express + MySQL)
│   ├── server.js
│   ├── run.cjs
│   ├── package.json
│   ├── .env.example
│   ├── .gitignore
│   │
│   ├── config/
│   │   └── index.js
│   │
│   ├── database/
│   │   ├── connection.js
│   │   ├── mysql-connection.js
│   │   ├── mysql-schema.sql
│   │   ├── DATABASE_LAYOUT.md
│   │   └── DATABASE_SUMMARY.md
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   ├── requestLogger.js
│   │   └── upload.js
│   │
│   ├── modules/
│   │   └── cards/
│   │       ├── cardCredential.js
│   │       └── routes.js
│   │
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── events.js
│   │   ├── members.js
│   │   ├── nfc.js
│   │   ├── payment.js
│   │   └── vendors.js
│   │
│   ├── services/
│   │   ├── AuditService.js
│   │   ├── CCAvenueService.js
│   │   ├── CountryRuleEngine.js
│   │   ├── EmailService.js
│   │   ├── FraudDetectionEngine.js
│   │   ├── NFCCardService.js
│   │   ├── NFCValidationPipeline.js
│   │   ├── NotificationOutbox.js
│   │   └── OfferEngine.js
│   │
│   ├── validations/
│   │   ├── common.js
│   │   └── nfc.js
│   │
│   ├── utils/
│   │   ├── pagination.js
│   │   └── response.js
│   │
│   ├── scripts/
│   │   ├── migrate-mysql.js
│   │   ├── run-all-migrations.js
│   │   ├── seed-mysql.js
│   │   ├── seed-sample-data.js
│   │   ├── add-indexes.js
│   │   ├── test-setup.js
│   │   └── migrations/
│   │       ├── 001-vendor-status-fields.js
│   │       ├── 002-cards-and-sessions.js
│   │       ├── 003-nfc-validations-redemptions-pos.js
│   │       ├── 004-notifications-outbox.js
│   │       ├── 005-events.js
│   │       └── 006-profile-icon-style.js
│   │
│   ├── test/
│   │   └── cardCredential.test.js
│   │
│   └── analytics/                  # Optional / tooling
│       ├── README.md
│       ├── synthetic_data_generator.js
│       ├── fraud_rule_analysis.py
│       ├── transaction_kpi_analysis.py
│       ├── system_metrics.md
│       └── output/
│
├── cpanel-build/                   # Output of npm run build:cpanel
│   ├── DEPLOYMENT_INSTRUCTIONS.md
│   ├── README.md
│   ├── WWC-frontend.zip
│   ├── WWC-backend.zip
│   ├── public_html/                # Built frontend (index.html, assets/, .htaccess)
│   └── backend/                    # Backend copy for deploy (no node_modules)
│
└── docs/
    ├── WEBSITE_STRUCTURE.md        # This file
    ├── FULL_WEBSITE_DOCUMENTATION_FOR_ANALYSIS.md
    ├── SMOKE_TEST.md
    ├── FINAL_PRODUCT_REFACTOR_PLAN.md
    ├── CHANGELOG_FINAL_PRODUCT.md
    ├── CARD_ISSUANCE_STATION.md
    └── DEPRECATED.md
```

---

## Summary

| Layer        | Tech           | Purpose |
|-------------|----------------|--------|
| **Frontend** | React, Vite    | SPA: public site, member/vendor/admin portals, auth, dashboards |
| **Backend**  | Node.js, Express | REST API: auth, members, vendors, events, NFC, payments, admin |
| **Data**     | MySQL          | Users, applications, cards, redemptions, events, notifications |
| **Deploy**   | cPanel         | `public_html` (frontend) + Node app (backend); build via `build-cpanel.js` |

Routes and API details are in `docs/FULL_WEBSITE_DOCUMENTATION_FOR_ANALYSIS.md` and `backend/docs/api.md`.
