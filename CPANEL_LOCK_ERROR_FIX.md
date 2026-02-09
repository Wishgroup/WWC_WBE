# Fix: "Can't acquire lock for app: Wishwaveclubbackend"

## Problem
This error occurs when cPanel cannot start/restart your Node.js application because it's locked by another process or a stale lock file.

## Solutions (Try in Order)

### Solution 1: Stop and Restart the App (Easiest)

1. **In cPanel Node.js App settings:**
   - Click **"STOP APP"** button
   - Wait 10-15 seconds for it to fully stop
   - Click **"RESTART"** button
   - Wait for it to start

2. **If STOP doesn't work:**
   - Try clicking **"DESTROY"** (this will delete the app configuration)
   - Then recreate the Node.js app with the same settings
   - Upload your backend files again
   - Set environment variables again
   - Start the app

### Solution 2: Check App Status

1. In cPanel Node.js App settings, check:
   - Is the app showing as "Running"?
   - Are there any error messages in the logs?

2. **View Logs:**
   - Click on **"Logs"** or **"View Logs"** in the Node.js app settings
   - Look for any error messages
   - Check the passenger log: `/home3/wishhosp/logs/passenger.log`

### Solution 3: Use SSH (If Available)

If you have SSH access, you can manually remove the lock:

```bash
# Navigate to your app directory
cd ~/Wishwaveclubbackend

# Check for lock files
ls -la | grep lock

# Remove any lock files (if found)
rm -f .passenger_lock
rm -f passenger.lock
rm -f tmp/pids/*.pid

# Kill any running Node.js processes for this app
pkill -f "node.*Wishwaveclubbackend"
pkill -f "passenger.*Wishwaveclubbackend"

# Wait a few seconds
sleep 5

# Try starting the app again from cPanel
```

### Solution 4: Restart Passenger/Node.js Service

If you have root/WHM access or can contact your hosting provider:

1. **Restart Passenger** (if using Passenger):
   ```bash
   touch ~/tmp/restart.txt
   ```

2. **Or restart the Node.js service** (contact hosting provider)

### Solution 5: Recreate the App (Last Resort)

If nothing else works:

1. **In cPanel:**
   - Click **"DESTROY"** on the existing app
   - Confirm deletion

2. **Create a new Node.js App:**
   - Node.js version: `18.20.8` (or 18.x)
   - Application mode: `Production`
   - Application root: `Wishwaveclubbackend`
   - Application URL: `wishwavesclub.com/api`
   - Application startup file: `passenger-loader.cjs` (or `server.js`)

3. **Upload backend files again:**
   - Upload all files from `cpanel-build/backend/` to the app root

4. **Install dependencies:**
   - Click **"Run NPM Install"**

5. **Set environment variables:**
   - Add all your environment variables again:
     - DB_HOST=localhost
     - DB_NAME=wishhosp_wwcdb_mem
     - DB_USER=wishhosp_sj400h
     - DB_PASSWORD=Pooba@5963
     - DB_PORT=3306
     - FRONTEND_URL=https://www.wishwavesclub.com
     - (and all other variables)

6. **Start the app:**
   - Click **"START APP"** or **"RESTART"**

## Quick Checklist

- [ ] Tried STOP then RESTART
- [ ] Checked app logs for errors
- [ ] Verified no duplicate Node.js apps
- [ ] Checked if app is actually running
- [ ] Tried DESTROY and recreate (if needed)

## Prevention

To avoid this in the future:
- Always use STOP before making changes
- Wait for operations to complete before starting new ones
- Don't try to start an app that's already running

## Still Having Issues?

If the problem persists:
1. Contact your hosting provider (tashjeel.ae)
2. Ask them to:
   - Check for stuck Passenger processes
   - Restart the Passenger/Node.js service
   - Clear any lock files manually

