# Merchant Authentication Failed - Fix Guide

## 🔍 Root Cause

"Merchant Authentication Failed" typically means:
1. **Encryption method mismatch** - CC Avenue requires their specific encryption algorithm
2. **Credentials don't match** - Merchant ID, Access Code, or Working Key are incorrect
3. **Encryption key format issue** - Working key might need different handling

---

## ✅ Solution 1: Verify Credentials in Dashboard

**CRITICAL:** You must verify the credentials match exactly:

1. **Login to CC Avenue Dashboard:**
   - URL: https://login.ccavenue.ae/jsp/merchant/merchantLogin.jsp
   - Username: `AHM_54196`
   - Password: `Wish@2027Primf`

2. **Go to Settings → API keys**

3. **Verify these match EXACTLY:**
   - Merchant ID: Should be `54196`
   - Access Code: Should start with `AVBW...`
   - Working Key: Should be `0100316B5AA95BE06F1124CCDD4EA5B6`

4. **Copy them fresh** and update `.env` file if they differ

---

## ✅ Solution 2: Use CC Avenue Integration Kit

CC Avenue provides official integration kits with correct encryption functions.

### Steps:

1. **Download CC Avenue Node.js Integration Kit:**
   - Contact CC Avenue support: saurabh.yadav@avenues.co
   - Request: "Node.js integration kit for UAE region"
   - They will provide encryption/decryption functions

2. **Replace Current Encryption Functions:**
   - The kit will have `encrypt()` and `decrypt()` functions
   - Replace the functions in `backend/services/CCAvenueService.js`
   - Use their exact implementation

3. **Test with their sample code**

---

## ✅ Solution 3: Fix Encryption Method

CC Avenue might require different encryption. Common issues:

### Issue 1: Padding Method
Current: Padding to multiple of 8 bytes
CC Avenue might require: PKCS7 padding (which is what we're using, but might need different block size)

### Issue 2: Key Length
Current: Using first 16 bytes of working key
CC Avenue might require: Full 32-byte key or different key derivation

### Issue 4: IV Generation
Current: Random IV
CC Avenue might require: Specific IV or zero IV

---

## 🔧 Immediate Action Items

### Step 1: Verify Credentials
```bash
# Login to CC Avenue dashboard and verify:
# - Merchant ID: 54196
# - Access Code: AVBW05ME37BP44WBPB  
# - Working Key: 0100316B5AA95BE06F1124CCDD4EA5B6
```

### Step 2: Contact CC Avenue Support
**Email:** saurabh.yadav@avenues.co
**Phone:** +971 4 553 1029 (Extn – 311)

**Request:**
- Node.js integration kit for UAE
- Sample encryption/decryption code
- Verify merchant credentials are correct
- Ask about encryption method requirements

### Step 3: Check CC Avenue Documentation
- Look for "MARS Manual-CCAvenue Mashreq.pdf" (mentioned in original email)
- Check encryption requirements
- Verify integration steps

---

## 🧪 Test Current Implementation

Test if encryption is working:

```bash
cd /Users/asan/WWC_web/backend
node -e "
const { createPaymentRequest } = require('./services/CCAvenueService.js');
require('dotenv').config();

const result = createPaymentRequest({
  orderId: 'TEST-123',
  amount: 1000,
  currency: 'AED',
  billingName: 'Test',
  billingEmail: 'test@test.com',
  billingTel: '+971501234567',
  billingAddress: 'Test',
  billingCity: 'Dubai',
  billingCountry: 'AE'
});

console.log('Success:', result.success);
console.log('Has encrypted data:', !!result.encryptedData);
console.log('Merchant ID:', result.merchantId);
"
```

---

## 📋 Alternative: Try Different Encryption

If CC Avenue requires different encryption, try this alternative implementation:

```javascript
// Alternative encryption (if current doesn't work)
function encryptAlternative(plainText, key) {
  const crypto = require('crypto');
  const keyBuffer = Buffer.from(key, 'hex'); // If key is hex
  const plainBuffer = Buffer.from(plainText, 'utf8');
  
  // Try with zero IV
  const iv = Buffer.alloc(16, 0);
  const cipher = crypto.createCipheriv('aes-128-cbc', keyBuffer.slice(0, 16), iv);
  cipher.setAutoPadding(true); // Use automatic PKCS7 padding
  
  let encrypted = cipher.update(plainBuffer, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  return encrypted;
}
```

**Note:** Only try this if CC Avenue support confirms it's needed.

---

## 🚨 Most Likely Fix

**The encryption method is probably wrong.** CC Avenue requires their specific implementation.

**Action Required:**
1. Contact CC Avenue support immediately
2. Request Node.js integration kit
3. Replace encryption functions with their provided code
4. Test again

---

## 📞 Support Contacts

**CC Avenue Technical Support:**
- Email: saurabh.yadav@avenues.co
- Phone: +971 4 553 1029 (Extn – 311)
- Website: www.avenues.co

**What to tell them:**
- "Getting 'Merchant Authentication Failed' error"
- "Need Node.js integration kit for UAE region"
- "Merchant ID: 54196"
- "Need correct encryption/decryption functions"

---

## ✅ Verification Checklist

- [ ] Credentials verified in CC Avenue dashboard
- [ ] Credentials match exactly in .env file
- [ ] Contacted CC Avenue support for integration kit
- [ ] Received and implemented CC Avenue's encryption functions
- [ ] Tested payment initiation
- [ ] Verified redirect URLs match registered domain

---

**Priority:** Contact CC Avenue support to get the correct encryption implementation.

