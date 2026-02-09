# URGENT: Upload run.cjs File - Final Fix

## The Error
```
Error: Cannot find module '/home3/wishhosp/Wishwaveclubbackend/run.cjs'
```

## The Problem
The startup file is set to `run.cjs` but the file doesn't exist on the server.

## The Fix - Choose One Option

### Option 1: Upload run.cjs (If Startup File is run.cjs)

**Step 1: Get the file content**

The file `backend/run.cjs` should contain:

```javascript
/**
 * CommonJS entry point for cPanel/Passenger.
 * Passenger uses require(), but our app is ES modules ("type": "module").
 * This .cjs file is loaded by Passenger; it then loads the real app via dynamic import().
 */

// Use dynamic import() to load the ES module
(async () => {
  try {
    await import('./server.js');
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
```

**Step 2: Upload to Server**

**Via cPanel File Manager:**
1. Go to `Wishwaveclubbackend/` (root of Node.js app)
2. Click **"Upload"** button
3. Select your local file: `backend/run.cjs`
4. Upload it
5. **Set permissions to 644** (right-click → Change Permissions)

**Or Create File Directly:**
1. In File Manager, go to `Wishwaveclubbackend/`
2. Click **"New File"** (or "+ File")
3. Name it exactly: `run.cjs` (case-sensitive, lowercase)
4. Click "Edit" and paste the content above
5. **Save** the file
6. **Set permissions to 644**

**Step 3: Verify**
- File exists: `Wishwaveclubbackend/run.cjs`
- File has content (not empty)
- Permissions: 644

**Step 4: Restart App**
1. In cPanel → Node.js App
2. Click **"RESTART"**
3. Wait 15 seconds
4. Check logs - error should be gone

---

### Option 2: Change Startup File to passenger-loader.cjs

**If `passenger-loader.cjs` exists on server:**

1. **In cPanel → Node.js App:**
   - Find "Application startup file"
   - Change from: `run.cjs`
   - Change to: `passenger-loader.cjs`
   - Click **"SAVE"**

2. **Make sure `passenger-loader.cjs` exists:**
   - Check in File Manager: `Wishwaveclubbackend/passenger-loader.cjs`
   - If missing, upload it (same content as run.cjs)

3. **Restart app**

---

## Which Option to Choose?

- **If startup file says `run.cjs`:** Use Option 1 (upload run.cjs)
- **If you prefer `passenger-loader.cjs`:** Use Option 2 (change startup file)

## After Fix

1. **Check logs** - should no longer show "Cannot find module"
2. **Test API:** `https://www.wishwavesclub.com/api/health`
3. **Should work now!**

## Quick Verification

**In cPanel File Manager → Wishwaveclubbackend/:**
- [ ] `run.cjs` exists? (if using this)
- [ ] `passenger-loader.cjs` exists? (if using this)
- [ ] `server.js` exists
- [ ] `package.json` exists
- [ ] File permissions are 644

**Upload the file and restart the app!**

