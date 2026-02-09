# URGENT: Change Startup File to Fix ERR_REQUIRE_ESM

## The Problem
The error shows Passenger is still trying to load `server.js` directly, which means the startup file in cPanel is still set to `server.js` instead of `passenger-loader.cjs`.

## CRITICAL FIX - Do This Now:

### Step 1: Change Startup File in cPanel

1. **Go to cPanel → Node.js App**
2. **Find "Application startup file" field**
3. **Change it from:** `server.js`
4. **Change it to:** `passenger-loader.cjs`
5. **Click "SAVE"** (blue button at top right)

### Step 2: Verify passenger-loader.cjs Exists on Server

**In cPanel File Manager:**
1. Navigate to: `Wishwaveclubbackend/`
2. Check if `passenger-loader.cjs` exists
3. If it doesn't exist:
   - Upload the file from your local `backend/passenger-loader.cjs`
   - Or create it with the content below

### Step 3: Create passenger-loader.cjs (If Missing)

**In cPanel File Manager:**
1. Go to `Wishwaveclubbackend/`
2. Click "New File"
3. Name it: `passenger-loader.cjs`
4. Paste this content:

```javascript
/**
 * Passenger/cPanel loader for ES Modules
 * This CommonJS file loads server.js (ES Module) using dynamic import()
 * Set "Application startup file" to: passenger-loader.cjs
 */

// Dynamic import() works in CommonJS files
(async () => {
  try {
    await import('./server.js');
  } catch (err) {
    console.error('Failed to load server.js:', err);
    process.exit(1);
  }
})();
```

5. Save the file
6. Set permissions to: `644`

### Step 4: Restart App

1. Click **"RESTART"** button
2. Wait 10-15 seconds
3. Check logs - error should be gone

## Why This Error Happens

- **Passenger** (cPanel's Node.js handler) uses CommonJS `require()`
- **Your server.js** is an ES Module (uses `import/export`)
- **Solution:** Use `passenger-loader.cjs` as a bridge that uses `import()` to load the ES module

## Verification

After changing startup file:
- ✅ No more "ERR_REQUIRE_ESM" errors
- ✅ App starts successfully
- ✅ Logs show app running
- ✅ API works: `/api/health`

## If It Still Doesn't Work

1. **Double-check startup file** is exactly: `passenger-loader.cjs` (not `server.js`)
2. **Verify file exists** on server at: `/home3/wishhosp/Wishwaveclubbackend/passenger-loader.cjs`
3. **Check file content** - must have the `import()` code
4. **Try destroying and recreating** the app with `passenger-loader.cjs` from the start

## Quick Checklist

- [ ] Startup file changed to: `passenger-loader.cjs`
- [ ] Clicked SAVE
- [ ] `passenger-loader.cjs` exists on server
- [ ] File has correct content (with `import()`)
- [ ] Clicked RESTART
- [ ] Checked logs - no ERR_REQUIRE_ESM error

**The most important step is changing the startup file in cPanel from `server.js` to `passenger-loader.cjs`!**

