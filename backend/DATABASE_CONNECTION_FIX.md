# MySQL Connection Error Fix

## ❌ Error: `ECONNREFUSED` on port 3306

The backend is trying to connect to MySQL on `localhost:3306`, but the connection is being refused.

## 🔍 Possible Causes

1. **MySQL is not running locally** (most likely for cPanel hosting)
2. **Database is on remote server** (cPanel hosting)
3. **Wrong database credentials** in `.env` file
4. **MySQL service not started** (if using local MySQL)

## ✅ Solution for cPanel Hosting

Since you're using **tashjeel.ae** cPanel hosting, your MySQL database is **remote**, not local.

### Step 1: Get Database Credentials from cPanel

1. Log into cPanel: `https://najma.tasjeel.ae:2083`
2. Go to **MySQL Databases** section
3. Find your database name and user
4. Note the following:
   - **Database Name:** Usually `username_dbname`
   - **Database User:** Usually `username_dbuser`
   - **Database Password:** (the one you set)
   - **Database Host:** Usually `localhost` (even for remote, cPanel uses localhost)

### Step 2: Update `.env` File

Edit `backend/.env` and set the correct database credentials:

```env
# Database Configuration (cPanel)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_cpanel_username_wwc_db
DB_USER=your_cpanel_username_dbuser
DB_PASSWORD=your_database_password
```

**Important:** Even though the database is on a remote server, cPanel uses `localhost` as the host when connecting from within the server.

### Step 3: Alternative - Use Remote Host

If you need to connect from your local machine to the remote database:

1. **Get Remote Host:** Check cPanel → MySQL Databases → Remote MySQL
2. **Add Your IP:** Add your local IP address to allowed hosts
3. **Update `.env`:**
   ```env
   DB_HOST=your_remote_host_from_cpanel
   DB_PORT=3306
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   ```

## 🔧 Quick Fix Options

### Option 1: Use Local MySQL (For Development)

If you want to use a local MySQL database for development:

1. **Install MySQL locally:**
   ```bash
   # Windows (using Chocolatey)
   choco install mysql
   
   # Or download from: https://dev.mysql.com/downloads/mysql/
   ```

2. **Start MySQL service:**
   ```bash
   # Windows Services
   # Search for "Services" → Find "MySQL" → Start
   ```

3. **Create database:**
   ```sql
   CREATE DATABASE wwc_db;
   CREATE USER 'wwc_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON wwc_db.* TO 'wwc_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. **Update `.env`:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=wwc_db
   DB_USER=wwc_user
   DB_PASSWORD=your_password
   ```

### Option 2: Use Remote cPanel Database

1. **Get credentials from cPanel**
2. **Update `.env` with cPanel database credentials**
3. **Ensure your IP is allowed** in cPanel → Remote MySQL (if connecting from local machine)

### Option 3: Skip Database for Now (Email Testing Only)

If you only want to test email functionality without database:

1. **Comment out database initialization** temporarily
2. **Test email endpoints** that don't require database
3. **Fix database connection later**

## 🧪 Test Database Connection

After updating `.env`, test the connection:

```bash
cd backend
npm run test-setup
```

This will verify:
- ✅ Database connection
- ✅ All tables exist
- ✅ Environment variables

## 📝 Example `.env` Configuration

```env
# Server
PORT=3001
NODE_ENV=development

# Database (cPanel - Update with your actual values)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_cpanel_username_wwc_db
DB_USER=your_cpanel_username_dbuser
DB_PASSWORD=your_actual_database_password

# Email (Already configured)
SMTP_HOST=mail.wishwavesclub.com
SMTP_PORT=465
SMTP_USER=info@wishwavesclub.com
SMTP_PASS=Wishwavesclub@2025
EMAIL_FROM=info@wishwavesclub.com
INQUIRY_EMAIL=info@wishwavesclub.com

# Security (Generate secure values for production)
JWT_SECRET=dev_jwt_secret_key_change_in_production_min_32_chars
NFC_ENCRYPTION_KEY=dev_nfc_encryption_key_32_bytes_minimum_length_here
ADMIN_API_KEY=dev_admin_api_key_change_in_production

# Frontend
FRONTEND_URL=http://localhost:5173
```

## 🔍 Verify Database Connection

### Check if MySQL is Running (Local)

**Windows:**
```powershell
# Check MySQL service
Get-Service -Name MySQL*

# Or check in Services app
# Win+R → services.msc → Look for MySQL
```

**Start MySQL Service:**
```powershell
# As Administrator
Start-Service MySQL80
# Or whatever your MySQL service name is
```

### Test Connection Manually

```bash
# Using MySQL client
mysql -h localhost -P 3306 -u your_user -p your_database

# Or using Node.js
cd backend
node -e "
import('./database/mysql-connection.js').then(async (module) => {
  try {
    await module.connectDB();
    console.log('✅ Database connected!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
});
"
```

## 🚨 Common Issues

### Issue: "Access denied for user"

**Solution:** Check username and password in `.env`

### Issue: "Unknown database"

**Solution:** 
1. Verify database name in `.env`
2. Create database in cPanel if it doesn't exist
3. Run migrations: `npm run migrate`

### Issue: "Can't connect to MySQL server"

**Solution:**
1. Check if MySQL service is running (for local)
2. Verify host and port in `.env`
3. Check firewall settings
4. For cPanel: Use `localhost` as host

## ✅ Next Steps

1. **Get database credentials** from cPanel
2. **Update `.env` file** with correct values
3. **Test connection:** `npm run test-setup`
4. **Run migrations:** `npm run migrate` (if database is empty)
5. **Start server:** `npm run dev`

---

**Need Help?** 
- Check cPanel → MySQL Databases for credentials
- Verify database user has proper permissions
- Ensure database exists in cPanel




