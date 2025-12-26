# MongoDB Atlas Setup - Quick Start

## Your Credentials

- **Username**: `wishwavesclub_db_user`
- **Password**: `7F9aME4dudmAK66A`
- **Database Name**: `wwc_db`

## Get Your Connection String

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **Node.js** driver, version **6.0 or later**
5. Copy the connection string
6. It will look like: `mongodb+srv://wishwavesclub_db_user:<password>@cluster0.XXXXX.mongodb.net/...`

## Update .env File

Add this to your `backend/.env` file:

```env
MONGODB_URI=mongodb+srv://wishwavesclub_db_user:7F9aME4dudmAK66A@YOUR_CLUSTER_HOST.mongodb.net/wwc_db?retryWrites=true&w=majority
MONGODB_DB_NAME=wwc_db
```

**Replace `YOUR_CLUSTER_HOST` with your actual cluster hostname from MongoDB Atlas.**

## Run Setup

```bash
cd backend
npm run migrate    # Create collections and indexes
npm run seed       # Add sample data (optional)
```

## Collections Created

The migration will create these collections:
- `members`
- `nfc_cards`
- `vendors`
- `pos_readers`
- `country_rules`
- `nfc_tap_logs`
- `fraud_events`
- `offers`
- `offer_usage_logs`
- `admin_users`
- `audit_logs`

All with proper indexes for performance!

See `MONGODB_SETUP.md` for detailed instructions.


