# Admin Bank Transfer Verification Guide

## ✅ Implementation Complete

Bank transfer verification is now available in the **Admin Dashboard** - no need to use phpMyAdmin!

---

## 🎯 How to Verify Bank Transfers

### **Option 1: Admin Dashboard (Recommended)** ✅

1. **Login as Admin:**
   - Go to `/admin/dashboard` or click "Admin" in the header
   - Login with admin credentials

2. **Navigate to Bank Transfers:**
   - Click on **"🏦 Bank Transfers"** tab in the sidebar
   - This is the second tab after "Work Queue"

3. **View Pending Transfers:**
   - By default, you'll see all **Pending** transfers
   - Each transfer shows:
     - Order ID
     - Member name and email
     - Membership type and amount
     - Bank receipt (image or PDF)
     - Submission date

4. **Verify Payment:**
   - Review the bank receipt
   - Click **"✓ Verify & Activate"** button
   - Confirm the action
   - System will:
     - Mark payment as verified
     - Activate membership
     - Send welcome email to member
     - Update all related records

5. **Reject Payment (if needed):**
   - Click **"✗ Reject"** button
   - Enter rejection reason
   - Confirm the action
   - System will mark payment as rejected

6. **Filter Transfers:**
   - Use filter tabs: **Pending**, **Verified**, **Rejected**, **All**
   - View counts for each status

---

### **Option 2: phpMyAdmin (Manual)** ⚠️

If you prefer to use phpMyAdmin, you can manually update the database:

1. **Login to cPanel → phpMyAdmin**

2. **Find the Bank Transfer:**
   ```sql
   SELECT * FROM bank_transfer_receipts 
   WHERE status = 'pending_verification'
   ORDER BY created_at DESC;
   ```

3. **View Receipt:**
   - Check `receipt_path` column
   - Access file at: `http://yourdomain.com/uploads/bank-receipts/[filename]`

4. **Verify Payment (SQL):**
   ```sql
   -- Update bank transfer receipt
   UPDATE bank_transfer_receipts 
   SET status = 'verified', 
       verified_by = [your_admin_id],
       verified_at = NOW()
   WHERE order_id = 'BT-1234567890-ABCDEFGH';
   
   -- Update payment session
   UPDATE payment_sessions 
   SET payment_status = 'verified'
   WHERE order_id = 'BT-1234567890-ABCDEFGH';
   
   -- Update membership application
   UPDATE membership_applications 
   SET status = 'active', 
       payment_status = 'paid'
   WHERE order_id = 'BT-1234567890-ABCDEFGH';
   
   -- Update member account
   UPDATE members 
   SET membership_status = 'active',
       payment_status = 'paid',
       subscription_start_date = NOW(),
       subscription_end_date = CASE 
         WHEN membership_type = 'annual' 
         THEN DATE_ADD(NOW(), INTERVAL 1 YEAR)
         ELSE NULL
       END
   WHERE email = '[member_email]';
   ```

5. **Send Welcome Email (Optional):**
   - You may need to trigger this manually or use the admin dashboard

---

## 📋 Admin Dashboard Features

### **Bank Transfer Verification Page**

**Location:** `/admin/dashboard` → **🏦 Bank Transfers** tab

**Features:**
- ✅ View all bank transfers with filtering
- ✅ See bank receipt images/PDFs inline
- ✅ View member details and payment amount
- ✅ One-click verify and activate membership
- ✅ Reject payments with reason
- ✅ Filter by status (Pending, Verified, Rejected)
- ✅ See verification history

**What You See:**
- Order ID
- Member name and email
- Membership type (Annual/Lifetime)
- Payment amount
- Bank receipt preview
- Submission date
- Status badge (Pending/Verified/Rejected)

**Actions Available:**
- **Verify** - Activates membership and sends welcome email
- **Reject** - Marks payment as rejected with reason

---

## 🔄 Verification Process Flow

### **When Admin Verifies:**

1. **Database Updates:**
   - `bank_transfer_receipts.status` → `verified`
   - `payment_sessions.payment_status` → `verified`
   - `membership_applications.status` → `active`
   - `membership_applications.payment_status` → `paid`
   - `members.membership_status` → `active`
   - `members.payment_status` → `paid`
   - `members.subscription_start_date` → Current date
   - `members.subscription_end_date` → Set if annual

2. **Email Sent:**
   - Welcome email automatically sent to member
   - Includes membership details

3. **Member Can Now:**
   - Login to dashboard
   - Access all member benefits
   - Use NFC card (if issued)

---

## 🚫 Rejection Process

### **When Admin Rejects:**

1. **Database Updates:**
   - `bank_transfer_receipts.status` → `rejected`
   - `bank_transfer_receipts.rejection_reason` → Admin's reason
   - `payment_sessions.payment_status` → `rejected`
   - `membership_applications.status` → `rejected`
   - `membership_applications.payment_status` → `rejected`

2. **Member Status:**
   - Membership remains inactive
   - Member can see rejection reason (if implemented)
   - Member can contact support

---

## 📊 Status Filtering

**Filter Tabs:**
- **Pending** - Awaiting verification
- **Verified** - Successfully verified and activated
- **Rejected** - Rejected by admin
- **All** - Show all transfers

**Counts shown in tabs:**
- Number of transfers in each category

---

## 🔍 Viewing Receipts

### **In Admin Dashboard:**
- **Images (JPG/PNG):** Displayed inline, click to enlarge
- **PDFs:** Show PDF icon with "View PDF" link
- **File Info:** Shows original filename and size

### **Direct Access:**
Receipts are accessible at:
```
http://yourdomain.com/uploads/bank-receipts/[filename]
```

---

## ⚙️ Admin Requirements

**To Access Bank Transfer Verification:**
1. Must be logged in as admin
2. Must have admin role in database
3. Admin API key must be configured

**Admin Authentication:**
- Uses JWT token from login
- Requires `role = 'admin'` in members table
- Protected route with `authenticateAdmin` middleware

---

## 📝 Audit Logging

All verification actions are logged:
- **Action:** `bank_transfer_verified` or `bank_transfer_rejected`
- **Admin ID:** Who performed the action
- **Order ID:** Which payment was verified/rejected
- **Timestamp:** When action occurred
- **IP Address:** Admin's IP address

View logs in: **Admin Dashboard → 📝 Audit Logs**

---

## 🎯 Best Practices

1. **Review Receipt Carefully:**
   - Verify amount matches membership type
   - Check bank account details match
   - Confirm payment date is recent

2. **Verify Promptly:**
   - Process within 24-48 hours
   - Members are waiting for activation

3. **Reject with Clear Reason:**
   - Provide specific reason for rejection
   - Helps member understand issue
   - Useful for support follow-up

4. **Check Member Details:**
   - Verify member information is correct
   - Ensure email is valid
   - Confirm membership type matches payment

---

## 🔧 Troubleshooting

### **Can't See Bank Transfers:**
- Check if database migration ran: `008_bank_transfer_payment.sql`
- Verify `bank_transfer_receipts` table exists
- Check admin authentication

### **Receipt Not Loading:**
- Verify uploads directory exists: `backend/uploads/bank-receipts/`
- Check file permissions (755 for directory, 644 for files)
- Verify static file serving is configured in `server.js`

### **Verify Button Not Working:**
- Check admin API key is set
- Verify admin is authenticated
- Check browser console for errors
- Ensure database connection is working

### **Welcome Email Not Sent:**
- Check email configuration in `.env`
- Verify SMTP credentials
- Check email service logs
- Email failure won't block verification

---

## 📞 Support

**For Issues:**
- Check Admin Dashboard first
- Review audit logs
- Check server logs
- Verify database records

**Quick Checks:**
- ✅ Admin logged in?
- ✅ Database migration complete?
- ✅ Uploads directory exists?
- ✅ File permissions correct?

---

## ✅ Summary

**Recommended Method:** **Admin Dashboard** ✅
- User-friendly interface
- Visual receipt preview
- One-click verification
- Automatic email sending
- Complete audit trail

**Alternative Method:** phpMyAdmin (Manual SQL)
- Direct database access
- More control
- Requires SQL knowledge
- Manual email trigger needed

---

**Status:** ✅ **Ready to Use**  
**Location:** Admin Dashboard → 🏦 Bank Transfers  
**Access:** `/admin/dashboard` (Admin login required)

