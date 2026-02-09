# Quick cPanel Deployment Guide

## 🚀 One-Command Build

```bash
npm run build:cpanel
```

This creates a `cpanel-build/` directory ready for deployment.

## 📦 What Gets Built

- **Frontend** → `cpanel-build/public_html/` (upload to `public_html`)
- **Backend** → `cpanel-build/backend/` (set up as Node.js app)

## 📋 Deployment Checklist

### 1. Upload Frontend
- [ ] Upload `cpanel-build/public_html/*` to cPanel `public_html/`
- [ ] Verify `.htaccess` is uploaded

### 2. Set Up Backend
- [ ] Create Node.js app in cPanel
- [ ] Upload `cpanel-build/backend/*` to app root
- [ ] Run `npm install` in Node.js app terminal
- [ ] Set environment variables (see `.env.example`)
- [ ] Start the app

### 3. Database Setup
- [ ] Create MySQL database in cPanel
- [ ] Run `npm run migrate` in backend directory
- [ ] Verify tables created

### 4. Configuration
- [ ] Update API URL in frontend (if needed)
- [ ] Set up SSL certificate
- [ ] Test deployment

## 🔗 Full Documentation

- **Complete Guide**: See `CPANEL_DEPLOYMENT.md`
- **Build Instructions**: See `cpanel-build/DEPLOYMENT_INSTRUCTIONS.md`
- **Backend Setup**: See `backend/SETUP.md`

## ⚡ Quick Test

After deployment, test:
- Frontend: `https://yourdomain.com`
- Backend: `https://yourdomain.com/api/health`









