# MongoDB Atlas Setup Guide

## Step 1: Get Your MongoDB Atlas Connection String

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Go to your cluster (or create one if you don't have one)
3. Click **"Connect"** button
4. Select **"Connect your application"**
5. Choose **"Node.js"** driver and version **6.0 or later**
6. Copy the connection string - it will look like:
   ```
   mongodb+srv://wishwavesclub_db_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<password>` with your actual password: `7F9aME4dudmAK66A`
8. Add database name at the end: `&appName=wwc_backend`

## Step 2: Update Environment Variables

Create or update `.env` file in `backend/` directory:

```env
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://wishwavesclub_db_user:7F9aME4dudmAK66A@cluster0.xxxxx.mongodb.net/wwc_db?retryWrites=true&w=majority
MONGODB_DB_NAME=wwc_db

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=dev_jwt_secret_key_change_in_production_min_32_chars
JWT_EXPIRES_IN=24h

# NFC Configuration
NFC_ENCRYPTION_KEY=dev_nfc_key_32_bytes_minimum_length_here
NFC_TOKEN_SECRET=dev_nfc_token_secret

# Admin Configuration
ADMIN_API_KEY=dev_admin_api_key_change_in_production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Fraud Detection Thresholds
FRAUD_SCORE_LOW=30
FRAUD_SCORE_MEDIUM=60
FRAUD_SCORE_HIGH=90

# Geo-location Settings
MAX_DISTANCE_KM_PER_HOUR=1000
MAX_TAPS_PER_HOUR=10
MAX_TAPS_PER_DAY=50

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**Important**: Replace `cluster0.xxxxx.mongodb.net` with your actual cluster hostname from MongoDB Atlas.

## Step 3: Configure Network Access

1. In MongoDB Atlas, go to **Network Access**
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. For production, add only your server IP addresses

## Step 4: Run Migration

```bash
cd backend
npm run migrate
```

This will:
- Connect to MongoDB Atlas
- Create all collections
- Create all indexes
- Verify connection

## Step 5: Seed Sample Data (Optional)

```bash
npm run seed
```

This creates:
- Admin user
- Sample member
- Sample NFC card
- Sample vendor
- Sample country rules
- Sample offer

## Step 6: Verify Connection

Test the connection:

```bash
node -e "import('./database/mongodb-connection.js').then(m => m.connectDB().then(() => console.log('✅ Connected!')).catch(e => console.error('❌', e.message)))"
```

## Troubleshooting

### Connection Timeout
- Check network access in MongoDB Atlas
- Verify connection string is correct
- Check if cluster is running

### Authentication Failed
- Verify username and password
- Check if user has proper permissions
- Ensure password doesn't contain special characters that need URL encoding

### DNS Resolution Error
- Verify cluster hostname is correct
- Check internet connection
- Try using IP whitelist in MongoDB Atlas

## Connection String Format

The connection string should be:
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER_HOST/DATABASE_NAME?retryWrites=true&w=majority
```

Example:
```
mongodb+srv://wishwavesclub_db_user:7F9aME4dudmAK66A@cluster0.abc123.mongodb.net/wwc_db?retryWrites=true&w=majority
```

## Security Notes

- **Never commit** `.env` file to git
- Use strong passwords
- Restrict network access in production
- Use MongoDB Atlas IP whitelist
- Enable MongoDB Atlas encryption at rest
- Use connection string with SSL/TLS (mongodb+srv://)


