# Production Deployment Notes - wishwavesclub.com

## 🚀 Quick Deployment Checklist

### 1. Backend Environment Variables

Update `/Users/asan/WWC_web/backend/.env`:

```env
# Production URLs
FRONTEND_URL=https://wishwavesclub.com
CCAVENUE_REDIRECT_URL=https://wishwavesclub.com/payment/response
CCAVENUE_CANCEL_URL=https://wishwavesclub.com/join?canceled=true

# CC Avenue Credentials (already configured)
CCAVENUE_MERCHANT_ID=54196
CCAVENUE_ACCESS_CODE=AVBW05ME37BP44WBPB
CCAVENUE_WORKING_KEY=0100316B5AA95BE06F1124CCDD4EA5B6
CCAVENUE_PAYMENT_URL=https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction
```

### 2. Frontend Environment Variables

Create/update frontend `.env` file:

```env
VITE_API_URL=https://api.wishwavesclub.com
# or your backend API URL
```

### 3. Build Frontend

```bash
cd /Users/asan/WWC_web
npm run build
```

### 4. Deploy Backend

- Ensure Node.js server is running
- Use PM2 or similar process manager for production
- Ensure MongoDB connection is configured

### 5. Verify CC Avenue Configuration

- Login to CC Avenue dashboard
- Verify redirect URLs match: `https://wishwavesclub.com/payment/response`
- Test with a small transaction first

---

## ⚠️ Important Notes

### CC Avenue Redirect Method

CC Avenue may redirect using either:
- **GET request** with query parameters: `?encResponse=...`
- **POST request** with form data

**Current Implementation**: Handles GET redirects with query parameters.

**If CC Avenue uses POST redirects**, you may need to:
1. Create a backend endpoint to receive POST from CC Avenue
2. Process the payment response
3. Redirect to frontend success/failure page

**Testing Required**: Test the payment flow to verify which method CC Avenue uses.

### Database Backup

- Ensure regular database backups are configured
- Test backup restoration process

### SSL/HTTPS

- Ensure SSL certificate is installed and valid
- All payment-related pages must use HTTPS
- CC Avenue requires HTTPS for production

### Monitoring

- Set up error logging and monitoring
- Monitor payment success/failure rates
- Set up alerts for payment processing errors

---

## 🔍 Testing Checklist

Before going live:

1. **Registration Flow**
   - [ ] Fill out complete form
   - [ ] Verify validation works
   - [ ] Test with invalid data

2. **Payment Flow**
   - [ ] Initiate payment
   - [ ] Complete payment on CC Avenue
   - [ ] Verify redirect back to website
   - [ ] Check payment response handling

3. **Data Verification**
   - [ ] Verify data saved after successful payment
   - [ ] Verify data NOT saved after failed payment
   - [ ] Check member account creation
   - [ ] Verify email notifications

4. **Error Handling**
   - [ ] Test network errors
   - [ ] Test payment failures
   - [ ] Test invalid responses

---

## 📞 Support Contacts

**CC Avenue Support:**
- Email: saurabh.yadav@avenues.co
- Phone: +971 4 553 1029 (Extn – 311)

**Technical Issues:**
- Check server logs
- Check browser console
- Verify database connectivity
- Verify API endpoints are accessible

---

## ✅ Ready for Launch

Once all items are checked and tested, the registration system is ready for production launch on **wishwavesclub.com**.

