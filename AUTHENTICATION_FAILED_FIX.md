# Authentication Failed - Fix Guide

## 🔍 Root Cause

The "authentication failed" error is likely caused by **domain mismatch**:

- **Registered Domain in CC Avenue:** `https://www.primewish.ae/index.html`
- **Current Redirect URLs:** `https://wishwavesclub.com/payment/response`

CC Avenue requires that redirect URLs match the registered domain in their system.

---

## ✅ Solution Options

### Option 1: Use Registered Domain (Quick Fix)

Update redirect URLs to match the registered domain:

```env
CCAVENUE_REDIRECT_URL=https://www.primewish.ae/payment/response
CCAVENUE_CANCEL_URL=https://www.primewish.ae/join?canceled=true
FRONTEND_URL=https://www.primewish.ae
```

### Option 2: Register New Domain (Recommended for Production)

If you want to use `wishwavesclub.com`:

1. **Login to CC Avenue Dashboard:**
   - URL: https://login.ccavenue.ae/jsp/merchant/merchantLogin.jsp
   - Username: `AHM_54196`
   - Password: `Wish@2027Primf`

2. **Add New Domain:**
   - Go to **Settings** → **Gateway Settings** or **Domain Settings**
   - Add `wishwavesclub.com` as a registered domain
   - Wait for approval (may take 24-48 hours)

3. **Update Redirect URLs:**
   ```env
   CCAVENUE_REDIRECT_URL=https://wishwavesclub.com/payment/response
   CCAVENUE_CANCEL_URL=https://wishwavesclub.com/join?canceled=true
   ```

---

## 🔧 Other Possible Causes

### 1. Encryption Method Mismatch

CC Avenue may require a specific encryption method. Current implementation uses AES-128-CBC, but CC Avenue might require:
- Different padding method
- Different IV generation
- Different key derivation

**Solution:** Contact CC Avenue support to get their Node.js integration kit with the correct encryption functions.

### 2. Credentials Verification

Double-check credentials match exactly:
- Merchant ID: `54196`
- Access Code: `AVBW05ME37BP44WBPB`
- Working Key: `0100316B5AA95BE06F1124CCDD4EA5B6`

**Solution:** Login to CC Avenue dashboard and verify these match exactly.

### 3. Currency Mismatch

Ensure currency matches account settings:
- Current: `AED`
- Verify in CC Avenue dashboard that account supports AED

---

## 🚀 Immediate Fix Steps

### Step 1: Update Redirect URLs to Registered Domain

```bash
cd /Users/asan/WWC_web/backend

# Update .env file
# Change:
# CCAVENUE_REDIRECT_URL=https://wishwavesclub.com/payment/response
# To:
# CCAVENUE_REDIRECT_URL=https://www.primewish.ae/payment/response

# Change:
# CCAVENUE_CANCEL_URL=https://wishwavesclub.com/join?canceled=true
# To:
# CCAVENUE_CANCEL_URL=https://www.primewish.ae/join?canceled=true
```

### Step 2: Restart Backend Server

```bash
pkill -f "node.*server.js"
cd /Users/asan/WWC_web/backend
node server.js
```

### Step 3: Test Payment Flow

1. Go to registration page
2. Fill out form
3. Click "Proceed to Payment Gateway"
4. Should redirect to CC Avenue without authentication error

---

## 📞 Contact CC Avenue Support

If the issue persists:

**CC Avenue Support:**
- Email: saurabh.yadav@avenues.co
- Phone: +971 4 553 1029 (Extn – 311)

**Provide them with:**
- Merchant ID: 54196
- Error message: "Authentication failed"
- Domain you're trying to use
- Request to either:
  - Add `wishwavesclub.com` as registered domain, OR
  - Verify current redirect URL configuration

---

## ✅ Verification Checklist

- [ ] Redirect URLs match registered domain in CC Avenue
- [ ] Credentials are correct (verify in dashboard)
- [ ] Backend server restarted after .env changes
- [ ] Test payment initiation
- [ ] Check CC Avenue dashboard for any account restrictions
- [ ] Verify currency matches account settings

---

## 🔄 Alternative: Use Test Environment

If you need to test immediately:

1. **Switch to Test Environment:**
   ```env
   CCAVENUE_PAYMENT_URL=https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction
   ```

2. **Get Test Credentials:**
   - Request test credentials from CC Avenue support
   - Test environment may have different domain requirements

3. **Test with Test Credentials:**
   - Use test merchant ID, access code, and working key
   - Test payment flow
   - Once working, switch back to production credentials

---

**Most Likely Fix:** Update redirect URLs to match registered domain `https://www.primewish.ae`

