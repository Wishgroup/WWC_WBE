# Complete Fix for 503 Error - Step by Step

## Current Status
- ❌ Backend not running (503 error)
- ❌ Passenger can't load ES modules
- ❌ App crashes on startup

## Complete Fix - Follow These Steps Exactly

### STEP 1: Verify Startup File in cPanel

1. **Go to cPanel → Node.js App**
2. **Look at "Application startup file" field**
3. **It MUST say:** `passenger-loader.cjs`
   - If it says `server.js` → Change it to `passenger-loader.cjs` and SAVE
   - If it says something else → Change it to `passenger-loader.cjs` and SAVE

### STEP 2: Upload passenger-loader.cjs to Server

**In cPanel File Manager:**
1. Navigate to: `Wishwaveclubbackend/`
2. Check if `passenger-loader.cjs` exists
3. If it doesn't exist OR is empty:
   - Click "Upload"
   - Upload file from: `backend/passenger-loader.cjs` (your local file)
   - Or create new file with this content:

```javascript
/**
 * Passenger/cPanel loader for ES Modules
 */
(async () => {
  try {
    await import('./server.js');
  } catch (err) {
    console.error('Failed to load server.js:', err);
    process.exit(1);
  }
})();
```

4. **Set permissions to 644**

### STEP 3: Upload events.js File

**In cPanel File Manager:**
1. Navigate to: `Wishwaveclubbackend/routes/`
2. Check if `events.js` exists
3. If missing or empty:
   - Upload from: `backend/routes/events.js` (your local file)
   - Set permissions to 644

### STEP 4: Add ALL Environment Variables

**In cPanel → Node.js App → Environment Variables:**

You currently only have 2 variables. Add these:

**Critical (Required):**
- `PORT` = `3001`
- `NODE_ENV` = `production`
- `DB_PORT` = `3306`
- `DB_USER` = `wishhosp_sj400h`
- `DB_PASSWORD` = `Pooba@5963`
- `FRONTEND_URL` = `https://www.wishwavesclub.com`

**Security:**
- `JWT_SECRET` = `aK9F2pX7R4NqMZcL8BvJtY5S6H0wUDeE`
- `ADMIN_API_KEY` = `WwcAdm9Kp2Xr5Nq8Zm4Bv7Jt1YcL3Hs0UwDeE6Fg`

(Add all others from your .env file - see CPANEL_ENV_VARIABLES_SETUP.md)

### STEP 5: Install Dependencies

**In cPanel → Node.js App:**
1. Click **"Run NPM Install"**
2. Wait for it to complete (2-3 minutes)
3. Check for errors

### STEP 6: Save and Restart

1. Click **"SAVE"** (top right)
2. Click **"RESTART"**
3. Wait 15-20 seconds
4. Check logs

### STEP 7: Check Logs

**In cPanel → Node.js App → Logs:**

**Good signs:**
- ✅ No ERR_REQUIRE_ESM errors
- ✅ No "Cannot find module" errors
- ✅ App started successfully
- ✅ Server running on port 3001

**Bad signs:**
- ❌ Still shows ERR_REQUIRE_ESM → Startup file not changed
- ❌ "Cannot find module './routes/events.js'" → events.js not uploaded
- ❌ "Cannot find package 'express'" → Run NPM Install again
- ❌ Database connection errors → Check environment variables

### STEP 8: Test API

**Visit in browser:**
```
https://www.wishwavesclub.com/api/health
```

**Should return:**
```json
{"status":"healthy","timestamp":"...","service":"Wish Waves Club Backend API","version":"1.0.0"}
```

**If still 503:**
- App is not running
- Check logs for errors
- Fix errors and restart

## Quick Verification Checklist

Before restarting, verify:
- [ ] Startup file = `passenger-loader.cjs` (not server.js)
- [ ] `passenger-loader.cjs` exists in `Wishwaveclubbackend/`
- [ ] `events.js` exists in `Wishwaveclubbackend/routes/`
- [ ] All environment variables added (at least PORT, NODE_ENV, DB_*)
- [ ] NPM Install completed successfully
- [ ] Clicked SAVE
- [ ] Clicked RESTART

## If Still Not Working

**Contact hosting support with this message:**

> "My Node.js app uses ES modules but Passenger gives ERR_REQUIRE_ESM error. I've tried using passenger-loader.cjs but it's not working. Can you help configure Passenger to load ES modules, or provide an alternative Node.js handler?"

## Alternative: Try run.cjs

If `passenger-loader.cjs` doesn't work:

1. Upload `backend/run.cjs` to server
2. Change startup file to: `run.cjs`
3. Save and restart

## Most Common Issues

1. **Startup file still says `server.js`** → Change it!
2. **passenger-loader.cjs not uploaded** → Upload it!
3. **events.js missing** → Upload it!
4. **Missing environment variables** → Add them!
5. **Dependencies not installed** → Run NPM Install!

## Next Action

**Right now, do this:**
1. Check what "Application startup file" says in cPanel
2. Upload `passenger-loader.cjs` if missing
3. Upload `events.js` if missing
4. Add environment variables
5. Save and restart

Tell me what you see in the logs after restarting!

