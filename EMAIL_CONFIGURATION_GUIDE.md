# Email Configuration Guide - Wish Waves Club

This guide explains how to configure email functionality for the Wish Waves Club application.

## 📧 Email Configuration

### SMTP Settings

The application uses **mail.wishwavesclub.com** for sending emails. Configure the following environment variables in your `backend/.env` file:

```env
# SMTP Configuration
SMTP_HOST=mail.wishwavesclub.com
SMTP_PORT=465
SMTP_USER=info@wishwavesclub.com
SMTP_PASS=your_email_password_here

# Email Addresses
EMAIL_FROM=info@wishwavesclub.com
INQUIRY_EMAIL=info@wishwavesclub.com
```

### Email Server Details (from cPanel)

Based on your cPanel configuration:

- **Incoming Server (IMAP):** `mail.wishwavesclub.com` (Port: 993)
- **Incoming Server (POP3):** `mail.wishwavesclub.com` (Port: 995)
- **Outgoing Server (SMTP):** `mail.wishwavesclub.com` (Port: 465)
- **Username:** `info@wishwavesclub.com`
- **Password:** Use the email account's password
- **Security:** SSL/TLS (recommended)

## 📬 Email Features

### 1. Stay Connected Newsletter Subscription

**When:** User submits email in the "Stay Connected" form in the footer

**What happens:**
- Email is saved to `newsletter_subscriptions` table
- Thank you email is sent immediately: "Thank you for subscribing to Wish Waves Club"
- User receives confirmation email

**API Endpoint:** `POST /api/contact/subscribe`

### 2. Registration Welcome Email

**When:** User completes registration and payment successfully

**What happens:**
- Welcome email is sent with membership details
- Includes membership type (Annual/Lifetime)
- Provides link to member dashboard

**Email Template:** `sendWelcomeEmail()` in `EmailService.js`

### 3. Login Notification Email

**When:** User successfully logs into their account

**What happens:**
- Login notification email is sent
- Includes login time and IP address
- Security notification for account access

**Note:** Only sent for member accounts, not admins/vendors

**Email Template:** `sendLoginNotification()` in `EmailService.js`

### 4. Contact Inquiry Submission

**When:** User submits a contact form or inquiry

**What happens:**
- Inquiry is saved to `contact_inquiries` table
- Email is sent to `info@wishwavesclub.com`
- Includes inquiry details and reply-to address

**API Endpoint:** `POST /api/contact/inquiry`

## 🗄️ Database Tables

### newsletter_subscriptions

Stores newsletter subscription data:

```sql
- id (INT, PRIMARY KEY)
- email (VARCHAR(255), UNIQUE)
- subscribed_at (TIMESTAMP)
- status (ENUM: 'active', 'unsubscribed', 'bounced')
- unsubscribed_at (TIMESTAMP, NULL)
- created_at, updated_at
```

### contact_inquiries

Stores contact form submissions:

```sql
- id (INT, PRIMARY KEY)
- name (VARCHAR(255))
- email (VARCHAR(255))
- phone (VARCHAR(50), NULL)
- subject (VARCHAR(255))
- message (TEXT)
- inquiry_type (VARCHAR(50))
- status (ENUM: 'new', 'in_progress', 'resolved', 'closed')
- assigned_to (INT, NULL)
- resolved_at (TIMESTAMP, NULL)
- created_at, updated_at
```

## 🚀 Setup Instructions

### Step 1: Configure Environment Variables

**Option 1: Copy from example file**
```bash
cd backend
cp .env.example .env
```

**Option 2: Create manually**

Edit `backend/.env` and add:

```env
# SMTP Configuration
SMTP_HOST=mail.wishwavesclub.com
SMTP_PORT=465
SMTP_USER=info@wishwavesclub.com
SMTP_PASS=Wishwavesclub@2025

# Email Addresses
EMAIL_FROM=info@wishwavesclub.com
INQUIRY_EMAIL=info@wishwavesclub.com

# Frontend URL (for email links)
FRONTEND_URL=https://www.wishwavesclub.com
```

**✅ Email Credentials Configured:**
- **Email:** `info@wishwavesclub.com`
- **Password:** `Wishwavesclub@2025`
- **SMTP Host:** `mail.wishwavesclub.com`
- **Port:** `465` (SSL/TLS)

### Step 2: Run Database Migration

```bash
cd backend
npm run migrate
```

Or manually run the migration:

```bash
mysql -u your_username -p your_database < database/migrations/007_email_subscriptions_and_inquiries.sql
```

### Step 3: Test Email Configuration

Test the email service:

```bash
cd backend
node -e "
import('./services/EmailService.js').then(async (module) => {
  try {
    const result = await module.sendSubscriptionThankYou('test@example.com');
    console.log('✅ Email sent successfully:', result);
  } catch (error) {
    console.error('❌ Email failed:', error);
  }
  process.exit(0);
});
"
```

### Step 4: Test in Application

1. **Test Newsletter Subscription:**
   - Go to homepage footer
   - Enter email in "Stay Connected" form
   - Submit and check for thank you email

2. **Test Registration Email:**
   - Complete registration and payment
   - Check for welcome email

3. **Test Login Email:**
   - Log in to member account
   - Check for login notification email

4. **Test Contact Form:**
   - Submit contact inquiry
   - Check `info@wishwavesclub.com` inbox

## 🔧 Troubleshooting

### Email Not Sending

**Check:**
1. SMTP credentials are correct in `.env`
2. Email password is correct
3. Port 465 is not blocked by firewall
4. SSL/TLS is enabled (port 465 requires SSL)

**Test SMTP Connection:**
```bash
# Test with telnet (if available)
telnet mail.wishwavesclub.com 465
```

### Common Issues

**Issue: "Authentication failed"**
- Solution: Verify `SMTP_USER` and `SMTP_PASS` are correct
- Check if email account requires app-specific password

**Issue: "Connection timeout"**
- Solution: Check firewall settings
- Verify port 465 is open
- Try port 587 with TLS instead

**Issue: "Self-signed certificate"**
- Solution: The code already handles this with `rejectUnauthorized: false`
- For production, use a valid SSL certificate

### Email Templates

All email templates are in `backend/services/EmailService.js`:

- `sendWelcomeEmail()` - Registration welcome
- `sendSubscriptionThankYou()` - Newsletter subscription
- `sendLoginNotification()` - Login notification
- `sendInquiryEmail()` - Contact inquiry to admin

You can customize these templates as needed.

## 📝 Email Content

### Subscription Thank You Email

**Subject:** "Thank You for Subscribing to Wish Waves Club"

**Content:**
- Thank you message
- Information about exclusive updates
- Link to website

### Welcome Email

**Subject:** "Welcome to Wish Waves Club - Welcome to the Oceanic Lifestyle"

**Content:**
- Personalized welcome message
- Membership details (type, status)
- Link to member dashboard
- Contact information

### Login Notification Email

**Subject:** "Login Notification - Wish Waves Club"

**Content:**
- Login confirmation
- Login time and IP address
- Security notice if unauthorized
- Link to account

### Inquiry Email (to Admin)

**Subject:** "New Inquiry: [Subject]"

**Content:**
- Inquiry details (name, email, phone, message)
- Reply-to address set to user's email
- Inquiry type and status

## ✅ Verification Checklist

- [ ] SMTP credentials configured in `.env`
- [ ] Database migration run successfully
- [ ] Newsletter subscription form working
- [ ] Thank you email received after subscription
- [ ] Welcome email received after registration
- [ ] Login notification email received
- [ ] Contact inquiry emails received at info@wishwavesclub.com
- [ ] All emails have proper formatting
- [ ] Email links work correctly

## 🔒 Security Notes

1. **Never commit `.env` file** - Keep credentials secure
2. **Use strong email password** - Protect the info@wishwavesclub.com account
3. **Monitor email logs** - Check for failed email attempts
4. **Rate limiting** - Already implemented via `apiLimiter` middleware
5. **Email validation** - All emails are validated before sending

## 📞 Support

If you encounter issues:

1. Check backend logs for email errors
2. Verify SMTP settings in cPanel
3. Test email account login directly
4. Check firewall/network settings
5. Review email service logs

---

**Last Updated:** January 2025
**Email Service:** Nodemailer with SMTP
**Email Provider:** mail.wishwavesclub.com (cPanel)

