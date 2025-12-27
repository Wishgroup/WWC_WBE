# CC Avenue Required Credentials

## 🔐 Dashboard Login Credentials

**These are used to access the CC Avenue merchant dashboard:**

- **Login URL:** https://login.ccavenue.ae/jsp/merchant/merchantLogin.jsp
- **Username:** `AHM_54196`
- **Password:** `Wish@2027Primf`

---

## 🔑 API Credentials (Required for Integration)

**These must be obtained from the CC Avenue dashboard and added to `.env` file:**

### 1. Merchant ID
- **Location:** Settings → API keys → Merchant ID (or Merchant Code)
- **Environment Variable:** `CCAVENUE_MERCHANT_ID`
- **Current Status:** ⚠️ **REQUIRED** - Replace `your_merchant_id_here` in `.env`

### 2. Access Code
- **Location:** Settings → API keys → Access Code
- **Environment Variable:** `CCAVENUE_ACCESS_CODE`
- **Current Status:** ⚠️ **REQUIRED** - Replace `your_access_code_here` in `.env`

### 3. Working Key (Encryption Key)
- **Location:** Settings → API keys → Working Key (or Encryption Key)
- **Environment Variable:** `CCAVENUE_WORKING_KEY`
- **Current Status:** ⚠️ **REQUIRED** - Replace `your_working_key_here` in `.env`
- **Important:** This key is used for encryption/decryption - keep it secret!

---

## 📋 Complete .env Configuration

Your `.env` file should have these values (currently using placeholders):

```env
# CC Avenue Configuration
CCAVENUE_MERCHANT_ID=your_merchant_id_here          # ⚠️ REPLACE THIS
CCAVENUE_ACCESS_CODE=your_access_code_here          # ⚠️ REPLACE THIS
CCAVENUE_WORKING_KEY=your_working_key_here          # ⚠️ REPLACE THIS

# Payment URLs (already configured)
CCAVENUE_PAYMENT_URL=https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction
CCAVENUE_REDIRECT_URL=http://localhost:5173/payment/response
CCAVENUE_CANCEL_URL=http://localhost:5173/join?canceled=true

# Frontend URL (already configured)
FRONTEND_URL=http://localhost:5173
```

---

## 📍 How to Get API Credentials

### Step-by-Step:

1. **Login to Dashboard:**
   - Go to: https://login.ccavenue.ae/jsp/merchant/merchantLogin.jsp
   - Use username: `AHM_54196` and password: `Wish@2027Primf`

2. **Navigate to API Keys:**
   - Click on **Settings** (top menu)
   - Select **API keys** tab

3. **Copy the Values:**
   - Copy **Merchant ID**
   - Copy **Access Code**
   - Copy **Working Key** (or Encryption Key)

4. **Update .env File:**
   - Open `/Users/asan/WWC_web/backend/.env`
   - Replace the three placeholder values with your actual credentials

---

## ✅ Verification Checklist

- [ ] Logged into CC Avenue dashboard successfully
- [ ] Found Settings → API keys section
- [ ] Copied Merchant ID
- [ ] Copied Access Code
- [ ] Copied Working Key
- [ ] Updated `.env` file with all three values
- [ ] Restarted backend server after updating `.env`
- [ ] Tested payment initiation endpoint

---

## 🚨 Important Notes

### Security:
- **Never commit** `.env` file to git
- **Never share** Working Key publicly
- Working Key is used for encryption - treat it as highly sensitive

### Test vs Production:
- **Test Environment:** Use test credentials from CC Avenue dashboard
- **Production Environment:** Use live credentials from CC Avenue dashboard
- Test URL: `https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction`
- Live URL: `https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction`

### If Credentials Are Missing:
- Contact CC Avenue support: saurabh.yadav@avenues.co
- Phone: +971 4 553 1029 (Extn – 311)
- You may need to request API access if it's not enabled

---

## 🔄 After Updating Credentials

1. **Restart Backend Server:**
   ```bash
   cd /Users/asan/WWC_web/backend
   pkill -f "node.*server.js"
   node server.js
   ```

2. **Test Payment Flow:**
   - Go to: http://localhost:5173/join
   - Fill out the membership form
   - Click "Proceed to Payment Gateway"
   - Should redirect to CC Avenue payment page

---

## 📞 Support Contacts

**CC Avenue Technical Support:**
- Email: saurabh.yadav@avenues.co
- Phone: +971 4 553 1029 (Extn – 311)
- Website: www.avenues.co

