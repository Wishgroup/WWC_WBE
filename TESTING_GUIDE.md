# Testing Guide - Registration & Payment Flow

## 🧪 Quick Test Checklist

### 1. Server Status
- ✅ Backend: Running on port 3001
- ⚠️ Frontend: Starting on port 5173

### 2. Test Registration Flow

**Step 1: Access Registration Page**
```
http://localhost:5173/join
```

**Step 2: Fill Out Form**
- Personal Information (all required fields)
- Contact Details
- Membership Selection (Lifetime or Annual)
- Professional Information (optional)
- Emergency Contact

**Step 3: Validate Form**
- All required fields must be filled
- Email format must be valid
- Policies section appears after basic info is valid
- Accept all policies and agreements

**Step 4: Test Payment Initiation**
- Click "Proceed to Payment Gateway"
- Should redirect to CC Avenue payment page
- Check browser console for any errors

### 3. Test Payment Response

**Success Scenario:**
- Complete payment on CC Avenue
- Should redirect back to: `http://localhost:5173/payment/response?encResponse=...`
- Should show success message
- Data should be saved to database

**Failure Scenario:**
- Cancel or fail payment
- Should redirect back with error
- Data should NOT be saved to database

### 4. API Endpoint Tests

**Health Check:**
```bash
curl http://localhost:3001/health
```

**Payment Initiation (Test):**
```bash
curl -X POST http://localhost:3001/api/payment/ccavenue/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "membershipType": "annual",
    "amount": 1000,
    "billingDetails": {
      "name": "Test User",
      "email": "test@example.com",
      "phone": "+971501234567",
      "address": "Test Street",
      "city": "Dubai",
      "country": "AE"
    },
    "formData": {
      "fullName": "Test User",
      "email": "test@example.com",
      "mobileNumber": "+971501234567"
    }
  }'
```

### 5. Database Verification

**Check Payment Sessions:**
```javascript
// In MongoDB
db.payment_sessions.find().sort({created_at: -1}).limit(1)
```

**Check Membership Applications (after successful payment):**
```javascript
db.membership_applications.find().sort({created_at: -1}).limit(1)
```

**Check Members (after successful payment):**
```javascript
db.members.find().sort({created_at: -1}).limit(1)
```

### 6. Common Issues & Solutions

**Issue: "Failed to fetch" error**
- Solution: Check if backend is running on port 3001
- Check CORS configuration in backend

**Issue: Payment redirect not working**
- Solution: Verify CC Avenue redirect URLs in .env
- Check browser console for errors

**Issue: Data not saving after payment**
- Solution: Check payment response handler logs
- Verify orderStatus === 'Success' in payment response

**Issue: CC Avenue encryption errors**
- Solution: Verify Working Key is correct
- Check encryption/decryption functions

### 7. Test Credentials

**CC Avenue Test Cards (if using test environment):**
- Check CC Avenue documentation for test card numbers
- Use test payment URL: `https://test.ccavenue.com/...`

**Current Configuration:**
- Using production CC Avenue gateway
- Merchant ID: 54196
- Test with small amount first

### 8. Browser Console Checks

Open browser DevTools (F12) and check:
- Network tab: Verify API calls are successful
- Console tab: Check for JavaScript errors
- Application tab: Check localStorage for tokens

### 9. Backend Logs

Check backend server logs for:
- Payment initiation requests
- Payment response processing
- Database operations
- Error messages

### 10. Email Notifications

After successful payment:
- Check if welcome email is sent
- Verify email service configuration
- Check spam folder if email not received

---

## ✅ Test Results Template

```
Date: ___________
Tester: ___________

[ ] Registration form loads correctly
[ ] Form validation works
[ ] Payment initiation successful
[ ] Redirect to CC Avenue works
[ ] Payment completion works
[ ] Redirect back to website works
[ ] Success page displays correctly
[ ] Data saved to database (after success)
[ ] Data NOT saved (after failure)
[ ] Email notification sent
[ ] Member dashboard accessible
```

---

## 🚀 Ready to Test

1. Open: http://localhost:5173/join
2. Fill out the registration form
3. Click "Proceed to Payment Gateway"
4. Complete payment on CC Avenue
5. Verify data is saved after successful payment

**Note**: For production testing, use the actual domain: https://wishwavesclub.com/join

