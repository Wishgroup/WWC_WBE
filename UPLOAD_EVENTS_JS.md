# Upload events.js File to Fix 503 Error

## Problem
The server is missing the `events.js` file or it doesn't have a default export, causing the app to crash.

## Solution: Upload the Fixed File

### Option 1: Upload via cPanel File Manager (Easiest)

1. **Open cPanel File Manager:**
   - Go to cPanel → File Manager
   - Navigate to: `Wishwaveclubbackend/routes/`

2. **Check if events.js exists:**
   - If it exists, delete it first
   - If folder doesn't exist, create `routes` folder

3. **Upload the file:**
   - Click "Upload" button
   - Select the file: `backend/routes/events.js` from your local computer
   - Upload it to: `Wishwaveclubbackend/routes/events.js`

4. **Verify file permissions:**
   - Right-click on `events.js`
   - Set permissions to: `644`

5. **Restart the app:**
   - Go to Node.js App
   - Click "RESTART"

### Option 2: Upload via FTP/SFTP

1. **Connect via FTP:**
   - Host: `wishwavesclub.com`
   - Username: `wishhosp`
   - Navigate to: `/Wishwaveclubbackend/routes/`

2. **Upload file:**
   - Upload `backend/routes/events.js` from your local computer
   - Make sure it's named exactly: `events.js`

3. **Set permissions:**
   - Right-click → Properties → Permissions: `644`

4. **Restart app in cPanel**

### Option 3: Rebuild and Re-upload Entire Backend

1. **Rebuild:**
   ```bash
   npm run build:cpanel
   ```

2. **Upload entire backend:**
   - Upload all files from `cpanel-build/backend/` to `Wishwaveclubbackend/`
   - This ensures all files are up to date

3. **Restart app**

## Verify File Content

The `events.js` file should have this at the end:
```javascript
export default router;
```

If it doesn't have `export default router;`, the file is incomplete.

## Quick Fix: Create File Directly in cPanel

If you can't upload, create it directly:

1. **In cPanel File Manager:**
   - Go to `Wishwaveclubbackend/routes/`
   - Click "New File"
   - Name it: `events.js`

2. **Edit the file and paste this content:**
   (Copy from your local `backend/routes/events.js` file)

3. **Save and set permissions to 644**

4. **Restart app**

## After Uploading

1. **Restart the app:**
   - cPanel → Node.js App → RESTART

2. **Check logs:**
   - Should no longer show the events.js error

3. **Test API:**
   - Visit: `https://www.wishwavesclub.com/api/health`
   - Should return JSON response

## File Location on Server

The file should be at:
```
/home3/wishhosp/Wishwaveclubbackend/routes/events.js
```

## Verification

After uploading, verify:
```bash
# If you have SSH access
ls -la ~/Wishwaveclubbackend/routes/events.js
cat ~/Wishwaveclubbackend/routes/events.js | tail -5
# Should show: export default router;
```

