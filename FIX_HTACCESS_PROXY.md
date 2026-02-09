# Fix: Remove Proxy Rules from .htaccess

## The Problem (From Hosting Support)

> "On cPanel shared hosting, Node apps do not run on a fixed port. Passenger assigns a dynamic internal port and connects Apache to it automatically. Because of this, proxying to 127.0.0.1:3001 sends requests to the wrong port, which causes the 503 errors. These proxy rules must be removed so Apache can let Passenger handle /api directly."

## The Fix

### Step 1: Update .htaccess in public_html

**In cPanel File Manager:**
1. Go to `public_html/`
2. Open `.htaccess` file
3. **REMOVE these lines** (if they exist):
   ```apache
   # Proxy /api/* to Node.js backend
   RewriteCond %{REQUEST_URI} ^/api/ [NC]
   RewriteRule ^api/(.*)$ http://127.0.0.1:3001/api/$1 [P,L]
   ```
   OR
   ```apache
   RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]
   ```

4. **Keep only the SPA routing** (for frontend):
   ```apache
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteCond %{REQUEST_URI} !^/api/
   RewriteRule ^(.*)$ /index.html [L]
   ```

### Step 2: Correct .htaccess Content

Your `.htaccess` in `public_html/` should look like this:

```apache
# Wish Waves Club - cPanel Deployment Configuration
# Passenger handles /api/* automatically - DO NOT proxy

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Handle frontend SPA routing - serve index.html for all non-file requests
  # Note: /api/* is handled by Passenger automatically
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_URI} !^/api/
  RewriteRule ^(.*)$ /index.html [L]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Gzip Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/json "access plus 1 hour"
  ExpiresByType application/pdf "access plus 1 month"
  ExpiresByType text/x-javascript "access plus 1 month"
  ExpiresByType image/x-icon "access plus 1 year"
  ExpiresDefault "access plus 2 days"
</IfModule>

# Prevent directory browsing
Options -Indexes

# Protect sensitive files
<FilesMatch "^\\.(env|log|md|json|git)$">
  Order allow,deny
  Deny from all
</FilesMatch>
```

### Step 3: Verify Node.js App URL

**In cPanel → Node.js App:**
- **Application URL** should be: `wishwavesclub.com/api`
- This tells Passenger to handle `/api/*` routes
- Passenger will automatically route `/api/*` to your Node.js app

### Step 4: Test

1. **Save .htaccess** in cPanel
2. **Clear browser cache** (Ctrl+F5)
3. **Test API:** `https://www.wishwavesclub.com/api/health`
4. **Should work now!**

## Why This Works

- **Passenger** automatically handles routing `/api/*` to your Node.js app
- **No proxy needed** - Passenger connects Apache to the dynamic port
- **Frontend routing** still works (SPA routes go to index.html)
- **API routes** go directly to Passenger → Node.js app

## Important Notes

- ❌ **DO NOT** proxy `/api/*` to port 3001
- ✅ **DO** let Passenger handle `/api/*` automatically
- ✅ **DO** keep SPA routing for frontend (non-API routes)

## After Fix

The 503 error should be gone because:
- Passenger handles `/api/*` automatically
- No wrong port proxy
- Apache connects to Passenger's dynamic port correctly

