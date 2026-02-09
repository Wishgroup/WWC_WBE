# Fix: 200 Status but HTML Response (Invalid JSON)

## The Problem
- Status: 200 (success)
- But response is HTML (index.html) instead of JSON
- This means `/api/*` requests are hitting the frontend, not the backend

## Root Causes

### 1. Wrong API URL in Frontend
**Check:** Open browser console → Network tab → See what URL is being called

**If you see:**
- `http://localhost:3001/api/...` → **WRONG** (this won't work in production)
- `https://www.wishwavesclub.com/api/...` → **CORRECT**

**Fix:** Rebuild frontend with correct API URL:
```bash
$env:VITE_API_URL="https://www.wishwavesclub.com/api"; npm run build:cpanel
```

### 2. Passenger Not Routing /api/* to Backend
**Check:** Test API directly:
- Visit: `https://www.wishwavesclub.com/api/health`
- **Expected:** JSON response like `{"status":"healthy",...}`
- **If you see HTML:** Passenger isn't routing correctly

**Fix:** Verify Node.js app configuration:
1. In cPanel → Node.js App
2. Check "Application URL" - should be your domain
3. Check "Application root" - should be `Wishwaveclubbackend/`
4. Check "Application startup file" - should be `run.cjs` or `passenger-loader.cjs`
5. Restart app

### 3. Backend Not Running
**Check:** Look at Node.js app logs in cPanel

**If you see errors:**
- Fix the errors (database, missing files, etc.)
- Restart app

## Quick Diagnostic Steps

### Step 1: Check What URL Frontend is Using
1. Open browser → Developer Tools (F12)
2. Go to Console tab
3. Type: `import.meta.env.VITE_API_URL`
4. **If undefined or localhost:** Rebuild with correct URL

### Step 2: Test API Directly
1. Visit: `https://www.wishwavesclub.com/api/health`
2. **If you see JSON:** API is working, frontend URL is wrong
3. **If you see HTML:** Passenger routing issue or backend not running

### Step 3: Check Browser Network Tab
1. Open Developer Tools → Network tab
2. Reload page
3. Find the failed API request
4. Check:
   - **Request URL:** What URL is being called?
   - **Response:** What is the actual response? (HTML or JSON?)

## Most Likely Fix

**Rebuild frontend with correct API URL:**

```powershell
# In PowerShell
$env:VITE_API_URL="https://www.wishwavesclub.com/api"
npm run build:cpanel
```

Then:
1. Upload new `cpanel-build/public_html/*` to server
2. Clear browser cache
3. Test again

## Verify Fix

After rebuilding and uploading:
1. Open browser console
2. Check Network tab
3. API requests should go to: `https://www.wishwavesclub.com/api/...`
4. Responses should be JSON, not HTML

## If Still Doesn't Work

**Check Passenger Configuration:**
- Passenger should automatically route `/api/*` to Node.js app
- If not, contact hosting support: "Passenger is not routing /api/* requests to my Node.js app"

