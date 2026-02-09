# Fix: 500 Internal Server Error After Installation

## Problem
After installing modules, the app returns:
- **500 Internal Server Error**
- Content type: `text/html` (error page) instead of JSON
- Health check failed

## This Means
- ✅ Modules installed successfully
- ✅ App is trying to start
- ❌ App is crashing/erroring on startup

## Step 1: Check Application Logs

**In cPanel Node.js App settings:**
1. Click **"Logs"** or **"View Logs"**
2. Look for error messages
3. Check the most recent errors

**Common log locations:**
- Application logs in Node.js app settings
- Passenger log: `/home3/wishhosp/logs/passenger.log`
- Error log in cPanel → Error Log

## Step 2: Common Causes & Fixes

### Cause 1: Missing Environment Variables

**Check if these are set:**
```
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_NAME=wishhosp_wwcdb_mem
DB_USER=wishhosp_sj400h
DB_PASSWORD=Pooba@5963
DB_PORT=3306
FRONTEND_URL=https://www.wishwavesclub.com
```

**Fix:** Add all required environment variables in Node.js app settings.

### Cause 2: Database Connection Failed

**Error in logs:** "ECONNREFUSED" or "Access denied"

**Fix:**
1. Verify database credentials are correct
2. Check database exists: `wishhosp_wwcdb_mem`
3. Verify user has permissions
4. Test connection via phpMyAdmin

### Cause 3: Missing Required Files

**Check if these exist:**
- `server.js` (startup file)
- `package.json`
- Required directories: `routes/`, `services/`, `middleware/`, `database/`

**Fix:** Re-upload backend files if missing.

### Cause 4: Wrong Startup File

**Check:** Is startup file set to `server.js` or `passenger-loader.cjs`?

**Fix:**
- If using `passenger-loader.cjs`, make sure it exists
- If using `server.js`, make sure it exists and is correct
- Try switching between them

### Cause 5: Port Already in Use

**Error in logs:** "EADDRINUSE" or "Port 3001 already in use"

**Fix:**
1. Change PORT in environment variables to a different port (e.g., 3002)
2. Or kill the process using port 3001

### Cause 6: Missing Dependencies

**Error in logs:** "Cannot find module" or "MODULE_NOT_FOUND"

**Fix:**
1. Run "Run NPM Install" again
2. Check `package.json` has all dependencies
3. Verify `node_modules/` exists

### Cause 7: Syntax Error in Code

**Error in logs:** "SyntaxError" or "ReferenceError"

**Fix:**
1. Check the error message in logs
2. Fix the syntax error in the mentioned file
3. Re-upload the fixed file

## Step 3: Quick Diagnostic Steps

### 1. Check Logs First
```bash
# In cPanel, view Node.js app logs
# Look for the actual error message
```

### 2. Verify Environment Variables
- Go to Node.js app → Environment Variables
- Make sure ALL required variables are set
- Check for typos in values

### 3. Test Database Connection
- Go to cPanel → phpMyAdmin
- Try to connect with your DB credentials
- Verify database `wishhosp_wwcdb_mem` exists

### 4. Check File Permissions
- Files should be: 644
- Directories should be: 755
- `server.js` should be executable: 755

### 5. Try Different Startup File
- If using `server.js`, try `passenger-loader.cjs`
- If using `passenger-loader.cjs`, try `server.js`

## Step 4: Common Error Messages & Solutions

### "Cannot find module 'express'"
**Fix:** Run "Run NPM Install" again

### "ECONNREFUSED localhost:3306"
**Fix:** Check DB_HOST, DB_PORT, and database is running

### "Access denied for user"
**Fix:** Verify DB_USER and DB_PASSWORD are correct

### "EADDRINUSE: address already in use :::3001"
**Fix:** Change PORT to 3002 or kill process on 3001

### "SyntaxError: Unexpected token"
**Fix:** Check the file mentioned in error, fix syntax

## Step 5: Manual Test (If SSH Available)

```bash
cd ~/Wishwaveclubbackend
node server.js
```

This will show the actual error in the terminal.

## Step 6: Check Passenger Log

In cPanel:
1. Go to **Error Log** or **Raw Access Logs**
2. Look for recent errors
3. Or check: `/home3/wishhosp/logs/passenger.log`

## Most Likely Issues (In Order)

1. **Missing environment variables** (especially database credentials)
2. **Database connection failed** (wrong credentials or database doesn't exist)
3. **Wrong startup file** (server.js vs passenger-loader.cjs)
4. **Missing dependencies** (npm install didn't complete)
5. **Port conflict** (another app using port 3001)

## Quick Fix Checklist

- [ ] Check application logs for actual error
- [ ] Verify all environment variables are set
- [ ] Test database connection
- [ ] Verify startup file exists and is correct
- [ ] Run "Run NPM Install" again
- [ ] Check file permissions
- [ ] Try different startup file name

## Next Steps

1. **First:** Check the logs to see the actual error message
2. **Then:** Fix the specific issue based on the error
3. **Finally:** Restart the app

The error message in the logs will tell you exactly what's wrong!

