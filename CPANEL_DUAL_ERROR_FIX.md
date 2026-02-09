# Fix: "Received data is wrong" + "Can't acquire lock" Errors

## Problem
You're seeing two errors:
1. **"The received data is wrong"** - Configuration issue
2. **"Can't acquire lock for app"** - App is locked

## Root Cause
The "received data is wrong" error usually means:
- Invalid application root path
- Incorrect startup file name
- Missing or corrupted app configuration
- Path conflicts

## Complete Solution

### Step 1: Destroy and Recreate the App

**This is the most reliable fix for both errors:**

1. **In cPanel Node.js App:**
   - Click **"DESTROY"** button
   - Confirm deletion
   - This will remove the corrupted configuration

2. **Create a NEW Node.js App with these EXACT settings:**

   ```
   Node.js version: 18.20.8 (or 18.x)
   Application mode: Production
   Application root: Wishwaveclubbackend
   Application URL: wishwavesclub.com/api
   Application startup file: server.js
   ```

   **Important Notes:**
   - **Application root**: Should be `Wishwaveclubbackend` (no leading slash, no trailing slash)
   - **Startup file**: Try `server.js` first (not `passenger-loader.cjs` unless you specifically need it)
   - **Application URL**: `wishwavesclub.com/api` (matches your domain)

3. **After creating the app:**
   - Upload your backend files to the app root directory
   - Make sure `server.js` exists in the root
   - Make sure `package.json` exists

### Step 2: Verify File Structure

Your backend files should be in:
```
/home3/wishhosp/Wishwaveclubbackend/
├── server.js          ← Must exist
├── package.json       ← Must exist
├── passenger-loader.cjs (optional)
├── routes/
├── services/
├── middleware/
├── database/
└── ... (other files)
```

### Step 3: Install Dependencies

1. In Node.js app settings, click **"Run NPM Install"**
2. Wait for it to complete
3. Check for any errors

### Step 4: Set Environment Variables

Add these variables one by one (don't copy-paste all at once):

```
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wishhosp_wwcdb_mem
DB_USER=wishhosp_sj400h
DB_PASSWORD=Pooba@5963
FRONTEND_URL=https://www.wishwavesclub.com
```

**Plus any other variables you need** (JWT_SECRET, payment gateway, etc.)

### Step 5: Start the App

1. Click **"START APP"** or **"RESTART"**
2. Wait 10-15 seconds
3. Check the status

### Step 6: Verify It's Working

1. Check app status (should show "Running")
2. View logs for any errors
3. Test the API: `https://www.wishwavesclub.com/api/health`

## Alternative: Fix Startup File Issue

If `server.js` doesn't work, try:

1. **Check if `passenger-loader.cjs` exists:**
   - If yes, set startup file to: `passenger-loader.cjs`
   - If no, make sure `server.js` exists

2. **Verify the startup file is correct:**
   - The file must exist in the application root
   - It must be a valid Node.js file
   - Check file permissions (should be 644)

## Common Issues & Fixes

### Issue: "Application root not found"
**Fix**: Make sure the directory `Wishwaveclubbackend` exists in your home directory

### Issue: "Startup file not found"
**Fix**: 
- Verify `server.js` or `passenger-loader.cjs` exists
- Check the filename spelling (case-sensitive)
- Make sure it's in the root of the app directory

### Issue: "Invalid path"
**Fix**: 
- Application root should be: `Wishwaveclubbackend` (relative to home)
- NOT: `/home3/wishhosp/Wishwaveclubbackend` (absolute path)
- NOT: `~/Wishwaveclubbackend` (with tilde)

## If Still Having Issues

1. **Contact Hosting Support (tashjeel.ae):**
   - Tell them: "Can't acquire lock for Node.js app"
   - Ask them to:
     - Clear any lock files
     - Restart Passenger/Node.js service
     - Verify application root path

2. **Check via SSH (if available):**
   ```bash
   # Check if directory exists
   ls -la ~/Wishwaveclubbackend
   
   # Check if server.js exists
   ls -la ~/Wishwaveclubbackend/server.js
   
   # Check for lock files
   find ~/Wishwaveclubbackend -name "*lock*" -o -name "*.pid"
   
   # Remove lock files
   rm -f ~/Wishwaveclubbackend/.passenger_lock
   rm -f ~/Wishwaveclubbackend/passenger.lock
   ```

## Prevention

- Always use STOP before making configuration changes
- Don't modify app settings while it's running
- Wait for operations to complete before starting new ones
- Keep a backup of your environment variables

