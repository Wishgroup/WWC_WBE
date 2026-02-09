# Fix: 404 Error - Passenger Not Routing /api/* to Backend

## ✅ Progress!
- URL is correct: `https://www.wishwavesclub.com/api/auth/register` (single `/api/`)
- Frontend is working correctly
- Problem: Passenger isn't routing `/api/*` to the Node.js backend

## The Issue

**404 Error with HTML Response** means:
- Apache is serving `index.html` (frontend) instead of routing to backend
- Passenger isn't intercepting `/api/*` requests

## Solution: Configure Passenger Routing

### Step 1: Check Node.js App Configuration

**In cPanel → Node.js App:**

1. **Application URL:**
   - Should be: `https://www.wishwavesclub.com` (your domain)
   - NOT: `https://www.wishwavesclub.com/api` or subdomain

2. **Application Root:**
   - Should be: `Wishwaveclubbackend/` (or your backend folder)
   - Make sure it's the correct folder

3. **Application Startup File:**
   - Should be: `run.cjs` or `passenger-loader.cjs`
   - Make sure the file exists on the server

4. **Node.js Version:**
   - Should be: Node.js 18 or higher

### Step 2: Verify Backend is Running

**Check Logs:**
1. In cPanel → Node.js App → **Logs**
2. Look for errors or startup messages
3. Should see: "Server running on port..." or similar

**If you see errors:**
- Fix the errors first
- Common issues: missing dependencies, database connection, missing files

### Step 3: Test Backend Directly

**Via SSH or Terminal:**
```bash
curl https://www.wishwavesclub.com/api/health
```

**Expected:** JSON response like `{"status":"healthy",...}`
**If HTML:** Passenger routing issue

### Step 4: Check .htaccess (Frontend)

**In `public_html/.htaccess`:**
- Should NOT have proxy rules for `/api/*`
- Should only have SPA routing rules
- Make sure it doesn't interfere with Passenger

### Step 5: Verify Passenger Configuration

**Passenger should automatically route `/api/*` to Node.js app IF:**
- Node.js app is running
- Application URL matches your domain
- No conflicting `.htaccess` rules

## Common Issues & Fixes

### Issue 1: Backend Not Running
**Fix:**
- Restart Node.js app in cPanel
- Check logs for errors
- Fix any startup errors

### Issue 2: Wrong Application URL
**Fix:**
- Set Application URL to: `https://www.wishwavesclub.com`
- NOT a subdomain or `/api` path

### Issue 3: Missing Startup File
**Fix:**
- Make sure `run.cjs` or `passenger-loader.cjs` exists
- Upload it if missing
- Set correct startup file in cPanel

### Issue 4: .htaccess Interference
**Fix:**
- Check `public_html/.htaccess`
- Remove any proxy rules for `/api/*`
- Let Passenger handle routing

## Quick Diagnostic

1. **Check if backend is running:**
   - cPanel → Node.js App → Status should be "Running"
   - Check logs for errors

2. **Test health endpoint:**
   - Visit: `https://www.wishwavesclub.com/api/health`
   - Should return JSON, not HTML

3. **Check Application URL:**
   - Should match your domain exactly
   - No subdomain or path suffix

## If Still Doesn't Work

**Contact hosting support:**
> "Passenger is not routing `/api/*` requests to my Node.js app. The app is running, but requests to `/api/*` return 404 with HTML instead of being routed to the backend. Please verify Passenger configuration."

## Most Likely Fix

**Restart the Node.js app:**
1. In cPanel → Node.js App
2. Click **"RESTART"**
3. Wait 15 seconds
4. Test again: `https://www.wishwavesclub.com/api/health`

If health endpoint works, registration should work too!

