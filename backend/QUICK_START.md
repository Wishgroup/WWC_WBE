# Quick Start Guide

Get your Wish Waves Club backend up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Set Up Database

### Create Database
```bash
createdb wwc_db
```

### Run Migration
```bash
npm run migrate
```

This creates all required tables.

## Step 3: Configure Environment

Create `.env` file in `backend/` directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wwc_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Security (Generate secure random values!)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
NFC_ENCRYPTION_KEY=your_nfc_encryption_key_32_bytes
ADMIN_API_KEY=your_admin_api_key_secure_random

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**⚠️ Generate secure keys:**
```bash
# JWT Secret (32+ characters)
openssl rand -base64 32

# NFC Encryption Key (32 bytes)
openssl rand -hex 16

# Admin API Key
openssl rand -base64 24
```

## Step 4: Test Setup

```bash
npm run test-setup
```

This verifies:
- ✅ Database connection
- ✅ All tables exist
- ✅ Environment variables
- ✅ Service modules load

## Step 5: Seed Sample Data (Optional)

```bash
npm run seed
```

This creates:
- Admin user (admin@wishwavesclub.com / admin123)
- Sample member
- Sample NFC card (UID: CARD123456789)
- Sample vendor (Code: VENDOR001)
- Sample country rules
- Sample offer

## Step 6: Start Server

```bash
npm run dev
```

Server runs on `http://localhost:3001`

## Step 7: Test API

### Health Check
```bash
curl http://localhost:3001/health
```

### NFC Validation (After seeding)
```bash
curl -X POST http://localhost:3001/api/nfc/validate \
  -H "Content-Type: application/json" \
  -H "X-Vendor-API-Key: VENDOR001" \
  -d '{
    "cardUid": "CARD123456789",
    "posReaderId": "POS001",
    "latitude": 25.2048,
    "longitude": 55.2708,
    "transactionAmount": 100.00
  }'
```

### Admin API
```bash
curl http://localhost:3001/api/admin/fraud/logs \
  -H "X-Admin-API-Key: your_admin_api_key"
```

## Or Use Test Script

```bash
chmod +x examples/test-api.sh
./examples/test-api.sh
```

(Update `ADMIN_API_KEY` in the script first)

## Next Steps

1. ✅ Backend is running
2. 📖 Read `README.md` for API documentation
3. 🔧 Integrate with your frontend (see `examples/integration-example.js`)
4. 🚀 Deploy to production (see `SETUP.md`)

## Troubleshooting

### Database Connection Error
```bash
# Test connection manually
psql -h localhost -U your_db_user -d wwc_db
```

### Port Already in Use
```bash
# Find and kill process
lsof -i :3001
kill -9 <PID>
```

### Missing Tables
```bash
# Re-run migration
npm run migrate
```

## Need Help?

- 📚 See `README.md` for full documentation
- 🔧 See `SETUP.md` for detailed setup
- 📋 See `IMPLEMENTATION_SUMMARY.md` for feature overview
- 💻 See `examples/` for integration examples

---

**You're all set! 🎉**

