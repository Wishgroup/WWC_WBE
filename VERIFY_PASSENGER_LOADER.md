# Verify passenger-loader.cjs on Server

## The Issue
Even though startup file is set to `passenger-loader.cjs`, Passenger is still trying to load `server.js` directly. This means the file either:
1. Doesn't exist on the server
2. Is empty
3. Has wrong content
4. Has wrong permissions

## Step 1: Verify File Exists

**In cPanel File Manager:**
1. Go to: `Wishwaveclubbackend/`
2. **Do you see `passenger-loader.cjs`?**
   - If NO → Upload it (see Step 2)
   - If YES → Check its content (see Step 3)

## Step 2: Upload passenger-loader.cjs

**If file doesn't exist or is wrong:**

1. **In cPanel File Manager:**
   - Go to `Wishwaveclubbackend/`
   - Click "Upload"
   - Select your local file: `backend/passenger-loader.cjs`
   - Upload it

2. **Or create it directly:**
   - Click "New File"
   - Name: `passenger-loader.cjs`
   - Paste this EXACT content:

```javascript
// Passenger loader - must be pure CommonJS
import('./server.js').catch(err => {
  console.error('Failed to load server:', err);
  process.exit(1);
});
```

3. **Set permissions:**
   - Right-click file → Change Permissions
   - Set to: `644`

## Step 3: Verify File Content

**In cPanel File Manager:**
1. Click on `passenger-loader.cjs`
2. Click "Edit"
3. **It should contain:**
   ```javascript
   import('./server.js').catch(err => {
     console.error('Failed to load server:', err);
     process.exit(1);
   });
   ```
4. If it's empty or different → Replace with content above
5. Save

## Step 4: Clear Passenger Cache

Sometimes Passenger caches the configuration:

1. **In cPanel File Manager:**
   - Go to `tmp/` folder (in your home directory)
   - Look for `restart.txt` file
   - Delete it if exists
   - Create new `restart.txt` file (empty is fine)

2. **Or via Terminal (if available):**
   ```bash
   touch ~/tmp/restart.txt
   ```

## Step 5: Restart App

1. In Node.js App, click **"STOP APP"**
2. Wait 10 seconds
3. Click **"RESTART"**
4. Wait 15 seconds
5. Check logs

## Step 6: Check Logs

**After restart, check logs:**
- Should NOT show ERR_REQUIRE_ESM error
- Should show app starting
- Or show a different error (which we can fix)

## If Still Doesn't Work

The file exists and has correct content, but Passenger still ignores it. This requires hosting support to fix Passenger configuration.

Contact support with:
> "Passenger is ignoring the startup file setting. Even though I set it to passenger-loader.cjs, it still tries to load server.js directly. Please check Passenger configuration."

