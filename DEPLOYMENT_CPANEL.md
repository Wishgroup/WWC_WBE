# cPanel Deployment Guide

Complete guide for deploying Wish Waves Club to cPanel hosting (tashjeel.ae).

## Prerequisites

- cPanel account with Node.js support
- MySQL database access
- FTP/SFTP access or cPanel File Manager
- Domain name configured

## Quick Start

### 1. Build for Production

```bash
npm run build:cpanel
```

This will create a `cpanel-build/` directory with:
- `public_html/` - Frontend files ready to upload
- `backend/` - Backend files ready to upload
- `DEPLOYMENT_INSTRUCTIONS.md` - Detailed deployment steps

### 2. Upload Files

#### Frontend (public_html)
1. Connect via FTP/SFTP or use cPanel File Manager
2. Navigate to `public_html` directory
3. Upload all files from `cpanel-build/public_html/`
4. Ensure `.htaccess` is uploaded (may be hidden)

#### Backend
1. Create a `backend` directory in your home directory: `/home/username/backend`
2. Upload all files from `cpanel-build/backend/`
3. Or use cPanel Node.js App feature (recommended)

### 3. Set Up Node.js Application

#### Using cPanel Node.js App (Recommended)

1. In cPanel, go to **Node.js** or **Setup Node.js App**
2. Click **Create Application**
3. Configure:
   - **Node.js version**: 18.x or higher
   - **Application mode**: Production
   - **Application root**: `/home/username/backend`
   - **Application URL**: `/api` (or use a subdomain like `api.yourdomain.com`)
   - **Application startup file**: `server.js`
4. Click **Create**

5. In the application settings:
   - Click **Run NPM Install**
   - Add environment variables (see Environment Variables section)
   - Click **Start App**

#### Using SSH (Alternative)

If you have SSH access:

```bash
cd ~/backend
npm install --production
npm run migrate
pm2 start server.js --name wwc-backend
pm2 save
```

### 4. Configure Database

1. In cPanel, go to **MySQL Databases**
2. Create database (if not exists):
   - Database name: `username_wwc_db` (or your preferred name)
3. Create MySQL user (if not exists)
4. Add user to database with ALL PRIVILEGES
5. Note down: database name, username, password

### 5. Run Database Migration

#### Option A: Via cPanel Node.js App Terminal

1. In Node.js app settings, click **Terminal**
2. Run:
```bash
cd ~/backend
npm run migrate
```

#### Option B: Via SSH

```bash
cd ~/backend
npm run migrate
```

### 6. Configure Environment Variables

In cPanel Node.js App settings, add these environment variables:

```env
NODE_ENV=production
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password

# Security (IMPORTANT: Generate secure values!)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
NFC_ENCRYPTION_KEY=your_nfc_encryption_key_32_bytes_min
NFC_TOKEN_SECRET=your_nfc_token_secret
ADMIN_API_KEY=your_admin_api_key_secure_random

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Payment Gateway (CC Avenue)
CCAVENUE_MERCHANT_ID=your_merchant_id
CCAVENUE_ACCESS_CODE=your_access_code
CCAVENUE_WORKING_KEY=your_working_key
```

**Generate secure keys:**
```bash
# JWT Secret (32+ characters)
openssl rand -base64 32

# NFC Encryption Key (32 bytes)
openssl rand -hex 16

# Admin API Key
openssl rand -base64 24
```

### 7. Configure Frontend API URL

The frontend needs to know where the backend API is located.

#### Option A: Environment Variable (Recommended)

1. In cPanel Node.js App, add:
   ```
   VITE_API_URL=https://yourdomain.com/api
   ```
2. Rebuild frontend with:
   ```bash
   VITE_API_URL=https://yourdomain.com/api npm run build
   ```
3. Upload new build to `public_html`

#### Option B: Update Built Files

After building, search and replace in `public_html/assets/*.js`:
- Find: `http://localhost:3001`
- Replace: `https://yourdomain.com/api`

### 8. Configure .htaccess

The `.htaccess` file should already be in `public_html`. It handles:
- API routing to Node.js backend
- Frontend SPA routing
- Security headers
- Caching

Verify it's uploaded correctly.

### 9. Test Deployment

1. **Frontend**: Visit `https://yourdomain.com`
2. **Backend Health**: Visit `https://yourdomain.com/api/health`
3. **API Test**: Try logging in or registering

### 10. Set Up SSL Certificate

1. In cPanel, go to **SSL/TLS Status**
2. Install Let's Encrypt certificate (free)
3. Force HTTPS redirect in `.htaccess` if needed

## File Structure on Server

```
/home/username/
├── public_html/              # Frontend files
│   ├── index.html
│   ├── assets/
│   ├── .htaccess
│   └── ...
└── backend/                  # Backend files
    ├── server.js
    ├── package.json
    ├── .env
    ├── routes/
    ├── services/
    └── ...
```

## Troubleshooting

### Backend Not Accessible

1. **Check Node.js App Status**
   - In cPanel Node.js App, verify app is running
   - Check logs for errors

2. **Check Port Configuration**
   - Default port is 3001
   - Verify port in Node.js app settings
   - Check if port is open in firewall

3. **Check .htaccess**
   - Verify proxy rules are correct
   - Test: `https://yourdomain.com/api/health`

### Frontend Routing Issues

1. **Check .htaccess**
   - Ensure mod_rewrite is enabled
   - Verify rewrite rules are correct

2. **Check File Permissions**
   - Files: 644
   - Directories: 755
   - `.htaccess`: 644

### Database Connection Errors

1. **Verify Credentials**
   - Check `.env` file or Node.js app environment variables
   - Test connection manually

2. **Check Database Exists**
   - Verify in cPanel MySQL Databases
   - Run migration if tables don't exist

3. **Check User Permissions**
   - User must have ALL PRIVILEGES on database
   - User must have CREATE DATABASE privilege (for auto-creation)

### CORS Errors

1. **Update CORS Settings**
   - In `backend/server.js`, update `FRONTEND_URL`
   - Add your domain to allowed origins

2. **Check Environment Variables**
   - `FRONTEND_URL` should be your production domain

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
- [ ] Set up monitoring/logging

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

## Support

For issues specific to:
- **cPanel**: Contact your hosting provider (tashjeel.ae)
- **Application**: Check logs and error messages
- **Database**: Verify credentials and permissions

## Additional Resources

- [cPanel Node.js Documentation](https://docs.cpanel.net/cpanel/software/nodejs-applications/)
- [MySQL Database Setup](https://docs.cpanel.net/cpanel/databases/mysql-databases/)
- See `DEPLOYMENT_INSTRUCTIONS.md` in build folder for more details
