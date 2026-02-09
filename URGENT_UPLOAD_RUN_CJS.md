# URGENT: Upload run.cjs File

## The Error
Passenger cannot find `/home3/wishhosp/Wishwaveclubbackend/run.cjs`

This means the file either:
- Doesn't exist on the server
- Is in the wrong location
- Has wrong permissions
- Has wrong name (case-sensitive)

## Step-by-Step Fix

### Step 1: Verify File Location

**In cPanel File Manager:**
1. Navigate to: `Wishwaveclubbackend/` (NOT a subfolder)
2. **Do you see `run.cjs` in this folder?**
   - If NO → Upload it (Step 2)
   - If YES → Check permissions (Step 3)

### Step 2: Upload run.cjs

**Method A: Upload via File Manager**
1. In File Manager, go to `Wishwaveclubbackend/`
2. Click **"Upload"** button (top menu)
3. Click **"Select File"** or drag and drop
4. Select: `backend/run.cjs` from your local computer
5. Wait for upload to complete
6. **Verify file appears** in the file list

**Method B: Create File Directly**
1. In File Manager, go to `Wishwaveclubbackend/`
2. Click **"New File"** (or "+ File")
3. Name it exactly: `run.cjs` (case-sensitive, must be lowercase)
4. Click "Edit" and paste this content:

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

5. **Save** the file
6. **Set permissions to 644**

### Step 3: Verify File Details

**After uploading, verify:**
- ✅ File name is exactly: `run.cjs` (not `Run.cjs` or `RUN.CJS`)
- ✅ File is in: `Wishwaveclubbackend/` (root of app, not in subfolder)
- ✅ File has content (not empty)
- ✅ Permissions are: `644`

### Step 4: Restart App

1. In cPanel → Node.js App
2. Click **"RESTART"**
3. Wait 15 seconds
4. Check logs

## Alternative: Use passenger-loader.cjs Instead

If `run.cjs` still doesn't work:

1. **In cPanel → Node.js App:**
   - Change "Application startup file" from: `run.cjs`
   - Change to: `passenger-loader.cjs`
   - Click **"SAVE"**

2. **Upload `passenger-loader.cjs`** to `Wishwaveclubbackend/`

3. **Restart app**

## Verification Checklist

Before restarting:
- [ ] `run.cjs` exists in `Wishwaveclubbackend/` folder
- [ ] File name is exactly `run.cjs` (lowercase)
- [ ] File has content (not empty)
- [ ] Permissions are 644
- [ ] Startup file in cPanel says `run.cjs`

## If Still Doesn't Work

**Check via SSH (if available):**
```bash
ls -la ~/Wishwaveclubbackend/run.cjs
cat ~/Wishwaveclubbackend/run.cjs
```

**Or contact support:**
> "I've uploaded run.cjs to Wishwaveclubbackend/ but Passenger still can't find it. Please verify the file exists and has correct permissions."

## Most Common Issues

1. **File uploaded to wrong folder** - Must be in `Wishwaveclubbackend/` root
2. **Wrong file name** - Must be exactly `run.cjs` (case-sensitive)
3. **File is empty** - Must have the import code
4. **Wrong permissions** - Must be 644

Upload the file and verify it exists in the correct location!

