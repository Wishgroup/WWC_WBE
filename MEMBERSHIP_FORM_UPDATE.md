# Membership Form Update - Database Integration

## Changes Made

### Backend Changes

1. **Updated `/api/payment/ccavenue/initiate` endpoint** (`backend/routes/payment.js`):
   - Now saves membership application to `membership_applications` collection BEFORE initiating payment
   - Stores all form data including personal info, contact details, membership selection, professional info, and emergency contact
   - Better error handling with detailed error messages
   - Validates all required fields before processing

2. **Database Collection**:
   - New collection: `membership_applications`
   - Stores complete application data with status tracking
   - Links to payment sessions via `order_id`

3. **CORS Configuration** (`backend/server.js`):
   - Updated to allow specific frontend URL
   - Added proper headers and methods

### Frontend Changes

1. **Error Handling** (`src/components/MembershipForm.jsx`):
   - Improved error messages for network errors
   - Better handling of API response errors
   - Shows specific error messages to users

2. **API Service** (`src/services/api.js`):
   - Better error handling for network failures
   - Handles non-JSON responses gracefully
   - More descriptive error messages

## Data Flow

1. User fills form and clicks "Proceed to Payment Gateway"
2. Frontend sends all form data to `/api/payment/ccavenue/initiate`
3. Backend:
   - Saves membership application to `membership_applications` collection
   - Creates payment session in `payment_sessions` collection
   - Generates encrypted payment request for CC Avenue
   - Returns payment URL and encrypted data
4. Frontend redirects user to CC Avenue payment page
5. User completes payment on CC Avenue
6. CC Avenue redirects back with payment response
7. Backend processes payment and activates membership

## Database Schema

### `membership_applications` Collection

```javascript
{
  order_id: String,           // Unique order ID
  full_name: String,
  date_of_birth: String,
  nationality: String,
  gender: String,
  passport_id: String,
  email: String,
  mobile_number: String,
  address: {
    street: String,
    city: String,
    country: String
  },
  membership_type: String,     // 'Lifetime' or 'Annual'
  referral_code: String,
  referred_by: String,
  renewal_preference: String,
  occupation: String,
  company_name: String,
  industry: String,
  business_email: String,
  emergency_contact: {
    name: String,
    relationship: String,
    mobile: String
  },
  payment_method: String,
  amount: Number,
  currency: String,
  status: String,              // 'pending', 'processing', 'completed', 'failed'
  payment_status: String,      // 'pending', 'paid', 'failed'
  created_at: Date,
  updated_at: Date
}
```

## Testing

1. **Test Form Submission**:
   - Fill all required fields
   - Accept policies
   - Click "Proceed to Payment Gateway"
   - Check browser console for any errors
   - Verify data is saved in `membership_applications` collection

2. **Check Database**:
   ```javascript
   // In MongoDB
   db.membership_applications.find().pretty()
   db.payment_sessions.find().pretty()
   ```

3. **Common Issues**:
   - **"Failed to fetch"**: Check if backend is running on port 3001
   - **CORS errors**: Verify FRONTEND_URL in backend .env matches frontend URL
   - **Database errors**: Ensure MongoDB is running and connection is configured

## Environment Variables

### Backend (.env)
```env
FRONTEND_URL=http://localhost:5173
PORT=3001
MONGODB_URI=your_mongodb_connection_string
```

## Next Steps

After payment is completed:
- Payment response handler updates membership application status
- Creates member account in `members` collection
- Sends welcome email
- Activates membership

