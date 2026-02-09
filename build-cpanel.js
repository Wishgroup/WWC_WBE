/**
 * cPanel Build Script
 * Prepares the application for deployment to cPanel
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, cpSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BUILD_DIR = join(__dirname, 'cpanel-build');
const FRONTEND_BUILD = join(__dirname, 'dist');
const BACKEND_DIR = join(__dirname, 'backend');

console.log('🚀 Starting cPanel build process...\n');

// Step 1: Clean build directory
console.log('1️⃣  Cleaning build directory...');
if (existsSync(BUILD_DIR)) {
  // Cross-platform cleanup
  if (process.platform === 'win32') {
    execSync(`rmdir /s /q "${BUILD_DIR}"`, { stdio: 'inherit' });
  } else {
    execSync(`rm -rf "${BUILD_DIR}"`, { stdio: 'inherit' });
  }
}
mkdirSync(BUILD_DIR, { recursive: true });
console.log('   ✅ Build directory cleaned\n');

// Step 2: Build frontend
console.log('2️⃣  Building frontend...');
try {
  // Check if .env.production exists, use it for build
  const envFile = existsSync(join(__dirname, '.env.production')) ? '.env.production' : '';
  const buildCmd = envFile ? `npm run build:prod` : 'npm run build';
  execSync(buildCmd, { stdio: 'inherit', cwd: __dirname, env: { ...process.env } });
  console.log('   ✅ Frontend built successfully\n');
} catch (error) {
  console.error('   ❌ Frontend build failed');
  process.exit(1);
}

// Step 3: Copy frontend build
console.log('3️⃣  Copying frontend files...');
if (existsSync(FRONTEND_BUILD)) {
  cpSync(FRONTEND_BUILD, join(BUILD_DIR, 'public_html'), { recursive: true });
  console.log('   ✅ Frontend files copied\n');
} else {
  console.error('   ❌ Frontend build directory not found');
  process.exit(1);
}

// Step 4: Create .htaccess for cPanel
console.log('4️⃣  Creating .htaccess for cPanel...');
const htaccessContent = `# Wish Waves Club - cPanel Deployment Configuration

# Enable Rewrite Engine
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Proxy /api/* to Node.js backend (same server)
  # Change 3001 to the port your cPanel Node.js app uses if different
  RewriteCond %{REQUEST_URI} ^/api/ [NC]
  RewriteRule ^api/(.*)$ http://127.0.0.1:3001/api/$1 [P,L]

  # Handle frontend routing - serve index.html for all non-file requests
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_URI} !^/api/
  RewriteRule ^(.*)$ /index.html [L]
</IfModule>

# Force HTTPS (uncomment after SSL is set up)
# <IfModule mod_rewrite.c>
#   RewriteCond %{HTTPS} off
#   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
# </IfModule>

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

# Custom Error Pages (optional)
# ErrorDocument 404 /index.html
# ErrorDocument 500 /index.html
`;

writeFileSync(join(BUILD_DIR, 'public_html', '.htaccess'), htaccessContent);
console.log('   ✅ .htaccess created for cPanel\n');

// Step 5: Prepare backend
console.log('5️⃣  Preparing backend...');
const backendBuildDir = join(BUILD_DIR, 'backend');
mkdirSync(backendBuildDir, { recursive: true });

// Copy backend files (excluding node_modules, .env, etc.)
const filesToCopy = [
  'server.js',
  'passenger-loader.cjs',
  'package.json',
  'package-lock.json',
  'routes',
  'services',
  'middleware',
  'database',
  'scripts',
];

filesToCopy.forEach(item => {
  const source = join(BACKEND_DIR, item);
  const dest = join(backendBuildDir, item);
  if (existsSync(source)) {
    cpSync(source, dest, { recursive: true });
  }
});

// Copy mysql-schema.sql for reference
if (existsSync(join(BACKEND_DIR, 'database', 'mysql-schema.sql'))) {
  copyFileSync(
    join(BACKEND_DIR, 'database', 'mysql-schema.sql'),
    join(backendBuildDir, 'database', 'mysql-schema.sql')
  );
}

console.log('   ✅ Backend files prepared\n');

// Step 6: Create production .env template
console.log('6️⃣  Creating production .env template...');
const envTemplate = `# Production Environment Variables
# Copy this to backend/.env and fill in your values

# Server
PORT=3001
NODE_ENV=production

# MySQL Database (tashjeel.ae)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password

# Security (IMPORTANT: Change these in production!)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_change_this
NFC_ENCRYPTION_KEY=your_nfc_encryption_key_32_bytes_min
NFC_TOKEN_SECRET=your_nfc_token_secret_change_this
ADMIN_API_KEY=your_admin_api_key_secure_random_change_this

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Fraud Detection
FRAUD_SCORE_LOW=30
FRAUD_SCORE_MEDIUM=60
FRAUD_SCORE_HIGH=90
MAX_DISTANCE_KM_PER_HOUR=1000
MAX_TAPS_PER_HOUR=10
MAX_TAPS_PER_DAY=50

# Frontend URL (your domain)
FRONTEND_URL=https://yourdomain.com

# Payment Gateway (CC Avenue)
CCAVENUE_MERCHANT_ID=your_merchant_id
CCAVENUE_ACCESS_CODE=your_access_code
CCAVENUE_WORKING_KEY=your_working_key

# Email (Optional)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
`;

writeFileSync(join(backendBuildDir, '.env.example'), envTemplate);
console.log('   ✅ .env template created\n');

// Step 7: Create comprehensive deployment instructions
console.log('7️⃣  Creating deployment instructions...');
const deploymentInstructions = `# cPanel Deployment Instructions - Wish Waves Club

## Quick Start

1. **Build the application**: \`npm run build:cpanel\`
2. **Upload files** to cPanel
3. **Set up Node.js app** in cPanel
4. **Configure database** and run migration
5. **Set environment variables**
6. **Test deployment**

## Files Structure
\`\`\`
cpanel-build/
├── public_html/          # Frontend files (upload to public_html)
├── backend/              # Backend files (upload to backend directory)
├── WWC-frontend.zip     # Frontend – upload & extract into public_html
└── WWC-backend.zip      # Backend – upload & extract into Node.js app root
\`\`\`

## Step 1: Upload Frontend Files

**Option A – Using zip (recommended)**  
1. Upload \`WWC-frontend.zip\` to cPanel File Manager.  
2. Navigate to \`public_html\`.  
3. Use “Extract” on the zip so that \`index.html\`, \`assets/\`, \`.htaccess\`, etc. end up directly inside \`public_html\`.

**Option B – Using folders**  
1. Connect via FTP/SFTP or File Manager.  
2. Navigate to \`public_html\`.  
3. Upload all contents of \`cpanel-build/public_html\` into \`public_html\`.  
4. Ensure \`.htaccess\` is uploaded (enable “Show Hidden Files” in File Manager if needed).

## Step 2: Set Up Backend

### Option A: Using cPanel Node.js App (Recommended)

1. In cPanel, go to **Node.js** or **Setup Node.js App**
2. Create a new Node.js application:
   - **Node.js version**: 18.x or higher
   - **Application root**: \`backend\` (or \`/home/username/backend\`)
   - **Application URL**: \`/api\` (optional, or use subdomain)
   - **Application startup file**: \`passenger-loader.cjs\` (required for ESM on Passenger)
3. Upload \`WWC-backend.zip\` to the application root and **Extract** (so \`server.js\`, \`package.json\`, \`routes/\`, etc. are in the root). Or upload the contents of \`cpanel-build/backend\`.
4. In the Node.js app settings, run:
   \`\`\`bash
   npm install
   \`\`\`
5. Set environment variables in the Node.js app settings
6. Start the application

### Option B: Using SSH (If Available)

1. Upload backend files to \`/home/username/backend\`
2. SSH into your server
3. Navigate to backend directory:
   \`\`\`bash
   cd ~/backend
   \`\`\`
4. Install dependencies:
   \`\`\`bash
   npm install --production
   \`\`\`
5. Set up environment variables (create .env file)
6. Run database migration:
   \`\`\`bash
   npm run migrate
   \`\`\`
7. Start the application using PM2 or similar:
   \`\`\`bash
   pm2 start server.js --name wwc-backend
   pm2 save
   \`\`\`

## Step 3: Configure Database

1. In cPanel, go to **MySQL Databases**
2. Create database and user (if not already done)
3. Update \`.env\` file with database credentials
4. Run migration:
   \`\`\`bash
   npm run migrate
   \`\`\`

## Step 4: Configure Environment Variables

1. Copy \`.env.example\` to \`.env\` in backend directory
2. Fill in all required values:
   - Database credentials
   - Security keys (JWT_SECRET, etc.)
   - Frontend URL
   - Payment gateway credentials

## Step 5: Update Frontend API URL

1. Create a \`.env\` file in \`public_html\` (if using Vite) or
2. Update API URL in the built files, or
3. Set environment variable in cPanel Node.js app:
   \`\`\`
   VITE_API_URL=https://yourdomain.com/api
   \`\`\`

## Step 6: Test Deployment

1. Visit your domain: \`https://yourdomain.com\`
2. Test API: \`https://yourdomain.com/api/health\`
3. Check backend logs in cPanel Node.js app

## Troubleshooting

### Backend not accessible
- Check Node.js app is running in cPanel
- Verify port configuration (usually 3001)
- Check firewall settings

### Frontend routing issues
- Ensure \`.htaccess\` is uploaded correctly
- Check mod_rewrite is enabled in cPanel

### Database connection errors
- Verify database credentials in \`.env\`
- Check database user has proper permissions
- Ensure database exists

## Security Checklist

- [ ] Changed all default passwords and secrets
- [ ] Set NODE_ENV=production
- [ ] Configured proper CORS settings
- [ ] Set up SSL certificate
- [ ] Protected .env file from public access
- [ ] Configured firewall rules
\`\`\`
`;

writeFileSync(join(BUILD_DIR, 'DEPLOYMENT_INSTRUCTIONS.md'), deploymentInstructions);
console.log('   ✅ Deployment instructions created\n');

// Step 8: Create package.json for backend installation
console.log('8️⃣  Creating backend installation script...');
const installScript = [
  '#!/bin/bash',
  '# Backend Installation Script for cPanel',
  '',
  'echo "Installing backend dependencies..."',
  'npm install --production',
  '',
  'echo "Setting up environment..."',
  'if [ ! -f .env ]; then',
  '  cp .env.example .env',
  '  echo "Please edit .env file with your configuration"',
  'fi',
  '',
  'echo "Running database migration..."',
  'npm run migrate',
  '',
  'echo "Backend setup complete!"',
  'echo "Don\'t forget to:"',
  'echo "   1. Edit .env file with your credentials"',
  'echo "   2. Start the Node.js application in cPanel"'
].join('\n');

writeFileSync(join(backendBuildDir, 'install.sh'), installScript);
// Make it executable (Unix/Linux) - skip on Windows
if (process.platform !== 'win32') {
  try {
    const chmodCmd = 'chmod +x "' + join(backendBuildDir, 'install.sh') + '"';
    execSync(chmodCmd, { stdio: 'inherit' });
  } catch (e) {
    // Ignore errors
  }
}

console.log('   ✅ Installation script created\n');

// Step 9: Create README for the build
console.log('9️⃣  Creating build README...');
const buildReadme = [
  '# Wish Waves Club - cPanel Build Package',
  '',
  'This package contains everything needed to deploy Wish Waves Club to cPanel hosting (tashjeel.ae).',
  '',
  '## Package Contents',
  '',
  '- **public_html/** - Frontend React application (upload to public_html)',
  '- **backend/** - Node.js backend API (set up as Node.js app in cPanel)',
  '- **DEPLOYMENT_INSTRUCTIONS.md** - Detailed deployment guide',
  '',
  '## Quick Deployment Steps',
  '',
  '### 1. Upload Frontend',
  '- Upload all files from public_html/ to your cPanel public_html/ directory',
  '- Ensure .htaccess is uploaded (may be hidden)',
  '',
  '### 2. Set Up Backend',
  '- In cPanel, go to **Node.js** → **Create Application**',
  '- Upload backend files to the application root',
  '- Run npm install in the Node.js app terminal',
  '- Set environment variables (see .env.example)',
  '- Run npm run migrate to create database tables',
  '- Start the application',
  '',
  '### 3. Configure Database',
  '- Create MySQL database in cPanel',
  '- Update .env with database credentials',
  '- Migration script will create all tables automatically',
  '',
  '### 4. Update API URL',
  '- If using subdomain for API: Update VITE_API_URL in frontend build',
  '- Or rebuild frontend with: VITE_API_URL=https://yourdomain.com/api npm run build',
  '',
  '## Required Environment Variables',
  '',
  'See backend/.env.example for complete list. Key variables:',
  '- DB_HOST, DB_NAME, DB_USER, DB_PASSWORD',
  '- JWT_SECRET (32+ characters)',
  '- FRONTEND_URL (your domain)',
  '- Payment gateway credentials (CC Avenue)',
  '',
  '## Important Links',
  '',
  '- **Deployment Guide**: See DEPLOYMENT_INSTRUCTIONS.md',
  '- **Backend Setup**: See backend/SETUP.md',
  '- **Database Schema**: See backend/database/mysql-schema.sql',
  '',
  '## Security Notes',
  '',
  '- Change all default passwords and secrets',
  '- Set NODE_ENV=production',
  '- Configure SSL certificate',
  '- Protect .env file from public access',
  '',
  '## Support',
  '',
  'For deployment issues, check:',
  '1. DEPLOYMENT_INSTRUCTIONS.md',
  '2. cPanel Node.js app logs',
  '3. Backend error logs'
].join('\n');

writeFileSync(join(BUILD_DIR, 'README.md'), buildReadme);
console.log('   ✅ Build README created\n');

// Step 10: Create separate zip files for upload
console.log('🔟 Creating zip files for upload...');
const publicHtmlPath = join(BUILD_DIR, 'public_html');
const backendPath = join(BUILD_DIR, 'backend');
const frontendZip = join(BUILD_DIR, 'WWC-frontend.zip');
const backendZip = join(BUILD_DIR, 'WWC-backend.zip');

try {
  // Frontend zip: contents of public_html (extract into public_html on server)
  if (process.platform === 'win32') {
    execSync(`powershell -Command "Compress-Archive -Path '${publicHtmlPath}\\*' -DestinationPath '${frontendZip}' -Force"`, { stdio: 'inherit' });
  } else {
    execSync(`cd "${publicHtmlPath}" && zip -r "${frontendZip}" . -x "*.DS_Store"`, { stdio: 'inherit' });
  }
  console.log('   ✅ WWC-frontend.zip created');
} catch (e) {
  console.warn('   ⚠️  Could not create WWC-frontend.zip (zip tool may be missing). You can zip public_html/ manually.');
}

try {
  // Backend zip: contents of backend (extract into backend on server)
  if (process.platform === 'win32') {
    execSync(`powershell -Command "Compress-Archive -Path '${backendPath}\\*' -DestinationPath '${backendZip}' -Force"`, { stdio: 'inherit' });
  } else {
    execSync(`cd "${backendPath}" && zip -r "${backendZip}" . -x "*.DS_Store" -x "node_modules/*"`, { stdio: 'inherit' });
  }
  console.log('   ✅ WWC-backend.zip created\n');
} catch (e) {
  console.warn('   ⚠️  Could not create WWC-backend.zip (zip tool may be missing). You can zip backend/ manually.\n');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ cPanel build completed successfully!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📦 Build location: cpanel-build/');
console.log('📁 Directory structure:');
console.log('   ├── public_html/     (Frontend - upload to public_html)');
console.log('   ├── backend/        (Backend - set up as Node.js app)');
console.log('   ├── WWC-frontend.zip (Frontend – upload & extract into public_html)');
console.log('   ├── WWC-backend.zip  (Backend – upload & extract into backend)');
console.log('   ├── README.md        (This file)');
console.log('   └── DEPLOYMENT_INSTRUCTIONS.md\n');
console.log('📄 Next steps:');
console.log('   1. Upload WWC-frontend.zip to cPanel → extract in public_html');
console.log('   2. Upload WWC-backend.zip → extract in Node.js app root, run npm install');
console.log('   3. Configure database and environment variables\n');

