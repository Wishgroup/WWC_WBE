# Fix: 503 Service Unavailable Error

## Problem
Frontend shows: **"Server returned invalid response. Status: 503"**

This means the backend API is not accessible or not running.

## Quick Diagnosis

### Step 1: Check if App is Running

**In cPanel Node.js App:**
1. Check the app status - should show "Running" (green)
2. If it shows "Stopped" or error, click **"START APP"** or **"RESTART"**

### Step 2: Check Application Logs

**In cPanel Node.js App:**
1. Click **"Logs"** or **"View Logs"**
2. Look for recent errors
3. Check if the app started successfully

**Common log errors:**
- Database connection failed
- Missing environment variables
- Port already in use
- Module not found

### Step 3: Test API Endpoint

**Try accessing directly:**
```
https://www.wishwavesclub.com/api/health
```

**Expected response:**
```json
{"status":"healthy","timestamp":"...","service":"Wish Waves Club Backend API","version":"1.0.0"}
```

**If you get 503:**
- App is not running
- App crashed on startup
- Port/proxy configuration issue

## Common Causes & Fixes

### Cause 1: App Not Started

**Fix:**
1. Go to cPanel → Node.js App
2. Click **"START APP"** or **"RESTART"**
3. Wait 10-15 seconds
4. Check status shows "Running"

### Cause 2: App Crashed on Startup

**Check logs for:**
- Missing environment variables
- Database connection errors
- Missing files (events.js, etc.)
- Port conflicts

**Fix based on error:**
- If missing env vars → Add them in cPanel
- If DB error → Check database credentials
- If missing files → Upload missing files
- If port error → Change PORT to 3002

### Cause 3: Missing Dependencies

**Fix:**
1. In Node.js App, click **"Run NPM Install"**
2. Wait for completion
3. Restart app

### Cause 4: Database Not Migrated

**Fix:**
1. Run migration (see migration commands)
2. Verify tables exist in phpMyAdmin
3. Restart app

### Cause 5: Wrong Startup File

**Check:**
- Startup file should be: `server.js` or `passenger-loader.cjs`
- File must exist in app root

**Fix:**
- Verify file exists
- Try switching between `server.js` and `passenger-loader.cjs`

### Cause 6: .htaccess Proxy Not Working

**Check:**
- `.htaccess` file exists in `public_html/`
- Proxy rules are correct

**Fix:**
- Verify `.htaccess` has proxy rules for `/api/*`
- Check mod_proxy is enabled (contact hosting if needed)

## Step-by-Step Fix

### 1. Verify App Status
```
cPanel → Node.js App → Check status
```

### 2. Check Logs
```
cPanel → Node.js App → Logs
```

### 3. Verify Environment Variables
```
cPanel → Node.js App → Environment Variables
```
Make sure all required variables are set (see CPANEL_ENV_VARIABLES_SETUP.md)

### 4. Test Direct API Access
```
Visit: https://www.wishwavesclub.com/api/health
```

### 5. Restart App
```
cPanel → Node.js App → RESTART
```

## Quick Checklist

- [ ] App status shows "Running"
- [ ] No errors in logs
- [ ] All environment variables set
- [ ] Dependencies installed (npm install)
- [ ] Database migrated
- [ ] API endpoint accessible: `/api/health`
- [ ] .htaccess file uploaded

## Test Commands (If SSH Available)

```bash
# Check if app is running
ps aux | grep node

# Check if port is listening
netstat -tuln | grep 3001

# Test database connection
cd ~/Wishwaveclubbackend
npm run check-db

# View recent logs
tail -f ~/logs/passenger.log
```

## Most Likely Issues (In Order)

1. **App not started** → Click START/RESTART
2. **App crashed** → Check logs, fix errors
3. **Missing env vars** → Add all required variables
4. **Database not migrated** → Run migration
5. **Missing files** → Upload events.js and other files

## Next Steps

1. **First:** Check app status and logs
2. **Then:** Fix any errors shown in logs
3. **Finally:** Test `/api/health` endpoint

The 503 error will go away once the app is running and accessible!

