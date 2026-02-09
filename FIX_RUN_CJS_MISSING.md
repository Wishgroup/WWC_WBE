# Fix: Cannot Find Module run.cjs

## The Problem
The startup file is set to `run.cjs` but the file doesn't exist on the server.

## Solution: Upload run.cjs OR Change Startup File

### Option 1: Upload run.cjs (If Startup File is run.cjs)

**In cPanel File Manager:**
1. Go to `Wishwaveclubbackend/`
2. Click "Upload"
3. Upload file: `backend/run.cjs` from your local computer
4. Set permissions to `644`
5. Restart app

### Option 2: Change Startup File to passenger-loader.cjs (Recommended)

**In cPanel → Node.js App:**
1. Find "Application startup file"
2. Change from: `run.cjs`
3. Change to: `passenger-loader.cjs`
4. Click "SAVE"
5. Make sure `passenger-loader.cjs` exists on server
6. Restart app

## Quick Fix Steps

1. **Check what startup file says in cPanel**
2. **If it says `run.cjs`:**
   - Upload `backend/run.cjs` to server
   - OR change it to `passenger-loader.cjs`
3. **If it says `passenger-loader.cjs`:**
   - Make sure `passenger-loader.cjs` exists on server
   - Upload it if missing
4. **Restart app**

## Verify Files Exist

**In cPanel File Manager → Wishwaveclubbackend/:**
- [ ] `passenger-loader.cjs` exists? (if using this)
- [ ] `run.cjs` exists? (if using this)
- [ ] `server.js` exists
- [ ] `package.json` exists

## After Fix

1. Restart app
2. Check logs - should no longer show "Cannot find module"
3. Test API: `/api/health`

