# URGENT: Upload New Build & Clear Cache

## The Problem
- Error shows: `/api/api/auth/register` (double `/api/api/`)
- Response is HTML ("It works!") instead of JSON
- This means the OLD build is still being used

## The Fix

### Step 1: Upload New Build Files

**In cPanel File Manager:**
1. Go to `public_html/`
2. **Delete all existing files** (or backup first)
3. Upload ALL files from `cpanel-build/public_html/` to `public_html/`
4. Make sure `.htaccess` is uploaded (enable "Show Hidden Files")

### Step 2: Clear Browser Cache

**Method 1: Hard Refresh**
- Press `Ctrl + Shift + R` (Windows/Linux)
- Or `Cmd + Shift + R` (Mac)

**Method 2: Clear Cache Completely**
1. Press `F12` (Developer Tools)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Method 3: Incognito/Private Window**
- Open a new incognito/private window
- Test the site there (no cache)

### Step 3: Verify New Build is Active

**Check in Browser Console:**
1. Press `F12` → Console tab
2. Type: `import.meta.env.VITE_API_URL`
3. Should show: `"https://www.wishwavesclub.com"` (NOT `/api`)

**Check Network Tab:**
1. Press `F12` → Network tab
2. Try registering again
3. Check the failed request URL
4. Should be: `https://www.wishwavesclub.com/api/auth/register` (single `/api/`)
5. NOT: `https://www.wishwavesclub.com/api/api/auth/register` (double `/api/api/`)

## Why This Happens

The browser cached the old JavaScript files that had the wrong API URL. Even after uploading new files, the browser may still use cached versions.

## After Uploading & Clearing Cache

1. **Test registration again**
2. **Check browser console** - should show correct URL
3. **Check Network tab** - API request should go to single `/api/` path
4. **Response should be JSON**, not HTML

## If Still Doesn't Work

1. **Check file timestamps** - new files should have recent timestamps
2. **Check file sizes** - new build files should match `cpanel-build/public_html/`
3. **Try different browser** - to rule out cache issues
4. **Check `.htaccess`** - make sure it's uploaded and correct

## Quick Test

After uploading, visit:
- `https://www.wishwavesclub.com/api/health`

**Expected:** JSON response like `{"status":"healthy",...}`
**If HTML:** Passenger routing issue (different problem)

