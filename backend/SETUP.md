# Wish Waves Club Backend - Setup Guide

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- PostgreSQL 12+ installed and running
- npm or yarn package manager

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Database Setup

#### Create Database

```bash
createdb wwc_db
```

#### Create User (Optional)

```bash
psql postgres
CREATE USER wwc_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE wwc_db TO wwc_user;
\q
```

#### Run Migration

```bash
npm run migrate
```

Or manually:

```bash
psql wwc_db < database/schema.sql
```

### 4. Environment Configuration

Create `.env` file in `backend/` directory:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wwc_db
DB_USER=wwc_user
DB_PASSWORD=your_secure_password

# Security
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
NFC_ENCRYPTION_KEY=your_nfc_encryption_key_32_bytes_min
NFC_TOKEN_SECRET=your_nfc_token_secret
ADMIN_API_KEY=your_admin_api_key_secure_random

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Fraud Detection
FRAUD_SCORE_LOW=30
FRAUD_SCORE_MEDIUM=60
FRAUD_SCORE_HIGH=90
MAX_DISTANCE_KM_PER_HOUR=1000
MAX_TAPS_PER_HOUR=10
MAX_TAPS_PER_DAY=50

# Frontend (for CORS)
FRONTEND_URL=http://localhost:5173
```

**⚠️ IMPORTANT**: Generate secure random values for:
- `JWT_SECRET` (min 32 characters)
- `NFC_ENCRYPTION_KEY` (exactly 32 bytes)
- `ADMIN_API_KEY` (secure random string)

### 5. Start Server

#### Development
```bash
npm run dev
```

#### Production
```bash
npm start
```

Server will start on `http://localhost:3001`

### 6. Verify Installation

```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-XX...",
  "service": "Wish Waves Club Backend API",
  "version": "1.0.0"
}
```

## Initial Data Setup

### 1. Create Admin User

```sql
INSERT INTO admin_users (email, password_hash, full_name, role)
VALUES (
  'admin@wishwavesclub.com',
  '$2a$10$...', -- Use bcrypt to hash your password
  'Admin User',
  'super_admin'
);
```

### 2. Create Sample Vendor

```sql
INSERT INTO vendors (vendor_name, vendor_code, country, city, currency, category, allowed_membership_tiers, max_discount_percentage)
VALUES (
  'Sample Restaurant',
  'VENDOR001',
  'United Arab Emirates',
  'Dubai',
  'AED',
  'restaurant',
  ARRAY['annual', 'lifetime'],
  20.00
);
```

### 3. Create POS Reader

```sql
INSERT INTO pos_readers (vendor_id, reader_id, reader_name, location_description)
VALUES (
  1, -- vendor_id from above
  'POS001',
  'Main Counter',
  'Ground floor, main entrance'
);
```

### 4. Create Country Rules

```sql
INSERT INTO country_rules (
  country_code, country_name, allowed_membership_types, 
  max_discount_percentage, currency, tax_rules
)
VALUES (
  'AE',
  'United Arab Emirates',
  ARRAY['annual', 'lifetime'],
  25.00,
  'AED',
  '{"vat_rate": 5.0}'::jsonb
);
```

## Testing API Endpoints

### Health Check
```bash
curl http://localhost:3001/health
```

### NFC Validation (Requires Vendor API Key)
```bash
curl -X POST http://localhost:3001/api/nfc/validate \
  -H "Content-Type: application/json" \
  -H "X-Vendor-API-Key: VENDOR001" \
  -d '{
    "cardUid": "CARD123456",
    "posReaderId": "POS001",
    "latitude": 25.2048,
    "longitude": 55.2708,
    "transactionAmount": 100.00
  }'
```

### Admin API (Requires Admin API Key)
```bash
curl http://localhost:3001/api/admin/fraud/logs \
  -H "X-Admin-API-Key: your_admin_api_key"
```

## Production Deployment

### Environment Variables

Set all environment variables in your production environment (AWS, Heroku, etc.)

### Database

- Use managed PostgreSQL service (AWS RDS, Heroku Postgres, etc.)
- Enable SSL connections
- Set up automated backups
- Configure connection pooling

### Security Checklist

- [ ] Strong JWT secret (32+ characters)
- [ ] Strong NFC encryption key (32 bytes)
- [ ] Secure admin API key
- [ ] Database credentials secured
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Firewall rules set
- [ ] Regular security updates

### Monitoring

- Set up logging (Winston → CloudWatch, Loggly, etc.)
- Monitor fraud events
- Track API performance
- Set up alerts for high fraud scores
- Monitor database performance

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql -h localhost -U wwc_user -d wwc_db
```

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001
# Kill process
kill -9 <PID>
```

### Migration Errors

```bash
# Drop and recreate database
dropdb wwc_db
createdb wwc_db
npm run migrate
```

## Next Steps

1. Integrate with existing frontend
2. Set up email service for membership applications
3. Configure payment gateway integration
4. Set up monitoring and alerting
5. Configure production database
6. Set up CI/CD pipeline
7. Load testing
8. Security audit

## Support

For issues or questions, refer to:
- `README.md` for API documentation
- `database/schema.sql` for database structure
- Code comments in service files





