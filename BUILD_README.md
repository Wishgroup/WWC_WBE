# Build and Deployment Guide

## Quick Build for cPanel

### 1. Configure Production Environment (Optional but Recommended)

```bash
npm run setup:prod
```

This will:
- Ask for your production domain
- Create `.env.production` for frontend
- Create `backend/.env.production` template

### 2. Build for cPanel

```bash
npm run build:cpanel
```

This will:
- Build the frontend (React/Vite app)
- Prepare backend files
- Create `cpanel-build/` directory with:
  - `public_html/` - Frontend files ready to upload
  - `backend/` - Backend files ready to upload
  - `DEPLOYMENT_INSTRUCTIONS.md` - Step-by-step guide

### 3. Deploy to cPanel

1. **Upload Frontend**:
   - Upload `cpanel-build/public_html/*` to `public_html/` in cPanel

2. **Upload Backend**:
   - Upload `cpanel-build/backend/*` to your backend directory
   - Or use cPanel Node.js App feature

3. **Set Up Node.js App**:
   - Create Node.js application in cPanel
   - Configure environment variables
   - Start the application

4. **Run Database Migration**:
   ```bash
   npm run migrate
   ```

See `DEPLOYMENT_CPANEL.md` for detailed instructions.

## Build Scripts

- `npm run build` - Build frontend only
- `npm run build:prod` - Build frontend with production mode
- `npm run build:cpanel` - Full cPanel build (frontend + backend)
- `npm run setup:prod` - Configure production environment variables

## Build Output

After running `npm run build:cpanel`, you'll have:

```
cpanel-build/
├── public_html/              # Upload to public_html in cPanel
│   ├── index.html
│   ├── assets/
│   ├── .htaccess
│   └── ...
├── backend/                  # Upload to backend directory
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── routes/
│   ├── services/
│   └── ...
└── DEPLOYMENT_INSTRUCTIONS.md
```

## Environment Variables

### Frontend (.env.production)
```env
VITE_API_URL=https://yourdomain.com/api
```

### Backend (backend/.env)
```env
NODE_ENV=production
DB_HOST=localhost
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
FRONTEND_URL=https://yourdomain.com
# ... (see backend/.env.example)
```

## Troubleshooting

### Build Fails
- Check Node.js version (18+ required)
- Ensure all dependencies are installed: `npm install`
- Check for syntax errors in code

### API Not Working After Deployment
- Verify `.htaccess` is uploaded correctly
- Check Node.js app is running in cPanel
- Verify API URL in frontend matches backend location
- Check CORS settings in backend

### Frontend Routing Issues
- Ensure `.htaccess` is in `public_html/`
- Verify mod_rewrite is enabled
- Check file permissions (644 for files, 755 for directories)

