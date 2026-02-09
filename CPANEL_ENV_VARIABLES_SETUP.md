# cPanel Environment Variables Setup

## Important: .env File Doesn't Work in cPanel Node.js Apps

cPanel Node.js applications **do NOT read .env files**. You must set all environment variables in the cPanel interface.

## Step-by-Step: Add All Environment Variables

Go to: **cPanel → Node.js App → Environment Variables**

### 1. Server Variables
Click **"+ ADD VARIABLE"** and add these one by one:

```
Name: PORT
Value: 3001

Name: NODE_ENV
Value: production

Name: HOST
Value: 0.0.0.0

Name: FRONTEND_URL
Value: https://www.wishwavesclub.com
```

### 2. Database Variables
```
Name: DB_HOST
Value: localhost

Name: DB_PORT
Value: 3306

Name: DB_NAME
Value: wishhosp_wwcdb_mem

Name: DB_USER
Value: wishhosp_sj400h

Name: DB_PASSWORD
Value: Pooba5963
```

**⚠️ Important for DB_PASSWORD:**
- If you get errors, try with quotes: `"Pooba@5963"`
- Or contact support if @ symbol causes issues

### 3. Security Variables
```
Name: JWT_SECRET
Value: aK9F2pX7R4NqMZcL8BvJtY5S6H0wUDeE

Name: JWT_EXPIRES_IN
Value: 7d

Name: ADMIN_API_KEY
Value: WwcAdm9Kp2Xr5Nq8Zm4Bv7Jt1YcL3Hs0UwDeE6Fg
```

### 4. NFC/Card Variables (Optional but Recommended)
```
Name: NFC_ENCRYPTION_KEY
Value: WwcNfc32KeyX7r9Km2Pq5Zn4Bv8Jt1YcL

Name: NFC_TOKEN_SECRET
Value: WwcNfcToken7r9Km2Pq5Zn4Bv8Jt1YcL3Hs0Uw

Name: CARD_SIGNING_SECRET
Value: WwcCardSign32X7r9Km2Pq5Zn4Bv8Jt1YcL

Name: CARD_SIGNING_KEY_VERSION
Value: 1
```

### 5. Email Variables
```
Name: SMTP_HOST
Value: mail.wishwavesclub.com

Name: SMTP_PORT
Value: 465

Name: SMTP_USER
Value: info@wishwavesclub.com

Name: SMTP_PASS
Value: Wishwaves@2025

Name: EMAIL_FROM
Value: info@wishwavesclub.com

Name: INQUIRY_EMAIL
Value: info@wishwavesclub.com

Name: SUBSCRIPTION_NOTIFY_EMAIL
Value: info@wishwavesclub.com
```

### 6. Payment Variables (CC Avenue - Disabled)
Since `DISABLE_CCAVENUE=1`, you can skip these or leave them empty.

### 7. Rate Limiting Variables
```
Name: RATE_LIMIT_WINDOW_MS
Value: 900000

Name: RATE_LIMIT_MAX_REQUESTS
Value: 100

Name: LOG_LEVEL
Value: info
```

### 8. Disable CC Avenue
```
Name: DISABLE_CCAVENUE
Value: 1
```

## Quick Copy-Paste Checklist

**Already Set (from your screenshot):**
- ✅ DB_HOST=localhost
- ✅ DB_NAME=wishhosp_wwcdb_mem
- ✅ DB_PASSWORD=Pooba@5963
- ✅ DB_PORT=3306
- ✅ DB_USER=wishhosp_sj400h
- ✅ FRONTEND_URL=https://www.wishwavesclub.com

**Need to Add:**
- [ ] PORT=3001
- [ ] NODE_ENV=production
- [ ] HOST=0.0.0.0
- [ ] JWT_SECRET=aK9F2pX7R4NqMZcL8BvJtY5S6H0wUDeE
- [ ] JWT_EXPIRES_IN=7d
- [ ] ADMIN_API_KEY=WwcAdm9Kp2Xr5Nq8Zm4Bv7Jt1YcL3Hs0UwDeE6Fg
- [ ] NFC_ENCRYPTION_KEY=WwcNfc32KeyX7r9Km2Pq5Zn4Bv8Jt1YcL
- [ ] NFC_TOKEN_SECRET=WwcNfcToken7r9Km2Pq5Zn4Bv8Jt1YcL3Hs0Uw
- [ ] CARD_SIGNING_SECRET=WwcCardSign32X7r9Km2Pq5Zn4Bv8Jt1YcL
- [ ] CARD_SIGNING_KEY_VERSION=1
- [ ] SMTP_HOST=mail.wishwavesclub.com
- [ ] SMTP_PORT=465
- [ ] SMTP_USER=info@wishwavesclub.com
- [ ] SMTP_PASS=Wishwaves@2025
- [ ] EMAIL_FROM=info@wishwavesclub.com
- [ ] INQUIRY_EMAIL=info@wishwavesclub.com
- [ ] SUBSCRIPTION_NOTIFY_EMAIL=info@wishwavesclub.com
- [ ] RATE_LIMIT_WINDOW_MS=900000
- [ ] RATE_LIMIT_MAX_REQUESTS=100
- [ ] LOG_LEVEL=info
- [ ] DISABLE_CCAVENUE=1

## After Adding All Variables

1. Click **"SAVE"** at the top
2. Click **"RESTART"** to restart the app
3. Check logs for any errors

## Notes

- **Don't upload .env file** - it won't be used
- **Set all variables in cPanel interface** - this is the only way
- **Special characters** (@ in passwords) should work, but if not, contact support
- **Order doesn't matter** - add them in any order

## Verification

After setting all variables and restarting:
- Check app logs - should show no environment variable errors
- Test API: `https://www.wishwavesclub.com/api/health`
- Should return: `{"status":"healthy",...}`

