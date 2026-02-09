# ✅ FINAL cPanel DEPLOYMENT CHECKLIST
## All Issues Fixed - Production Ready Build

**Build Date:** $(Get-Date -Format "yyyy-MM-dd HH:mm")
**Build Location:** `cpanel-build/`
**Status:** ✅ **READY FOR UPLOAD**

---

## 🔧 FIXES APPLIED

✅ **API URL Fixed:** `https://www.wishwavesclub.com` (no `/api` suffix - prevents double `/api/api/`)
✅ **passenger-loader.cjs Fixed:** Proper async IIFE wrapper
✅ **run.cjs Included:** Added to build process
✅ **.htaccess Fixed:** NO proxy rules (Passenger handles `/api/*` automatically)
✅ **events.js Verified:** Route file exists and exports correctly
✅ **Build Script Updated:** Includes all necessary files

---

## 📦 BUILD CONTENTS

### Frontend (`cpanel-build/public_html/`)
- ✅ `index.html` - Main entry point
- ✅ `.htaccess` - SPA routing (NO proxy rules)
- ✅ `assets/` - All JS/CSS bundles with correct API URL
- ✅ All static assets

### Backend (`cpanel-build/backend/`)
- ✅ `run.cjs` - CommonJS loader for Passenger
- ✅ `passenger-loader.cjs` - Alternative loader
- ✅ `server.js` - Main server file
- ✅ `package.json` - Dependencies
- ✅ `routes/` - All route files (including events.js)
- ✅ `services/` - Service files
- ✅ `middleware/` - Middleware files
- ✅ `database/` - Database connection files
- ✅ `scripts/` - Migration and utility scripts

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Upload Frontend

1. **In cPanel File Manager:**
   - Go to `public_html/`
   - **Delete all existing files** (backup first if needed)
   - Upload ALL files from `cpanel-build/public_html/`
   - **Enable "Show Hidden Files"** to see `.htaccess`
   - Verify `.htaccess` is uploaded

### Step 2: Create Node.js App

1. **In cPanel → Node.js App:**
   - Click **"Create Application"**
   - **Application Root:** `Wishwaveclubbackend`
   - **Node.js Version:** 18 or higher
   - **Application Mode:** Production
   - **Application URL:** `https://www.wishwavesclub.com`
   - **Application Startup File:** `run.cjs`
   - Click **"Create"**

### Step 3: Upload Backend

1. **In File Manager:**
   - Go to `Wishwaveclubbackend/`
   - Upload ALL files from `cpanel-build/backend/`
   - **Critical files to verify:**
     - ✅ `run.cjs`
     - ✅ `passenger-loader.cjs`
     - ✅ `server.js`
     - ✅ `package.json`
     - ✅ `routes/events.js`

### Step 4: Create Uploads Directory

1. **In File Manager → Wishwaveclubbackend/:**
   - Create folder: `uploads`
   - Inside `uploads/`, create: `bank-receipts`
   - Set permissions: `755` for both

### Step 5: Set Environment Variables

**In cPanel → Node.js App → Environment Variables:**

**Required:**
```
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
FRONTEND_URL=https://www.wishwavesclub.com
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wishhosp_wwcdb_mem
DB_USER=wishhosp_sj400h
DB_PASSWORD=Pooba@5963
JWT_SECRET=aK9F2pX7R4NqMZcL8BvJtY5S6H0wUDeE
ADMIN_API_KEY=WwcAdm9Kp2Xr5Nq8Zm4Bv7Jt1YcL3Hs0UwDeE6Fg
```

**Email:**
```
SMTP_HOST=mail.wishwavesclub.com
SMTP_PORT=465
SMTP_USER=info@wishwavesclub.com
SMTP_PASS=Wishwaves@2025
EMAIL_FROM=info@wishwavesclub.com
```

(Add all other variables from your .env file)

### Step 6: Install Dependencies

**In cPanel → Node.js App:**
- Click **"Run NPM Install"**
- Wait for completion

### Step 7: Run Database Migration

**In cPanel → Node.js App → Terminal:**
```bash
cd ~/Wishwaveclubbackend
npm run migrate
```

### Step 8: Start Application

**In cPanel → Node.js App:**
- Click **"RESTART"**
- Wait 15-30 seconds
- Check **Logs** for errors

---

## ✅ VERIFICATION CHECKLIST

### After Upload:

- [ ] Frontend files uploaded to `public_html/`
- [ ] `.htaccess` uploaded (verify it has NO proxy rules)
- [ ] Backend files uploaded to `Wishwaveclubbackend/`
- [ ] `run.cjs` exists and has content
- [ ] `passenger-loader.cjs` exists
- [ ] `routes/events.js` exists
- [ ] `uploads/bank-receipts/` directories created
- [ ] All environment variables set
- [ ] Dependencies installed
- [ ] Database migration run

### After Restart:

- [ ] Node.js app status: **Running**
- [ ] No errors in logs
- [ ] Health endpoint works: `https://www.wishwavesclub.com/api/health`
- [ ] Returns JSON (not HTML)
- [ ] Frontend loads: `https://www.wishwavesclub.com`
- [ ] Registration form works
- [ ] No console errors in browser

---

## 🧪 TESTING

### Test 1: Health Endpoint
```
URL: https://www.wishwavesclub.com/api/health
Expected: {"status":"healthy",...}
```

### Test 2: Frontend
```
URL: https://www.wishwavesclub.com
Expected: Website loads correctly
```

### Test 3: Registration
```
1. Go to registration page
2. Fill form
3. Submit
Expected: No errors, successful registration
```

### Test 4: Browser Console
```
1. Open Developer Tools (F12)
2. Check Network tab
3. API requests should go to: https://www.wishwavesclub.com/api/...
4. Should NOT be: https://www.wishwavesclub.com/api/api/...
```

---

## 🐛 TROUBLESHOOTING

### Issue: "Cannot find module run.cjs"
**Fix:** Upload `run.cjs` to `Wishwaveclubbackend/` and restart

### Issue: "404 - HTML Response"
**Fix:** 
- Check Application URL (should be your domain)
- Verify backend is running
- Test `/api/health` endpoint

### Issue: "Database Connection Failed"
**Fix:**
- Verify DB credentials in environment variables
- Check database exists
- Run migration

### Issue: "Missing events.js"
**Fix:** Upload `routes/events.js` to `Wishwaveclubbackend/routes/`

---

## 📋 FINAL CHECKLIST

**Before Upload:**
- [x] Build completed successfully
- [x] API URL is correct (no `/api` suffix)
- [x] All files included in build
- [x] `.htaccess` has no proxy rules

**After Upload:**
- [ ] All files uploaded
- [ ] Directories created
- [ ] Environment variables set
- [ ] Dependencies installed
- [ ] Migration run
- [ ] App restarted

**After Testing:**
- [ ] Health endpoint works
- [ ] Frontend loads
- [ ] Registration works
- [ ] No errors in logs
- [ ] No errors in browser console

---

## 🎉 SUCCESS!

If all checks pass, your site is **LIVE and WORKING**! 🚀

**Build Location:** `cpanel-build/`
**Ready to Upload:** ✅ YES

Follow the deployment steps above exactly, and everything will work perfectly!
