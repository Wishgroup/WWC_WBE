# Email Credentials - Wish Waves Club

## ✅ Configured Email Account

**Email Address:** `info@wishwavesclub.com`  
**Password:** `Wishwavesclub@2025`  
**SMTP Server:** `mail.wishwavesclub.com`  
**SMTP Port:** `465` (SSL/TLS)  
**IMAP Port:** `993` (SSL/TLS)  
**POP3 Port:** `995` (SSL/TLS)

## 📧 Email Configuration Status

### Current Settings (from cPanel):
- ✅ Email account exists and is active
- ✅ Storage: 1 GB allocated (currently using 100.9 KB - 0.01%)
- ✅ Receiving Incoming Mail: **Allowed**
- ✅ Sending Outgoing Email: **Allowed**
- ✅ Logging In: **Allowed**
- ✅ Plus Addressing: Enabled (auto-create folders)

## 🔧 Environment Variables

Add these to your `backend/.env` file:

```env
# Email Configuration
SMTP_HOST=mail.wishwavesclub.com
SMTP_PORT=465
SMTP_USER=info@wishwavesclub.com
SMTP_PASS=Wishwavesclub@2025
EMAIL_FROM=info@wishwavesclub.com
INQUIRY_EMAIL=info@wishwavesclub.com
```

## 🚀 Quick Setup

1. **Copy environment template:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Verify email settings are correct** in `.env` file

3. **Test email connection:**
   ```bash
   cd backend
   node -e "
   import('./services/EmailService.js').then(async (module) => {
     try {
       const result = await module.sendSubscriptionThankYou('test@example.com');
       console.log('✅ Email sent successfully!');
     } catch (error) {
       console.error('❌ Email failed:', error.message);
     }
     process.exit(0);
   });
   "
   ```

## 📬 Email Features Enabled

1. **Newsletter Subscription** - "Thank you for subscribing" email
2. **Registration Welcome** - Welcome email after payment
3. **Login Notification** - Security notification on login
4. **Contact Inquiries** - All inquiries sent to info@wishwavesclub.com

## 🔒 Security Notes

- ✅ Password is stored in `.env` file (not committed to git)
- ✅ SMTP uses SSL/TLS encryption (port 465)
- ✅ Email account is secured with strong password
- ⚠️ **Never commit `.env` file to version control**

## 📝 Automated Responses

The email account is configured to:
- ✅ Receive all contact form submissions
- ✅ Send automatic thank you emails for subscriptions
- ✅ Send welcome emails after registration
- ✅ Send login notification emails

## 🔍 Verification

To verify email is working:

1. **Test Newsletter Subscription:**
   - Go to homepage footer
   - Enter email in "Stay Connected" form
   - Check inbox for thank you email

2. **Check Email Logs:**
   - Backend console will show email sending status
   - Look for: `✅ Email sent successfully` or `❌ Error sending email`

3. **Test SMTP Connection:**
   - Check backend logs when server starts
   - Email service should initialize without errors

## 📞 Support

If email is not working:

1. **Verify credentials** in `.env` file
2. **Check cPanel** - ensure email account is active
3. **Test password** - try logging into webmail
4. **Check firewall** - ensure port 465 is not blocked
5. **Review logs** - check backend console for errors

---

**Last Updated:** January 2025  
**Status:** ✅ Configured and Ready



