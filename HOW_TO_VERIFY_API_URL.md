# How to Verify API URL is Correct

## ❌ Don't Use Console
`import.meta.env.VITE_API_URL` won't work in browser console - it's a build-time variable, not runtime.

## ✅ Correct Ways to Check

### Method 1: Check Network Tab (Easiest)
1. Open Developer Tools (`F12`)
2. Go to **Network** tab
3. Try to register (or any API call)
4. Find the failed request (red)
5. Check the **Request URL**:
   - ✅ **CORRECT**: `https://www.wishwavesclub.com/api/auth/register`
   - ❌ **WRONG**: `https://www.wishwavesclub.com/api/api/auth/register`

### Method 2: Check Built JavaScript File
The API URL is embedded in the built file as:
- `Ea="https://www.wishwavesclub.com"` (correct - no `/api`)
- Or `API_BASE_URL="https://www.wishwavesclub.com"` (correct)

### Method 3: Check Actual API Call
1. Open Developer Tools → **Network** tab
2. Try registering
3. Look at the **actual request URL** in the network log
4. This shows what URL the frontend is actually using

## What to Look For

**In Network Tab:**
- Request URL should be: `https://www.wishwavesclub.com/api/auth/register`
- Should NOT be: `https://www.wishwavesclub.com/api/api/auth/register`

**Response:**
- Should be JSON (like `{"success":true,...}`)
- Should NOT be HTML ("It works!" or `<!DOCTYPE html>`)

## If You See Double `/api/api/`

1. **New build not uploaded** - Upload `cpanel-build/public_html/*` to server
2. **Browser cache** - Clear cache (`Ctrl+Shift+R`) or use incognito
3. **Old files still there** - Delete old files before uploading new ones

## Quick Test

After uploading new build:
1. Open Network tab
2. Try registering
3. Check the request URL
4. Should be single `/api/`, not double `/api/api/`

