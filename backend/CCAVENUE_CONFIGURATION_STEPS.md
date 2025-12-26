# CC Avenue Configuration Steps

## Step 1: Login to CC Avenue Dashboard

1. Go to: **https://login.ccavenue.ae/jsp/merchant/merchantLogin.jsp**
2. Login with:
   

## Step 2: Get API Credentials

After logging in:

1. Navigate to **Settings** (usually in the top menu)
2. Click on **API keys** tab
3. You will see:
   - **Merchant ID** (also called Merchant Code)
   - **Access Code**
   - **Working Key** (also called Encryption Key)

## Step 3: Update .env File

Open `/Users/asan/WWC_web/backend/.env` and replace the placeholder values:

```env
CCAVENUE_MERCHANT_ID=your_actual_merchant_id
CCAVENUE_ACCESS_CODE=your_actual_access_code
CCAVENUE_WORKING_KEY=your_actual_working_key
```

## Step 4: Verify Configuration

After updating the .env file:

1. Restart the backend server:
   ```bash
   cd backend
   pkill -f "node.*server.js"
   node server.js
   ```

2. Test the payment endpoint (should not show errors about missing credentials)

## Important Notes

### Test vs Production

- **Test Environment:**
  - Use test credentials from CC Avenue
  - Payment URL: `https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction`
  
- **Production Environment:**
  - Use live credentials from CC Avenue dashboard
  - Payment URL: `https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction`

### Security

- **Never commit** the `.env` file to version control
- Keep your Working Key secret - it's used for encryption
- Don't share API credentials publicly

### Payment URLs

The redirect URLs are currently set for local development:
- `CCAVENUE_REDIRECT_URL=http://localhost:5173/payment/response`
- `CCAVENUE_CANCEL_URL=http://localhost:5173/join?canceled=true`

For production, update these to your actual domain:
- `CCAVENUE_REDIRECT_URL=https://yourdomain.com/payment/response`
- `CCAVENUE_CANCEL_URL=https://yourdomain.com/join?canceled=true`

## Troubleshooting

### If you can't find API keys:
- Check if you need to request API access from CC Avenue support
- Contact CC Avenue support: saurabh.yadav@avenues.co

### If encryption doesn't work:
- Verify the Working Key is correct
- Check if CC Avenue requires a specific encryption method
- You may need to use CC Avenue's integration kit

### If payment redirect fails:
- Verify redirect URLs are accessible
- Check CORS settings in CC Avenue dashboard
- Ensure redirect URLs match exactly (including http/https)

## Support

For CC Avenue integration support:
- Email: saurabh.yadav@avenues.co
- Phone: +971 4 553 1029 (Extn – 311)

