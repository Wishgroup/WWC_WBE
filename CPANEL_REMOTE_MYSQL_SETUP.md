# cPanel Remote MySQL Setup Guide

## Problem
You're trying to connect from your local machine to a remote cPanel MySQL database, but getting "Access denied" errors.

## Solution: Enable Remote MySQL Access in cPanel

### Step 1: Enable Remote MySQL in cPanel

1. **Login to cPanel**
   - Go to your cPanel login page
   - Login with your credentials

2. **Find "Remote MySQL"**
   - In cPanel, search for "Remote MySQL" in the search bar
   - Or navigate to: **Databases** → **Remote MySQL**

3. **Add Your IP Address**
   - Your current IP address: **86.98.62.239**
   - Enter this IP in the "Access Hosts" field
   - Click **Add**
   - **Note**: If your IP changes, you'll need to add the new IP

4. **Alternative: Allow All IPs (Less Secure)**
   - Enter `%` to allow connections from any IP
   - ⚠️ **Warning**: This is less secure but useful for development

### Step 2: Find Your Database Hostname

The database hostname might not be `localhost` for remote connections. Check in cPanel:

1. Go to **MySQL Databases**
2. Look for connection details or hostname
3. Common hostnames:
   - `localhost` (if connecting from same server)
   - `mysql.yourdomain.com` (remote hostname)
   - `your-server-ip` (server IP address)
   - Check cPanel documentation or contact your host

### Step 3: Update .env File

If your database hostname is different from `localhost`, update `backend/.env`:

```env
DB_HOST=your-actual-hostname  # Replace with actual hostname from cPanel
DB_PORT=3306
DB_NAME=wishhosp_wwcdb_mem
DB_USER=wishhosp_sj400h
DB_PASSWORD=Pooba@5963
```

### Step 4: Test Connection

After enabling Remote MySQL and updating the hostname:

```bash
cd backend
npm run migrate
```

## Alternative: Deploy Backend to cPanel Server

If remote MySQL access is not available or you prefer a more secure setup:

1. **Deploy backend to cPanel server**
   - Upload backend files to cPanel
   - Use cPanel Node.js App feature
   - Set `DB_HOST=localhost` (since backend runs on same server)

2. **Run migration on server**
   - Via SSH or cPanel Terminal
   - Or via Node.js App terminal

## Current Configuration

Your current `.env` settings:
- **Database**: `wishhosp_wwcdb_mem`
- **User**: `wishhosp_sj400h`
- **Host**: `localhost` (may need to change for remote)
- **Port**: `3306`

## Next Steps

1. ✅ Enable Remote MySQL in cPanel
2. ✅ Add your IP: `86.98.62.239`
3. ✅ Check actual database hostname in cPanel
4. ✅ Update `DB_HOST` in `.env` if needed
5. ✅ Run `npm run migrate` to create tables
6. ✅ Start backend: `npm run dev`
7. ✅ Start frontend: `npm run dev`

## Troubleshooting

### Still Getting "Access Denied"?

1. **Verify credentials**:
   - Double-check username and password in cPanel
   - Ensure user has ALL PRIVILEGES on the database

2. **Check hostname**:
   - Try the actual server IP or hostname
   - Contact your hosting provider for the correct MySQL hostname

3. **Check firewall**:
   - Ensure port 3306 is not blocked
   - Some hosts block MySQL port for security

4. **Try SSL connection**:
   - Some hosts require SSL for remote connections
   - Enable in `.env`:
     ```env
     DB_SSL=true
     DB_SSL_REJECT_UNAUTHORIZED=false
     ```

### Connection Works But Migration Fails?

- Ensure user has CREATE TABLE privileges
- Check if tables already exist (migration will skip existing tables)
