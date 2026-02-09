# cPanel Deployment Guide - Wish Waves Club

Complete guide for deploying Wish Waves Club to cPanel hosting (tashjeel.ae).

## Prerequisites

- cPanel account with Node.js support (Node.js 18+)
- MySQL database access
- FTP/SFTP access or cPanel File Manager
- Domain name configured

## Step 1: Build for Production

### Option A: Quick Build (Recommended)

```bash
npm run build:cpanel
```

This will:
1. Build the frontend React application
2. Prepare backend files
3. Create deployment package in `cpanel-build/` directory

### Option B: Complete Build (with dependency installation)

**Windows:**
```bash
build-cpanel-complete.bat
```

**Linux/Mac:**
```bash
chmod +x build-cpanel-complete.sh
./build-cpanel-complete.sh
```

## Step 2: Build Output Structure

After building, you'll have:

```
cpanel-build/
├── public_html/              # Frontend files (upload to public_html)
│   ├── index.html
│   ├── assets/
│   ├── .htaccess
│   └── ...
├── backend/                   # Backend files (set up as Node.js app)
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── routes/
│   ├── services/
│   ├── database/
│   └── ...
├── README.md                  # Quick reference
└── DEPLOYMENT_INSTRUCTIONS.md # Detailed guide
```

## Step 3: Upload Files to cPanel

### Frontend Upload

1. **Via cPanel File Manager:**
   - Log in to cPanel
   - Go to **File Manager**
   - Navigate to `public_html` directory
   - Upload all files from `cpanel-build/public_html/`
   - **Important**: Make sure `.htaccess` is uploaded (enable "Show Hidden Files" in File Manager)

2. **Via FTP/SFTP:**
   - Connect using FTP client (FileZilla, WinSCP, etc.)
   - Navigate to `public_html` directory
   - Upload all files from `cpanel-build/public_html/`
   - Ensure `.htaccess` is uploaded

### Backend Upload

1. **Create backend directory:**
   - In cPanel File Manager, go to your home directory
   - Create a new folder: `backend`

2. **Upload backend files:**
   - Upload all files from `cpanel-build/backend/` to `backend/` directory

## Step 4: Set Up Node.js Application

### Using cPanel Node.js App (Recommended)

1. **Create Node.js Application:**
   - In cPanel, go to **Node.js** or **Setup Node.js App**
   - Click **Create Application**
   - Configure:
     - **Node.js version**: 18.x or higher
     - **Application mode**: Production
     - **Application root**: `/home/username/backend` (replace `username` with your cPanel username)
     - **Application URL**: `/api` (or leave empty if using subdomain)
     - **Application startup file**: `server.js`
   - Click **Create**

2. **Install Dependencies:**
   - In the Node.js app settings, click **Run NPM Install**
   - Wait for installation to complete

3. **Set Environment Variables:**
   - In Node.js app settings, go to **Environment Variables**
   - Add all variables from `backend/.env.example`:
     ```
     NODE_ENV=production
     PORT=3001
     DB_HOST=localhost
     DB_PORT=3306
     DB_NAME=your_database_name
     DB_USER=your_database_user
     DB_PASSWORD=your_database_password
     JWT_SECRET=your_jwt_secret_32_chars_min
     NFC_ENCRYPTION_KEY=your_encryption_key_32_bytes
     NFC_TOKEN_SECRET=your_token_secret
     ADMIN_API_KEY=your_admin_api_key
     FRONTEND_URL=https://yourdomain.com
     CCAVENUE_MERCHANT_ID=your_merchant_id
     CCAVENUE_ACCESS_CODE=your_access_code
     CCAVENUE_WORKING_KEY=your_working_key
     ```

4. **Start Application:**
   - Click **Start App** in Node.js app settings
   - Check logs to ensure it started successfully

## Step 5: Set Up MySQL Database

### Create Database

1. In cPanel, go to **MySQL Databases**
2. Create a new database:
   - Enter database name (e.g., `wwc_db`)
   - Click **Create Database**
   - Note: cPanel prefixes with your username (e.g., `username_wwc_db`)

3. Create MySQL user:
   - Enter username and password
   - Click **Create User**

4. Add user to database:
   - Select user and database
   - Click **Add**
   - Grant **ALL PRIVILEGES**
   - Click **Make Changes**

### Run Database Migration

1. **Via Node.js App Terminal:**
   - In Node.js app settings, click **Terminal**
   - Run:
     ```bash
     cd ~/backend
     npm run migrate
     ```

2. **Via SSH (if available):**
   ```bash
   cd ~/backend
   npm run migrate
   ```

The migration script will:
- Create the database if it doesn't exist (if user has privileges)
- Create all required tables
- Set up indexes

## Step 6: Configure Frontend API URL

The frontend needs to know where the backend API is located.

### Option A: Using Subdomain (Recommended)

1. Create subdomain in cPanel (e.g., `api.yourdomain.com`)
2. Point subdomain to your Node.js app
3. Rebuild frontend with API URL:
   ```bash
   VITE_API_URL=https://api.yourdomain.com npm run build
   ```
4. Upload new build to `public_html`

### Option B: Using /api Path

1. Update `.htaccess` in `public_html`:
   - Uncomment the proxy rules:
   ```apache
   RewriteCond %{REQUEST_URI} ^/api/ [NC]
   RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]
   ```
2. Ensure `mod_proxy` and `mod_proxy_http` are enabled (contact hosting if needed)

### Option C: Update Built Files

1. After building, search and replace in `public_html/assets/*.js`:
   - Find: `http://localhost:3001`
   - Replace: `https://yourdomain.com/api` (or your API URL)

## Step 7: Test Deployment

1. **Frontend Test:**
   - Visit: `https://yourdomain.com`
   - Should load the homepage

2. **Backend Health Check:**
   - Visit: `https://yourdomain.com/api/health`
   - Should return: `{"status":"healthy",...}`

3. **API Test:**
   - Try registering a new user
   - Check backend logs for any errors

## Step 8: SSL Certificate

1. In cPanel, go to **SSL/TLS Status**
2. Install Let's Encrypt certificate (free)
3. Force HTTPS by uncommenting in `.htaccess`:
   ```apache
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

## File Structure on Server

```
/home/username/
├── public_html/              # Frontend files
│   ├── index.html
│   ├── assets/
│   ├── .htaccess
│   └── ...
└── backend/                   # Backend files (Node.js app)
    ├── server.js
    ├── package.json
    ├── .env
    ├── routes/
    ├── services/
    ├── database/
    └── ...
```

## Troubleshooting

### Backend Not Accessible

1. **Check Node.js App Status:**
   - In cPanel Node.js App, verify app is running
   - Check logs for errors
   - Restart app if needed

2. **Check Port Configuration:**
   - Default port is 3001
   - Verify in Node.js app settings
   - Check if port conflicts with other apps

3. **Check .htaccess:**
   - Verify proxy rules are correct (if using /api path)
   - Test: `https://yourdomain.com/api/health`

### Frontend Routing Issues

1. **Check .htaccess:**
   - Ensure mod_rewrite is enabled
   - Verify rewrite rules are correct
   - Check file permissions (644 for files, 755 for directories)

2. **Check File Permissions:**
   - Files: 644
   - Directories: 755
   - `.htaccess`: 644

### Database Connection Errors

1. **Verify Credentials:**
   - Check environment variables in Node.js app
   - Test connection manually via phpMyAdmin

2. **Check Database Exists:**
   - Verify in cPanel MySQL Databases
   - Run migration if tables don't exist

3. **Check User Permissions:**
   - User must have ALL PRIVILEGES on database
   - User must have CREATE DATABASE privilege (for auto-creation)

### CORS Errors

1. **Update CORS Settings:**
   - In Node.js app environment variables, set:
     ```
     FRONTEND_URL=https://yourdomain.com
     ```
   - Restart Node.js app

2. **Check API URL:**
   - Ensure frontend is using correct API URL
   - Check browser console for CORS errors

## Security Checklist

- [ ] Changed all default passwords and secrets
- [ ] Set `NODE_ENV=production`
- [ ] Configured proper CORS settings
- [ ] Set up SSL certificate (HTTPS)
- [ ] Protected `.env` file (not in public_html)
- [ ] Configured firewall rules
- [ ] Disabled directory browsing
- [ ] Set up regular backups
- [ ] Configured rate limiting
- [ ] Generated secure JWT_SECRET (32+ characters)
- [ ] Generated secure NFC_ENCRYPTION_KEY (32 bytes)
- [ ] Generated secure ADMIN_API_KEY

## Maintenance

### Updating the Application

1. Build new version: `npm run build:cpanel`
2. Upload new files to server
3. In Node.js app, run: `npm install` (if dependencies changed)
4. Restart Node.js app

### Database Backups

1. In cPanel, go to **Backup**
2. Download MySQL database backup regularly
3. Or use **phpMyAdmin** to export database

### Logs

- **Backend logs**: Check in cPanel Node.js App → Logs
- **Error logs**: Check in cPanel → Error Log
- **Access logs**: Check in cPanel → Raw Access Logs

## Generating Secure Keys

Use these commands to generate secure keys:

```bash
# JWT Secret (32+ characters)
openssl rand -base64 32

# NFC Encryption Key (32 bytes = 64 hex characters)
openssl rand -hex 32

# Admin API Key
openssl rand -base64 24
```

## Support

For issues specific to:
- **cPanel**: Contact your hosting provider (tashjeel.ae)
- **Application**: Check logs and error messages
- **Database**: Verify credentials and permissions

## Additional Resources

- [cPanel Node.js Documentation](https://docs.cpanel.net/cpanel/software/nodejs-applications/)
- [MySQL Database Setup](https://docs.cpanel.net/cpanel/databases/mysql-databases/)
- See `DEPLOYMENT_INSTRUCTIONS.md` in build folder for more details









