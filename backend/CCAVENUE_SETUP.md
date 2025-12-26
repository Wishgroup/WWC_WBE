# CC Avenue Payment Gateway Setup

## CC Avenue Login Credentials

**Dashboard Login:**
- URL: https://login.ccavenue.ae/jsp/merchant/merchantLogin.jsp
- Username: `AHM_54196`
- Password: `Wish@2027Primf`

## Getting API Credentials

After logging into the CC Avenue dashboard:

1. Go to **Settings > API keys** tab
2. You will find:
   - **Merchant ID**
   - **Access Code**
   - **Working Key** (also called Encryption Key)

## Environment Variables Required

Add these to your `.env` file in the backend directory:

```env
# CC Avenue Configuration
# Get these from Settings > API keys in CC Avenue dashboard
CCAVENUE_MERCHANT_ID=your_merchant_id_from_dashboard
CCAVENUE_ACCESS_CODE=your_access_code_from_dashboard
CCAVENUE_WORKING_KEY=your_working_key_from_dashboard

# Payment URLs
# For testing, use: https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction
# For production, use: https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction
CCAVENUE_PAYMENT_URL=https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction
CCAVENUE_REDIRECT_URL=http://localhost:5173/payment/response
CCAVENUE_CANCEL_URL=http://localhost:5173/join?canceled=true

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## Important Notes

1. **Encryption Method**: The encryption implementation in `backend/services/CCAvenueService.js` uses AES-128-CBC. CC Avenue may have specific encryption requirements. Please verify with CC Avenue's integration kit and update the `encrypt()` and `decrypt()` functions if needed.

2. **Integration Kit**: CC Avenue provides integration kits for different programming languages. You may need to use their provided encryption/decryption functions instead of the current implementation.

3. **Test vs Production**:
   - Use test credentials and test URL for development
   - Replace with live credentials and production URL before going live
   - Test thoroughly in the test environment first

4. **Payment Response Handling**: 
   - CC Avenue redirects users back to `CCAVENUE_REDIRECT_URL` with encrypted response
   - The frontend sends this to `/api/payment/ccavenue/response` endpoint
   - The backend decrypts and processes the response
   - **Data is saved to database ONLY after successful payment**

5. **Data Flow**:
   - User fills form and clicks "Proceed to Payment Gateway"
   - Form data is temporarily stored in `payment_sessions` collection (not in `membership_applications`)
   - User is redirected to CC Avenue payment page
   - After successful payment, data is saved to:
     - `membership_applications` collection (complete application data)
     - `members` collection (active member account)
   - If payment fails, data is NOT saved

6. **Membership Prices**: Update membership prices in:
   - `src/components/MembershipForm.jsx` (frontend display)
   - `backend/routes/payment.js` (if needed for validation)

## Testing

1. Use CC Avenue test credentials provided by them
2. Test with test card numbers from CC Avenue documentation
3. Verify payment flow end-to-end
4. Check that membership is activated after successful payment
5. Verify email notifications are sent

## Support

For CC Avenue integration support, contact:
- Email: saurabh.yadav@avenues.co
- Phone: +971 4 553 1029 (Extn – 311)

