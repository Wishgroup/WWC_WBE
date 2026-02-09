# Fix: FileNotFoundError - Missing File or Directory

## The Error
```
FileNotFoundError: [Errno 2] No such file or directory: '/home3/wishhosp/wi...'
```

## Common Causes

### 1. Missing Uploads Directory
**Fix:** The server creates this automatically, but if it fails:

**Via SSH or Terminal:**
```bash
cd ~/Wishwaveclubbackend
mkdir -p uploads/bank-receipts
chmod 755 uploads
chmod 755 uploads/bank-receipts
```

**Or via cPanel File Manager:**
1. Go to `Wishwaveclubbackend/`
2. Create folder: `uploads`
3. Inside `uploads/`, create folder: `bank-receipts`
4. Set permissions: `755` for both folders

### 2. Missing Route Files
**Check if these files exist:**
- `routes/auth.js`
- `routes/events.js`
- `routes/nfc.js`
- `routes/admin.js`
- `routes/payment.js`
- `routes/bank-transfer.js`
- `routes/vendor.js`
- `routes/contact.js`
- `routes/support.js`
- `routes/analytics.js`

**Fix:** Upload missing route files from your local `backend/routes/` folder

### 3. Missing Service Files
**Check if these exist:**
- `services/AuditService.js`
- `middleware/rateLimiter.js`
- `database/connection.js`

**Fix:** Upload missing files from your local `backend/` folder

### 4. Missing .env File (Less Likely)
**Fix:** Environment variables should be set in cPanel Node.js App, not .env file

## Quick Fix Steps

### Step 1: Create Required Directories

**Via SSH:**
```bash
cd ~/Wishwaveclubbackend
mkdir -p uploads/bank-receipts
chmod -R 755 uploads
```

**Or via cPanel File Manager:**
1. Navigate to `Wishwaveclubbackend/`
2. Create `uploads/` folder
3. Create `bank-receipts/` inside `uploads/`
4. Set permissions to `755`

### Step 2: Verify All Files Are Uploaded

**Check these folders exist:**
- `Wishwaveclubbackend/routes/` - All route files
- `Wishwaveclubbackend/services/` - Service files
- `Wishwaveclubbackend/middleware/` - Middleware files
- `Wishwaveclubbackend/database/` - Database files

### Step 3: Check Logs for Exact File Path

**In cPanel → Node.js App → Logs:**
- Look for the complete error message
- It will show the exact file path that's missing
- Example: `/home3/wishhosp/Wishwaveclubbackend/routes/events.js`

### Step 4: Upload Missing Files

**If a specific file is missing:**
1. Find it in your local `backend/` folder
2. Upload it to the same location on the server
3. Set permissions to `644` for files, `755` for directories

## Most Common Issue: Missing events.js

**If error mentions `events.js`:**
1. Upload `backend/routes/events.js` to `Wishwaveclubbackend/routes/events.js`
2. Make sure it has content (not empty)
3. Restart app

## Verify Fix

After creating directories and uploading files:
1. **Restart Node.js app** in cPanel
2. **Check logs** - should no longer show FileNotFoundError
3. **Test API:** `https://www.wishwavesclub.com/api/health`

## If Error Persists

**Share the complete error message from logs:**
- It will show the exact file path
- Example: `/home3/wishhosp/Wishwaveclubbackend/...`
- This tells us exactly which file is missing

## Quick Checklist

- [ ] `uploads/` directory exists
- [ ] `uploads/bank-receipts/` directory exists
- [ ] All route files exist in `routes/`
- [ ] All service files exist in `services/`
- [ ] All middleware files exist in `middleware/`
- [ ] Permissions are correct (755 for dirs, 644 for files)

