# cPanel Deployment Guide for Wish Waves Club

This guide will walk you through deploying your Wish Waves Club website to a cPanel hosting environment.

## Prerequisites

- cPanel hosting account with access credentials
- FTP/SFTP credentials (or File Manager access)
- Domain name configured and pointing to your hosting
- All files built and ready in the `dist` folder

---

## Step 1: Prepare Your Files

### 1.1 Build Your Project (if not already done)

If you need to rebuild your project:

```bash
# Navigate to project root
cd /Users/asan/WWC_web

# Install dependencies (if needed)
npm install

# Build the project
npm run build
```

This will create/update the `dist` folder with all production-ready files.

### 1.2 Verify Files

Make sure your `dist` folder contains:
- `index.html` - Main React app
- `register.html` - Coming soon page
- `.htaccess` - Apache configuration
- `assets/` folder - All static assets (CSS, JS, images, videos)
- `_redirects` - Netlify redirects (optional, not needed for cPanel)

---

## Step 2: Access cPanel

### 2.1 Login to cPanel

1. Go to your hosting provider's cPanel login URL (usually `https://yourdomain.com/cpanel` or provided by your host)
2. Enter your username and password
3. Click "Log in"

### 2.2 Navigate to File Manager

1. In cPanel, find the **"File Manager"** icon (usually under "Files" section)
2. Click on it to open the File Manager

---

## Step 3: Upload Files

### Option A: Using File Manager (Recommended for beginners)

1. **Navigate to public_html**
   - In File Manager, navigate to `public_html` (this is your website's root directory)
   - If you have a subdomain or addon domain, navigate to that domain's folder instead

2. **Backup existing files (if any)**
   - If you have existing files, create a backup folder:
     - Right-click in File Manager → "Create Folder" → Name it `backup_old`
     - Move existing files to this backup folder

3. **Upload files**
   - Click "Upload" button at the top of File Manager
   - Select all files from your `dist` folder:
     - `index.html`
     - `register.html`
     - `.htaccess`
     - `assets/` folder (upload the entire folder)
   - Wait for upload to complete

4. **Verify .htaccess is uploaded**
   - Make sure `.htaccess` file is visible (you may need to enable "Show Hidden Files" in File Manager settings)

### Option B: Using FTP/SFTP Client (Faster for large files)

1. **Get FTP credentials**
   - In cPanel, go to "FTP Accounts" or "FTP Configuration"
   - Note your FTP host, username, and password

2. **Connect with FTP client**
   - Use FileZilla, Cyberduck, or any FTP client
   - Connect using:
     - **Host:** `ftp.yourdomain.com` or your server IP
     - **Username:** Your FTP username
     - **Password:** Your FTP password
     - **Port:** 21 (FTP) or 22 (SFTP)

3. **Upload files**
   - Navigate to `public_html` on the server
   - Upload all contents from your `dist` folder
   - Make sure to upload `.htaccess` file (it may be hidden, enable "Show hidden files")

---

## Step 4: Configure File Permissions

1. **Set correct permissions**
   - In File Manager, select all files and folders
   - Right-click → "Change Permissions"
   - Set permissions:
     - **Files:** `644`
     - **Folders:** `755`
     - **.htaccess:** `644`

2. **Verify .htaccess is readable**
   - Make sure `.htaccess` has read permissions (644)

---

## Step 5: Test Your Deployment

### 5.1 Test Main Website

1. Open your browser
2. Visit `https://www.wishwavesclub.com`
3. Verify the homepage loads correctly
4. Test navigation and functionality

### 5.2 Test Register Page

1. Visit `https://www.wishwavesclub.com/register`
2. Verify:
   - Video background plays
   - "Coming Soon" message displays
   - Logo appears
   - Page is responsive on mobile

### 5.3 Test QR Code

1. Scan your QR code
2. Verify it redirects to `/register` page
3. Confirm video and content load properly

---

## Step 6: SSL Certificate (HTTPS)

### 6.1 Enable SSL

1. In cPanel, go to **"SSL/TLS"** or **"Let's Encrypt SSL"**
2. Install SSL certificate for your domain
3. Force HTTPS redirect (optional but recommended)

### 6.2 Force HTTPS (Optional)

Add to your `.htaccess` file (if not already present):

```apache
# Force HTTPS
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

---

## Step 7: Domain Configuration

### 7.1 Verify Domain Settings

1. In cPanel, go to **"Domains"** or **"Addon Domains"**
2. Verify your domain is properly configured
3. Check DNS settings if domain isn't resolving

### 7.2 DNS Settings (if needed)

If your domain is registered elsewhere, point DNS to:
- **A Record:** Your server IP address
- **CNAME (www):** `yourdomain.com` or server IP

---

## Troubleshooting

### Issue: 404 Error on /register

**Solution:**
- Verify `.htaccess` file is uploaded and has correct permissions (644)
- Check that `mod_rewrite` is enabled (contact hosting support if needed)
- Verify `register.html` exists in the root directory

### Issue: Video Not Playing

**Solution:**
- Check video file path: `/assets/bg_video-DXQdEV7Y.mp4`
- Verify video file uploaded correctly
- Check file permissions (should be 644)
- Clear browser cache

### Issue: CSS/JS Not Loading

**Solution:**
- Verify `assets/` folder uploaded completely
- Check file paths in browser console (F12)
- Ensure files have correct permissions (644)
- Clear browser cache

### Issue: .htaccess Not Working

**Solution:**
- Verify `.htaccess` file exists in root directory
- Check file permissions (644)
- Ensure `mod_rewrite` is enabled (contact hosting support)
- Check for syntax errors in `.htaccess`

### Issue: White Screen or Errors

**Solution:**
- Check browser console for errors (F12)
- Verify all files uploaded correctly
- Check file permissions
- Review server error logs in cPanel

---

## File Structure After Deployment

Your `public_html` (or domain root) should look like:

```
public_html/
├── .htaccess
├── index.html
├── register.html
├── assets/
│   ├── bg_video-DXQdEV7Y.mp4
│   ├── index-B_-SF6os.css
│   ├── index-DLhxSbFK.js
│   ├── logo-Dbqisz3D.png
│   └── 3d/
│       └── Images/
└── landing_page/
    └── events.png
```

---

## Updating Your Site

### To Update Files:

1. **Rebuild locally:**
   ```bash
   npm run build
   ```

2. **Upload new files:**
   - Use File Manager or FTP to upload updated files
   - Replace existing files in `public_html`
   - Keep `.htaccess` file (don't overwrite unless you've modified it)

3. **Clear cache:**
   - Clear browser cache
   - Consider adding cache-busting to your build process

---

## Additional cPanel Features

### Enable Compression (Optional)

If not already in `.htaccess`, you can enable compression in cPanel:
1. Go to **"Optimize Website"**
2. Enable compression for your domain

### Error Logs

To view errors:
1. In cPanel, go to **"Errors"** or **"Error Log"**
2. Review recent errors for troubleshooting

### Backup

Before making changes:
1. In cPanel, go to **"Backup"**
2. Create a full backup or download files
3. Keep backups before major updates

---

## Support Contacts

- **Hosting Support:** Contact your hosting provider for cPanel-specific issues
- **Domain Registrar:** Contact for DNS issues
- **Technical Issues:** Check error logs in cPanel

---

## Quick Checklist

- [ ] Files built and ready in `dist` folder
- [ ] All files uploaded to `public_html`
- [ ] `.htaccess` file uploaded and has correct permissions (644)
- [ ] File permissions set correctly (644 for files, 755 for folders)
- [ ] SSL certificate installed
- [ ] Main website (`/`) loads correctly
- [ ] Register page (`/register`) loads correctly
- [ ] Video plays on register page
- [ ] QR code redirects correctly
- [ ] Mobile responsive design works
- [ ] All assets (CSS, JS, images) load correctly

---

## Notes

- Keep your `.htaccess` file safe - it contains important routing rules
- Always backup before making changes
- Test thoroughly after deployment
- Monitor error logs for any issues
- Update files by rebuilding and re-uploading

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Domain:** https://www.wishwavesclub.com

