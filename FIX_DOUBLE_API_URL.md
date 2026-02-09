# Fix: Double /api/api/ in URL

## The Problem
**Error URL:** `https://www.wishwavesclub.com/api/api/auth/register`

**Root Cause:**
- `VITE_API_URL` = `https://www.wishwavesclub.com/api` ❌
- Endpoint = `/api/auth/register`
- Result = `/api/api/auth/register` (WRONG!)

## The Fix

**Change `VITE_API_URL` to NOT include `/api`:**

```powershell
# CORRECT - No /api suffix
$env:VITE_API_URL="https://www.wishwavesclub.com"
npm run build:cpanel
```

**NOT:**
```powershell
# WRONG - Has /api suffix
$env:VITE_API_URL="https://www.wishwavesclub.com/api"  # ❌
```

## Why?

The endpoints in `api.js` already include `/api/`:
- `/api/auth/register`
- `/api/auth/login`
- `/api/payment/...`
- etc.

So `API_BASE_URL` should be just the domain, not `/api`.

## Steps to Fix

1. **Rebuild frontend with correct URL:**
   ```powershell
   $env:VITE_API_URL="https://www.wishwavesclub.com"
   npm run build:cpanel
   ```

2. **Upload new build:**
   - Upload `cpanel-build/public_html/*` to server
   - Replace all files

3. **Clear browser cache:**
   - Ctrl+Shift+Delete
   - Or hard refresh: Ctrl+F5

4. **Test:**
   - Try registering again
   - Check browser console → Network tab
   - URL should be: `https://www.wishwavesclub.com/api/auth/register` ✅

## Verification

After rebuild, check:
- Browser console → Network tab
- API request URL should be: `https://www.wishwavesclub.com/api/auth/register` (single `/api/`)
- NOT: `https://www.wishwavesclub.com/api/api/auth/register` (double `/api/api/`)

