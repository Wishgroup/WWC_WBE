# 🚀 Final Deployment Checklist - Wish Waves Club

## ✅ YES, YOU CAN DEPLOY NOW!

Everything is configured and ready. Follow this checklist to ensure a smooth deployment.

---

## 📋 Pre-Deployment Verification

### ✅ **1. Code & Features** - COMPLETE
- [x] Frontend React application built
- [x] Backend Node.js API complete
- [x] Bank transfer payment implemented
- [x] Email notifications configured
- [x] Admin dashboard updated
- [x] All components working
- [x] Database migrations ready

### ⚠️ **2. Environment Configuration** - REQUIRED

**Before deploying, ensure these are set in cPanel:**

#### **Database Configuration:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wishhosp_wwcdb_mem
DB_USER=wishhosp_sj400h
DB_PASSWORD=Pooba@5963
```

#### **Email Configuration:**
```env
SMTP_HOST=mail.wishwavesclub.com
SMTP_PORT=465
SMTP_USER=info@wishwavesclub.com
SMTP_PASS=Wishwavesclub@2025
EMAIL_FROM=info@wishwavesclub.com
INQUIRY_EMAIL=info@wishwavesclub.com
```

#### **Security Keys:**
```env
JWT_SECRET=phgfrIG7WpYkOByX52yZPEgC+le+rCxqIm6I8FZwA2U=
NFC_ENCRYPTION_KEY=642aa58507454bb41343f5ba21597e2282c0f28823eac44dbca8876b83520ef7
NFC_TOKEN_SECRET=7QFFP5aDVuFXr9zjjLfbtw==
ADMIN_API_KEY=S9pqJIMfiFPXDuLsiW2RAbFPUWqGGVvb
```

#### **Server Configuration:**
```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://wishwavesclub.com
```

#### **CC Avenue (Temporarily Disabled):**
```env
CCAVENUE_MERCHANT_ID=54196
CCAVENUE_ACCESS_CODE=AVBW05ME37BP44WBPB
CCAVENUE_WORKING_KEY=0100316B5AA95BE06F1124CCDD4EA5B6
CCAVENUE_PAYMENT_URL=https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction
CCAVENUE_REDIRECT_URL=https://wishwavesclub.com/payment/response
CCAVENUE_CANCEL_URL=https://wishwavesclub.com/join?canceled=true
```

---

## 🚀 Deployment Steps

### **Step 1: Build for Production**

```bash
npm run build:cpanel
```

This creates `cpanel-build/` directory with:
- `public_html/` - Frontend files
- `backend/` - Backend files

### **Step 2: Upload Frontend**

1. **Via cPanel File Manager:**
   - Go to **File Manager**
   - Navigate to `public_html/`
   - Upload ALL files from `cpanel-build/public_html/`
   - **IMPORTANT**: Enable "Show Hidden Files" and upload `.htaccess`

2. **Via FTP/SFTP:**
   - Connect to your server
   - Upload `cpanel-build/public_html/*` to `public_html/`

### **Step 3: Set Up Backend (Node.js App)**

1. **In cPanel:**
   - Go to **Node.js** or **Setup Node.js App**
   - Click **Create Application**

2. **Configure Application:**
   - **Node.js Version**: 18.x or higher
   - **Application Mode**: Production
   - **Application Root**: `/home/username/backend` (or create `backend` folder)
   - **Application URL**: `/api` (or subdomain)
   - **Application Startup File**: `server.js`

3. **Upload Backend Files:**
   - Upload ALL files from `cpanel-build/backend/` to the application root
   - Make sure `package.json`, `server.js`, and all folders are uploaded

4. **Install Dependencies:**
   - In Node.js app settings, click **Run NPM Install**
   - Wait for installation to complete

5. **Set Environment Variables:**
   - In Node.js app settings, add ALL environment variables from above
   - Copy from your local `.env` file
   - **CRITICAL**: Set all variables before starting the app

6. **Create Uploads Directory:**
   - Create `uploads/bank-receipts/` directory in backend folder
   - Set permissions: 755 for directory, 644 for files

### **Step 4: Database Setup**

1. **Create Database (if not exists):**
   - In cPanel, go to **MySQL Databases**
   - Database name: `wishhosp_wwcdb_mem` (or your database name)
   - User: `wishhosp_sj400h` (or your database user)
   - Grant all privileges

2. **Run Migrations:**
   - In Node.js app terminal, run:
   ```bash
   npm run migrate
   ```
   - Or manually run: `node scripts/run-migrations.js`
   - This creates all required tables

3. **Verify Tables Created:**
   - Check in phpMyAdmin that these tables exist:
     - `members`
     - `payment_sessions`
     - `membership_applications`
     - `bank_transfer_receipts`
     - `newsletter_subscriptions`
     - `contact_inquiries`
     - And all other tables

### **Step 5: Start Application**

1. **In Node.js App Settings:**
   - Click **Start App**
   - Wait for app to start
   - Check logs for any errors

2. **Verify Backend is Running:**
   - Visit: `https://wishwavesclub.com/api/health`
   - Should return: `{ "status": "ok" }`

### **Step 6: Test Deployment**

#### **Frontend Tests:**
- [ ] Homepage loads: `https://wishwavesclub.com`
- [ ] Navigation works
- [ ] Join page accessible
- [ ] Login page accessible

#### **Backend Tests:**
- [ ] Health check: `https://wishwavesclub.com/api/health`
- [ ] API responds correctly
- [ ] Database connection works

#### **Feature Tests:**
- [ ] Newsletter subscription works
- [ ] Bank transfer form displays
- [ ] Receipt upload works
- [ ] Admin login works
- [ ] Admin dashboard loads

---

## 🔧 Post-Deployment Configuration

### **1. Create Admin User**

You need to create an admin user in the database:

```sql
INSERT INTO members (email, password_hash, full_name, role, membership_status, payment_status, created_at, updated_at)
VALUES (
  'admin@wishwavesclub.com',
  '$2a$10$YourHashedPasswordHere', -- Use bcrypt to hash your password
  'Admin User',
  'admin',
  'active',
  'paid',
  NOW(),
  NOW()
);
```

**To hash password:**
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword', 10).then(hash => console.log(hash));"
```

### **2. Test Email Sending**

After deployment, test email:
```bash
npm run test-email
```

### **3. Verify File Permissions**

```bash
# Uploads directory
chmod 755 backend/uploads
chmod 755 backend/uploads/bank-receipts
```

### **4. SSL Certificate**

- Ensure SSL is enabled in cPanel
- Force HTTPS redirects
- Update `.htaccess` if needed

---

## ⚠️ Common Issues & Solutions

### **Issue 1: Backend Not Starting**
- **Check**: Environment variables are set correctly
- **Check**: Database credentials are correct
- **Check**: Port is available (3001)
- **Check**: Node.js version is 18+

### **Issue 2: Database Connection Error**
- **Check**: Database name, user, password in `.env`
- **Check**: Database user has proper permissions
- **Check**: Database exists in cPanel

### **Issue 3: File Upload Not Working**
- **Check**: `uploads/bank-receipts/` directory exists
- **Check**: Directory permissions (755)
- **Check**: File size limits in Node.js app settings

### **Issue 4: Email Not Sending**
- **Check**: SMTP credentials are correct
- **Check**: Port 465 is open
- **Check**: Email service is active

### **Issue 5: Frontend Can't Connect to Backend**
- **Check**: API URL in frontend is correct
- **Check**: CORS is configured in backend
- **Check**: Backend is running and accessible

---

## 📝 Quick Reference

### **Important URLs:**
- Frontend: `https://wishwavesclub.com`
- Backend API: `https://wishwavesclub.com/api`
- Health Check: `https://wishwavesclub.com/api/health`
- Admin Dashboard: `https://wishwavesclub.com/admin/dashboard`

### **Important Directories:**
- Frontend: `public_html/`
- Backend: `/home/username/backend/`
- Uploads: `/home/username/backend/uploads/bank-receipts/`

### **Important Files:**
- `.htaccess` - Frontend routing
- `.env` - Backend environment variables
- `server.js` - Backend entry point

---

## ✅ Final Checklist Before Going Live

- [ ] All environment variables set in cPanel Node.js app
- [ ] Database created and migrations run
- [ ] Admin user created
- [ ] Uploads directory created with correct permissions
- [ ] Frontend files uploaded to `public_html/`
- [ ] Backend files uploaded and `npm install` run
- [ ] Node.js app started and running
- [ ] Health check endpoint working
- [ ] Email sending tested
- [ ] Bank transfer form tested
- [ ] Admin dashboard accessible
- [ ] SSL certificate active
- [ ] All features tested

---

## 🎉 You're Ready!

Once all items are checked, your application is ready for production!

**Status**: ✅ **READY FOR DEPLOYMENT**

**Next Step**: Run `npm run build:cpanel` and follow the steps above.

---

## 📞 Support

If you encounter issues:
1. Check Node.js app logs in cPanel
2. Check database connection
3. Verify all environment variables
4. Test each feature individually
5. Check file permissions

**Good luck with your deployment!** 🚀



