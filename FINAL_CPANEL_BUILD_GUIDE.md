# Final cPanel Build - Complete Deployment Guide

## ✅ All Issues Fixed - Ready for Production

This guide provides the complete, error-free build process for cPanel deployment.

## Prerequisites

- Node.js 18+ installed locally
- All dependencies installed (`npm install` in root and `backend/`)
- Production domain: `https://www.wishwavesclub.com`

## Step 1: Build the Application

### Build Command

```powershell
# In PowerShell (Windows)
$env:VITE_API_URL="https://www.wishwavesclub.com"
npm run build:cpanel
```

```bash
# In Bash/Linux/Mac
VITE_API_URL="https://www.wishwavesclub.com" npm run build:cpanel
```

**IMPORTANT:** 
- API URL is `https://www.wishwavesclub.com` (NO `/api` suffix)
- Endpoints already include `/api/` in the code
- This prevents double `/api/api/` in URLs

### What the Build Does

1. ✅ Cleans previous build
2. ✅ Builds frontend with correct API URL
3. ✅ Creates `.htaccess` (NO proxy rules - Passenger handles `/api/*`)
4. ✅ Prepares backend files
5. ✅ Includes `run.cjs` and `passenger-loader.cjs`
6. ✅ Creates deployment packages

## Step 2: Upload to cPanel

### Frontend Upload

1. **In cPanel File Manager:**
   - Go to `public_html/`
   - **Delete all existing files** (or backup first)
   - Upload ALL files from `cpanel-build/public_html/`
   - **Make sure `.htaccess` is uploaded** (enable "Show Hidden Files")

### Backend Upload

1. **Create Node.js App in cPanel:**
   - Go to cPanel → **Node.js App**
   - Click **"Create Application"**
   - **Application Root:** `Wishwaveclubbackend` (or your preferred name)
   - **Node.js Version:** 18 or higher
   - **Application Mode:** Production
   - **Application URL:** `https://www.wishwavesclub.com` (your domain)
   - **Application Startup File:** `run.cjs`
   - Click **"Create"**

2. **Upload Backend Files:**
   - In File Manager, go to `Wishwaveclubbackend/`
   - Upload ALL files from `cpanel-build/backend/`
   - **Important files:**
     - `run.cjs` ✅
     - `passenger-loader.cjs` ✅
     - `server.js` ✅
     - `package.json` ✅
     - `routes/` folder (all route files) ✅
     - `services/` folder ✅
     - `middleware/` folder ✅
     - `database/` folder ✅
     - `scripts/` folder ✅

3. **Create Uploads Directory:**
   - In `Wishwaveclubbackend/`, create folder: `uploads`
   - Inside `uploads/`, create folder: `bank-receipts`
   - Set permissions: `755` for both folders

## Step 3: Configure Environment Variables

**In cPanel → Node.js App → Environment Variables:**

### Required Variables

```env
# Server
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
FRONTEND_URL=https://www.wishwavesclub.com

# Database (cPanel MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wishhosp_wwcdb_mem
DB_USER=wishhosp_sj400h
DB_PASSWORD=Pooba@5963

# Security
JWT_SECRET=aK9F2pX7R4NqMZcL8BvJtY5S6H0wUDeE
JWT_EXPIRES_IN=7d
ADMIN_API_KEY=WwcAdm9Kp2Xr5Nq8Zm4Bv7Jt1YcL3Hs0UwDeE6Fg

# NFC / Card (optional)
NFC_ENCRYPTION_KEY=WwcNfc32KeyX7r9Km2Pq5Zn4Bv8Jt1YcL
NFC_TOKEN_SECRET=WwcNfcToken7r9Km2Pq5Zn4Bv8Jt1YcL3Hs0Uw
CARD_SIGNING_SECRET=WwcCardSign32X7r9Km2Pq5Zn4Bv8Jt1Y
CARD_SIGNING_KEY_VERSION=1

# Email
SMTP_HOST=mail.wishwavesclub.com
SMTP_PORT=465
SMTP_USER=info@wishwavesclub.com
SMTP_PASS=Wishwaves@2025
EMAIL_FROM=info@wishwavesclub.com
INQUIRY_EMAIL=info@wishwavesclub.com
SUBSCRIPTION_NOTIFY_EMAIL=info@wishwavesclub.com

# Payment (CC Avenue - optional)
DISABLE_CCAVENUE=1

# Rate limiting & logging
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

## Step 4: Install Dependencies

**In cPanel → Node.js App:**
1. Click **"Run NPM Install"**
2. Wait for completion (may take 2-3 minutes)
3. Check for errors in the output

## Step 5: Run Database Migration

**In cPanel → Node.js App → Terminal:**
```bash
cd ~/Wishwaveclubbackend
npm run migrate
```

**Or via SSH:**
```bash
cd ~/Wishwaveclubbackend
npm run migrate
```

This creates all required database tables.

## Step 6: Start the Application

**In cPanel → Node.js App:**
1. Click **"RESTART"**
2. Wait 15-30 seconds
3. Check **Logs** for errors

## Step 7: Verify Deployment

### Test Health Endpoint

Visit: `https://www.wishwavesclub.com/api/health`

**Expected:** JSON response:
```json
{
  "status": "healthy",
  "timestamp": "2025-02-09T...",
  "service": "Wish Waves Club Backend API",
  "version": "1.0.0"
}
```

**If you see HTML:** Passenger routing issue (see troubleshooting)

### Test Frontend

Visit: `https://www.wishwavesclub.com`

**Expected:** Website loads correctly

### Test Registration

1. Go to registration page
2. Fill in form
3. Submit
4. **Should work without errors**

## Troubleshooting

### Error: "Cannot find module run.cjs"

**Fix:**
- Upload `run.cjs` to `Wishwaveclubbackend/`
- Verify file exists and has content
- Set permissions to 644
- Restart app

### Error: "404 - HTML Response"

**Fix:**
- Check Application URL in cPanel (should be your domain)
- Verify backend is running (check logs)
- Test `/api/health` endpoint
- Restart Node.js app

### Error: "Database Connection Failed"

**Fix:**
- Verify database credentials in environment variables
- Check database exists in cPanel MySQL
- Test connection in phpMyAdmin
- Run migration: `npm run migrate`

### Error: "Missing events.js"

**Fix:**
- Upload `backend/routes/events.js` to `Wishwaveclubbackend/routes/events.js`
- Verify file has content
- Restart app

## File Structure After Upload

```
public_html/
├── index.html
├── .htaccess ✅ (NO proxy rules)
├── assets/
│   ├── index-*.js
│   └── index-*.css
└── ...

Wishwaveclubbackend/
├── run.cjs ✅
├── passenger-loader.cjs ✅
├── server.js ✅
├── package.json ✅
├── routes/
│   ├── events.js ✅
│   ├── auth.js ✅
│   └── ...
├── services/
├── middleware/
├── database/
├── scripts/
└── uploads/
    └── bank-receipts/ ✅
```

## Key Points

✅ **API URL:** `https://www.wishwavesclub.com` (no `/api` suffix)
✅ **Startup File:** `run.cjs`
✅ **.htaccess:** NO proxy rules (Passenger handles `/api/*`)
✅ **Uploads:** Create `uploads/bank-receipts/` directory
✅ **Environment Variables:** Set all required variables
✅ **Database:** Run migration after setup

## Final Checklist

- [ ] Built with correct API URL (no `/api` suffix)
- [ ] Frontend uploaded to `public_html/`
- [ ] `.htaccess` uploaded (no proxy rules)
- [ ] Backend uploaded to `Wishwaveclubbackend/`
- [ ] `run.cjs` exists and has content
- [ ] `uploads/bank-receipts/` directories created
- [ ] All environment variables set
- [ ] Dependencies installed (`npm install`)
- [ ] Database migration run (`npm run migrate`)
- [ ] Node.js app restarted
- [ ] Health endpoint works: `/api/health`
- [ ] Frontend loads correctly
- [ ] Registration form works

## Support

If issues persist:
1. Check Node.js app logs in cPanel
2. Verify all files are uploaded correctly
3. Test health endpoint: `/api/health`
4. Contact hosting support if Passenger routing issues

---

**Build is ready! Follow these steps exactly and your site will work perfectly! 🚀**

