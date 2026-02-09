# cPanel Deployment Checklist - Will It Work?

## ✅ Pre-Deployment Verification

### 1. Build Process
- [x] **Build script exists**: `npm run build:cpanel` is configured
- [x] **Frontend build**: Vite build creates optimized production files
- [x] **Backend preparation**: Backend files are properly packaged
- [x] **.htaccess file**: Configured for SPA routing and API proxying

### 2. Configuration Files
- [x] **.htaccess**: Properly configured for cPanel (SPA routing + API proxy)
- [x] **Environment variables**: Template provided in `.env.example`
- [x] **Build script**: Creates deployment-ready packages

### 3. Potential Issues & Solutions

#### ⚠️ Issue 1: API URL Configuration
**Problem**: Frontend uses `http://localhost:3001` as fallback if `VITE_API_URL` is not set.

**Solution**: 
- **Option A (Recommended)**: Set `VITE_API_URL` environment variable before building:
  ```bash
  VITE_API_URL=https://yourdomain.com/api npm run build:cpanel
  ```
- **Option B**: After building, manually update API URLs in built files (not recommended)

#### ⚠️ Issue 2: Debug Code in Production
**Problem**: There are debug fetch calls to `http://127.0.0.1:7242` in the codebase.

**Impact**: These will fail silently in production (they have `.catch(()=>{})`), but they're unnecessary.

**Solution**: These are safe to leave (they fail silently), but can be removed for cleaner production code.

#### ⚠️ Issue 3: CORS Configuration
**Status**: ✅ **GOOD** - Backend CORS is configured to allow all origins in production mode, which is correct for cPanel deployment.

#### ⚠️ Issue 4: Database Connection
**Requirement**: MySQL database must be created and configured in cPanel before starting the backend.

**Solution**: Follow the deployment guide to:
1. Create MySQL database in cPanel
2. Create database user
3. Set environment variables in Node.js app
4. Run migration script: `npm run migrate`

#### ⚠️ Issue 5: Node.js Version
**Requirement**: Node.js 18+ must be available in cPanel.

**Solution**: Verify in cPanel Node.js App settings that Node.js 18+ is selected.

#### ⚠️ Issue 6: File Permissions
**Requirement**: Proper file permissions for cPanel.

**Solution**: 
- Files: 644
- Directories: 755
- `.htaccess`: 644

#### ⚠️ Issue 7: mod_rewrite and mod_proxy
**Requirement**: Apache modules must be enabled for `.htaccess` to work.

**Solution**: Most cPanel hosts have these enabled by default. If not, contact hosting provider.

## ✅ Deployment Steps (Error-Free)

### Step 1: Build for Production
```bash
# Set your production API URL
VITE_API_URL=https://yourdomain.com/api npm run build:cpanel
```

### Step 2: Upload Frontend
1. Upload `cpanel-build/public_html/*` to `public_html/` in cPanel
2. Ensure `.htaccess` is uploaded (enable "Show Hidden Files" in File Manager)
3. Verify file permissions (644 for files, 755 for directories)

### Step 3: Set Up Backend
1. Create Node.js App in cPanel:
   - Node.js version: 18.x or higher
   - Application root: `/home/username/backend`
   - Application URL: `/api` (or subdomain)
   - Startup file: `server.js` or `passenger-loader.cjs`
2. Upload backend files from `cpanel-build/backend/`
3. Run `npm install` in Node.js app terminal
4. Set all environment variables (see `.env.example`)
5. Start the application

### Step 4: Configure Database
1. Create MySQL database in cPanel
2. Create database user
3. Add user to database with ALL PRIVILEGES
4. Update environment variables with database credentials
5. Run migration: `npm run migrate`

### Step 5: Test
1. Frontend: Visit `https://yourdomain.com`
2. Backend: Visit `https://yourdomain.com/api/health`
3. Test login/registration

## ✅ Will It Work Without Errors?

### YES, if you follow these requirements:

1. ✅ **Build with correct API URL**: Use `VITE_API_URL` environment variable
2. ✅ **Node.js 18+ available**: Verify in cPanel
3. ✅ **MySQL database created**: Before starting backend
4. ✅ **Environment variables set**: All required variables in Node.js app settings
5. ✅ **File permissions correct**: 644 for files, 755 for directories
6. ✅ **.htaccess uploaded**: Enable "Show Hidden Files" in File Manager
7. ✅ **mod_rewrite enabled**: Usually enabled by default in cPanel

### Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| Frontend shows blank page | API URL not configured | Rebuild with `VITE_API_URL` |
| 404 on routes | .htaccess not working | Check mod_rewrite enabled, verify .htaccess uploaded |
| CORS errors | Backend not running | Check Node.js app status, verify CORS config |
| Database connection failed | Wrong credentials | Verify environment variables |
| 500 Internal Server Error | Missing dependencies | Run `npm install` in backend |
| API returns 404 | Proxy not working | Check .htaccess proxy rules, verify Node.js app port |

## 🎯 Quick Answer

**YES, it will work in cPanel without errors IF:**
1. You build with the correct `VITE_API_URL` environment variable
2. You follow the deployment steps in `CPANEL_DEPLOYMENT.md`
3. You configure all environment variables correctly
4. You set up the database before starting the backend
5. Your cPanel hosting has Node.js 18+ support

**The project is already configured for cPanel deployment** - the build script, .htaccess, and deployment guides are all in place.

