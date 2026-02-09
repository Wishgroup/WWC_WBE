# Fix All Three Errors

## Error Summary

1. **Environment Variable Format Error**
   - `export: '=Pooba@5963': not a valid identifier`
   - `export: '=3306': not a valid identifier`

2. **Missing Dependencies**
   - `Cannot find package 'express'`

3. **Missing Default Export**
   - `The requested module './routes/events.js' does not provide an export named 'default'`

## Fix 1: Environment Variables (CRITICAL)

The password `Pooba@5963` contains special characters that break the export command.

**In cPanel Node.js App → Environment Variables:**

**WRONG (causes error):**
```
DB_PASSWORD=Pooba@5963
```

**CORRECT (use quotes or escape):**
```
DB_PASSWORD="Pooba@5963"
```

**OR remove quotes entirely and set it directly:**
- Click "Edit" on DB_PASSWORD
- Enter value: `Pooba@5963` (without quotes in the value field)
- Make sure the variable name is exactly: `DB_PASSWORD` (no spaces)

**For all environment variables, make sure:**
- Variable name has NO spaces
- Value is entered correctly
- No extra quotes unless needed
- Special characters in passwords should work, but if not, contact support

## Fix 2: Missing Dependencies

**In cPanel Node.js App:**
1. Click **"Run NPM Install"** again
2. Wait for it to complete (may take 2-3 minutes)
3. Check for any errors during installation

**If it still fails:**
- Make sure `package.json` exists in the app root
- Check file permissions (should be 644)
- Try destroying and recreating the app

## Fix 3: Events Route File (FIXED)

I've created the missing `events.js` file. You need to:

1. **Upload the fixed `backend/routes/events.js` file** to your server
2. **Or** rebuild and re-upload the backend

**Quick fix - Upload just this file:**
- Download the fixed `events.js` from your local `backend/routes/events.js`
- Upload it to: `/home3/wishhosp/Wishwaveclubbackend/routes/events.js`
- Make sure it has proper content (not empty)

## Complete Fix Steps

### Step 1: Fix Environment Variables
1. Go to Node.js App → Environment Variables
2. Edit `DB_PASSWORD`
3. Set value to: `Pooba@5963` (try with and without quotes if one doesn't work)
4. Save
5. Do the same for `DB_PORT` (should be just `3306`)

### Step 2: Reinstall Dependencies
1. Click **"Run NPM Install"**
2. Wait for completion
3. Check for errors

### Step 3: Upload Fixed events.js
1. Upload the fixed `backend/routes/events.js` file
2. Or rebuild backend and re-upload

### Step 4: Restart App
1. Click **"RESTART"**
2. Check logs for errors

## Verification

After fixes, check logs should show:
- ✅ No environment variable errors
- ✅ No "Cannot find package" errors
- ✅ No "does not provide an export" errors
- ✅ App starts successfully

## If Environment Variables Still Fail

If the password with `@` symbol still causes issues:

1. **Contact support** to set it manually
2. **Or** temporarily change the password to something without special characters
3. **Or** use a different format (some hosts require base64 encoding)

The `@` symbol in passwords can sometimes cause issues with shell exports.

