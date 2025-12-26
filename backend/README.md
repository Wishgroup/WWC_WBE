# Wish Waves Club Backend API

Enterprise-grade backend system for Wish Waves Club membership platform with fraud detection, multi-country rules, and dynamic offers.

## Features

### ✅ Core Enterprise Features

1. **AI-Ready Fraud Detection Engine**
   - Card sharing detection
   - Card cloning attempt detection
   - Geo-location inconsistency detection
   - Excessive tap frequency monitoring
   - Country mismatch detection
   - Expired/blocked card access prevention
   - ML-ready architecture for future anomaly detection

2. **Multi-Country Vendor Rules Engine**
   - Country-specific business rules
   - Legal and compliance restrictions
   - Blackout periods
   - Discount caps per country
   - Config-driven (database), not hardcoded

3. **Dynamic Offers Engine**
   - Real-time personalized offers
   - Respects country rules and membership eligibility
   - Multiple offer types (percentage, fixed, VIP, flash)
   - Time-based restrictions
   - Usage limits

4. **NFC Validation Pipeline**
   - Strict order enforcement
   - Card UID validation
   - Card status checks
   - Fraud detection
   - Country rule validation
   - Dynamic offer calculation

5. **NFC Card Lifecycle Management**
   - Card issuance
   - Card blocking/unblocking
   - Card reissuance with UID blacklisting
   - Lost/stolen/damaged card handling

6. **Admin & Operations**
   - Fraud monitoring and analytics
   - Card management
   - Vendor analytics
   - Audit logging
   - Manual overrides

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Security**: Helmet, JWT, Rate Limiting
- **Architecture**: Modular services, RESTful API

## Installation

```bash
cd backend
npm install
```

## Configuration

1. Copy `.env.example` to `.env` and configure:
   - Database connection
   - JWT secret
   - NFC encryption keys
   - Admin API key
   - Rate limiting settings
   - Fraud detection thresholds

2. Set up PostgreSQL database:
   ```bash
   createdb wwc_db
   psql wwc_db < database/schema.sql
   ```

## Running

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

Server runs on `http://localhost:3001` by default.

## API Endpoints

### NFC Validation (Vendor POS)

**POST** `/api/nfc/validate`
- Validates NFC tap from vendor POS
- Requires vendor API key
- Returns approval status and offer

### Admin API

**GET** `/api/admin/fraud/logs` - Get fraud event logs
**GET** `/api/admin/fraud/stats` - Get fraud statistics
**GET** `/api/admin/cards/blocked` - Get blocked cards
**POST** `/api/admin/cards/block` - Block a card
**POST** `/api/admin/cards/unblock` - Unblock a card
**POST** `/api/admin/cards/reissue` - Reissue a card
**POST** `/api/admin/cards/report` - Report card lost/stolen/damaged
**GET** `/api/admin/vendors/analytics` - Get vendor usage analytics
**POST** `/api/admin/country-rules` - Update country rules
**GET** `/api/admin/audit-logs` - Get audit logs
**POST** `/api/admin/fraud/resolve` - Resolve fraud event

All admin endpoints require admin API key.

## Database Schema

See `database/schema.sql` for complete schema including:
- Members
- NFC Cards
- Vendors
- Country Rules
- NFC Tap Logs
- Fraud Events
- Offers
- Audit Logs

## Security

- JWT authentication for admin endpoints
- API key authentication for vendor endpoints
- Rate limiting on all endpoints
- Helmet.js for security headers
- Input validation
- SQL injection prevention (parameterized queries)
- Comprehensive audit logging

## Architecture

### Modular Services

- `FraudDetectionEngine.js` - Fraud detection logic
- `CountryRuleEngine.js` - Country-specific rules
- `OfferEngine.js` - Dynamic offer calculation
- `NFCValidationPipeline.js` - Main validation orchestrator
- `NFCCardService.js` - Card lifecycle management
- `AuditService.js` - Audit logging

### Middleware

- `auth.js` - Authentication middleware
- `rateLimiter.js` - Rate limiting

### Routes

- `routes/nfc.js` - NFC validation endpoints
- `routes/admin.js` - Admin endpoints

## NFC Validation Flow

1. **Card UID Validation** - Verify card exists
2. **Card Status Check** - Check if active/blocked/expired
3. **Fraud Detection** - Run fraud detection rules
4. **Country Rule Validation** - Validate against country rules
5. **Dynamic Offer Calculation** - Calculate best offer
6. **Response** - Return approval/denial with offer

## Fraud Detection Rules

- **Low (0-30)**: Logged only
- **Medium (30-60)**: Soft restriction + alert
- **High (60+)**: Auto block card + admin alert

## Country Rules

Country rules are stored in database and can be updated via admin API. Rules include:
- Allowed membership types
- Maximum discount percentages
- Tax rules
- Compliance restrictions
- Blackout periods

## Offers

Offers are calculated in real-time based on:
- Membership type
- Vendor category
- Country rules
- Time & day
- Member usage history
- Fraud status

Only the best eligible offer is returned per tap.

## Card Management

- Cards store only UID and encrypted backend token
- Backend is single source of truth
- Old card UIDs are permanently blacklisted on reissuance
- Supports lost, stolen, damaged card scenarios

## Monitoring & Analytics

- Fraud event logs
- Vendor usage analytics
- Member fraud scores
- Offer usage tracking
- Comprehensive audit logs

## Future Enhancements (ML-Ready)

The fraud detection engine is designed to be extended with:
- Isolation Forest for anomaly detection
- Autoencoder for pattern recognition
- Real-time ML model inference
- Continuous learning from fraud events

## License

MIT License - Copyright (c) 2025 Wishgroup





