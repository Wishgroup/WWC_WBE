# Quick Email Setup - 3 Steps

## ✅ Email Credentials (Already Configured)

- **Email:** `info@wishwavesclub.com`
- **Password:** `Wishwavesclub@2025`
- **SMTP:** `mail.wishwavesclub.com:465`

## 🚀 Setup Steps

### Step 1: Create .env File

```bash
cd backend
cp .env.example .env
```

### Step 2: Verify Email Settings

Open `backend/.env` and ensure these lines are present:

```env
SMTP_HOST=mail.wishwavesclub.com
SMTP_PORT=465
SMTP_USER=info@wishwavesclub.com
SMTP_PASS=Wishwavesclub@2025
EMAIL_FROM=info@wishwavesclub.com
INQUIRY_EMAIL=info@wishwavesclub.com
```

### Step 3: Test Email

```bash
cd backend
npm run dev
```

Then test the newsletter subscription form on the homepage footer.

## ✅ Done!

Email is now configured. All automatic emails will work:
- ✅ Newsletter subscription thank you emails
- ✅ Registration welcome emails
- ✅ Login notification emails
- ✅ Contact inquiry emails to info@wishwavesclub.com

---

**Need help?** See `EMAIL_CONFIGURATION_GUIDE.md` for detailed instructions.


