# Fix: ERR_REQUIRE_ESM Error with Passenger

## Problem
Passenger (cPanel's Node.js handler) tries to use `require()` to load `server.js`, but `server.js` is an ES Module (uses `import/export`).

**Error:**
```
Error [ERR_REQUIRE_ESM]: require() of ES Module not supported
```

## Solution: Use passenger-loader.cjs

### Step 1: Change Startup File in cPanel

1. **In cPanel Node.js App settings:**
   - Find "Application startup file"
   - Change from: `server.js`
   - Change to: `passenger-loader.cjs`
   - Click **"SAVE"**

### Step 2: Verify passenger-loader.cjs Exists

**In cPanel File Manager:**
1. Go to: `Wishwaveclubbackend/`
2. Check if `passenger-loader.cjs` exists
3. If it doesn't exist, upload it from your local `backend/passenger-loader.cjs`

### Step 3: Verify File Content

The `passenger-loader.cjs` file should contain:
```javascript
/**
 * Passenger/cPanel loader: they use require() but our app is ESM.
 * This CommonJS stub loads server.js via dynamic import().
 * Set "Application startup file" to passenger-loader.cjs in cPanel.
 */

// Use dynamic import() to load ES module
import('./server.js').catch((err) => {
  console.error('Failed to load server.js:', err);
  process.exit(1);
});
```

### Step 4: Restart App

1. Click **"RESTART"**
2. Wait 10-15 seconds
3. Check logs - should no longer show ERR_REQUIRE_ESM error

## Why This Happens

- **Passenger** (cPanel's Node.js handler) uses CommonJS `require()`
- **Your app** uses ES Modules (`import/export`)
- **Solution:** Use `passenger-loader.cjs` as a bridge that uses `import()` to load the ES module

## Alternative: If passenger-loader.cjs Doesn't Work

If you still get errors, try creating a simpler loader:

**Create file: `passenger-loader.cjs`**
```javascript
// Load ES module using dynamic import
(async () => {
  try {
    await import('./server.js');
  } catch (err) {
    console.error('Failed to load server:', err);
    process.exit(1);
  }
})();
```

## Verification

After changing startup file to `passenger-loader.cjs`:
- ✅ No more ERR_REQUIRE_ESM errors
- ✅ App starts successfully
- ✅ API endpoint works: `/api/health`

## Quick Fix Steps

1. **Change startup file:** `server.js` → `passenger-loader.cjs`
2. **Click SAVE**
3. **Click RESTART**
4. **Check logs** - should work now!

