# Comprehensive Testing Guide - Wish Waves Club

This guide covers all testing methods for the Wish Waves Club application.

## 📋 Table of Contents

1. [Quick Start Testing](#quick-start-testing)
2. [Backend Testing](#backend-testing)
3. [Frontend Testing](#frontend-testing)
4. [API Endpoint Testing](#api-endpoint-testing)
5. [Integration Testing](#integration-testing)
6. [Payment Flow Testing](#payment-flow-testing)
7. [Automated Testing Setup](#automated-testing-setup)

---

## 🚀 Quick Start Testing

### Prerequisites
- Node.js 18+ installed
- Database (MySQL/PostgreSQL) running
- Environment variables configured (`.env` files)

### Step 1: Test Backend Setup

```bash
cd backend
npm install
npm run test-setup
```

This will verify:
- ✅ Database connection
- ✅ Required tables exist
- ✅ Environment variables are set
- ✅ Service modules load correctly

### Step 2: Start Backend Server

```bash
cd backend
npm run dev
```

Backend should start on `http://localhost:3001`

### Step 3: Start Frontend

```bash
# In project root
npm install
npm run dev
```

Frontend should start on `http://localhost:5173`

### Step 4: Quick Health Check

Open browser and visit:
- Frontend: http://localhost:5173
- Backend Health: http://localhost:3001/health

---

## 🔧 Backend Testing

### 1. Setup Verification

```bash
cd backend
npm run test-setup
```

**Expected Output:**
```
🧪 Testing Wish Waves Club Backend Setup...

1️⃣  Testing database connection...
   ✅ Database connected
   📅 Server time: 2025-01-XX XX:XX:XX
   🗄️  PostgreSQL: PostgreSQL 14.x

2️⃣  Checking database tables...
   ✅ All 11 tables exist

3️⃣  Checking database indexes...
   ✅ XX indexes found

4️⃣  Checking environment variables...
   ✅ All required environment variables set

5️⃣  Testing service modules...
   ✅ All service modules loaded successfully

🎉 Backend is ready to use!
```

### 2. Database Migration Testing

```bash
cd backend
npm run migrate
```

This will:
- Create all required tables
- Set up indexes
- Initialize default data

### 3. Seed Test Data

```bash
cd backend
npm run seed-test-users
```

This creates test users for:
- Admin accounts
- Member accounts
- Vendor accounts

### 4. Backend API Testing

Use the provided test script:

**On Windows (PowerShell):**
```powershell
cd backend
# Make sure server is running first
# Then test endpoints manually or use curl/Postman
```

**On Linux/Mac:**
```bash
cd backend
chmod +x examples/test-api.sh
./examples/test-api.sh
```

---

## 🎨 Frontend Testing

### 1. Development Server

```bash
npm run dev
```

Visit: http://localhost:5173

### 2. Test Pages Manually

**Homepage:**
- http://localhost:5173/
- Check navigation, hero section, features

**Registration:**
- http://localhost:5173/join
- Fill out form and test validation

**Login:**
- http://localhost:5173/login
- Test authentication flow

**Member Dashboard:**
- http://localhost:5173/dashboard
- Requires authentication

### 3. Build Testing

```bash
npm run build
npm run preview
```

This tests the production build locally.

### 4. Browser Console Testing

Open DevTools (F12) and check:
- **Console Tab:** No JavaScript errors
- **Network Tab:** API calls are successful
- **Application Tab:** Check localStorage for tokens

---

## 🔌 API Endpoint Testing

### Using cURL (Command Line)

#### Health Check
```bash
curl http://localhost:3001/health
```

#### Authentication - Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "fullName": "Test User"
  }'
```

#### Authentication - Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

#### Get Events (Public)
```bash
curl http://localhost:3001/api/events
```

#### NFC Validation (Requires Vendor API Key)
```bash
curl -X POST http://localhost:3001/api/nfc/validate \
  -H "Content-Type: application/json" \
  -H "X-Vendor-API-Key: VENDOR001" \
  -d '{
    "cardUid": "CARD123456789",
    "posReaderId": "POS001",
    "latitude": 25.2048,
    "longitude": 55.2708,
    "transactionAmount": 100.00
  }'
```

### Using Postman

1. **Import Collection:**
   - Create a new collection
   - Add requests for each endpoint
   - Set base URL: `http://localhost:3001`

2. **Test Flow:**
   - Register → Login → Get Profile → Use Protected Endpoints

3. **Environment Variables:**
   - Create environment with:
     - `base_url`: `http://localhost:3001`
     - `token`: (set after login)

### Using Browser DevTools

1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter by **Fetch/XHR**
4. Interact with frontend
5. Check API requests/responses

---

## 🔗 Integration Testing

### Full Registration Flow

1. **Start both servers:**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   npm run dev
   ```

2. **Test Registration:**
   - Visit: http://localhost:5173/join
   - Fill registration form
   - Submit and verify redirect

3. **Test Payment:**
   - Complete payment flow
   - Verify redirect back
   - Check database for saved data

### Authentication Flow

1. **Register new user**
2. **Login with credentials**
3. **Access protected routes**
4. **Verify token in localStorage**
5. **Test logout**

### NFC Card Validation Flow

1. **Setup vendor account**
2. **Get vendor API key**
3. **Test NFC validation endpoint**
4. **Verify fraud detection**
5. **Check audit logs**

---

## 💳 Payment Flow Testing

### CC Avenue Payment Testing

**Important:** See `TESTING_GUIDE.md` for detailed payment testing steps.

**Quick Test:**
1. Go to: http://localhost:5173/join
2. Fill registration form
3. Select membership type
4. Click "Proceed to Payment Gateway"
5. Complete payment on CC Avenue
6. Verify redirect back
7. Check success/failure handling

### Test Payment Scenarios

**Success:**
- Complete payment
- Verify redirect to success page
- Check database for membership record
- Verify email notification

**Failure:**
- Cancel payment
- Verify redirect to error page
- Check database (should NOT save)
- Verify error message

**Timeout:**
- Let payment page timeout
- Verify proper error handling

---

## 🤖 Automated Testing Setup

### Option 1: Jest + React Testing Library (Recommended)

**Install dependencies:**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

**Backend testing:**
```bash
cd backend
npm install --save-dev jest supertest
```

**Create test files:**
- `src/__tests__/` for frontend tests
- `backend/__tests__/` for backend tests

### Option 2: Vitest (Vite-native)

**Install:**
```bash
npm install --save-dev vitest @vitest/ui
```

**Configure `vite.config.js`:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
```

**Run tests:**
```bash
npm run test
```

### Example Test Files

**Frontend Component Test:**
```javascript
// src/__tests__/App.test.jsx
import { render, screen } from '@testing-library/react'
import App from '../App'

test('renders homepage', () => {
  render(<App />)
  const linkElement = screen.getByText(/Wish Waves Club/i)
  expect(linkElement).toBeInTheDocument()
})
```

**Backend API Test:**
```javascript
// backend/__tests__/health.test.js
import request from 'supertest'
import app from '../server.js'

describe('Health Check', () => {
  test('GET /health', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200)
    
    expect(response.body.status).toBe('ok')
  })
})
```

---

## 📊 Testing Checklist

### Backend
- [ ] Database connection works
- [ ] All tables exist
- [ ] Environment variables set
- [ ] Health endpoint responds
- [ ] Authentication endpoints work
- [ ] Protected routes require auth
- [ ] NFC validation works
- [ ] Payment endpoints work
- [ ] Admin endpoints work
- [ ] Error handling works

### Frontend
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Registration form works
- [ ] Form validation works
- [ ] Login works
- [ ] Protected routes redirect
- [ ] Payment flow works
- [ ] Responsive design works
- [ ] No console errors

### Integration
- [ ] Registration → Payment → Success flow
- [ ] Login → Dashboard access
- [ ] NFC card validation
- [ ] Email notifications
- [ ] Database persistence
- [ ] Error handling across stack

---

## 🐛 Debugging Tips

### Backend Issues

**Database connection fails:**
- Check database is running
- Verify `.env` credentials
- Check firewall/network

**API returns 500:**
- Check server logs
- Verify database connection
- Check environment variables

**CORS errors:**
- Verify CORS config in `server.js`
- Check frontend URL matches allowed origins

### Frontend Issues

**API calls fail:**
- Check backend is running
- Verify API URL in `src/services/api.js`
- Check CORS configuration

**Build fails:**
- Clear `node_modules` and reinstall
- Check for syntax errors
- Verify all dependencies installed

**Payment redirect issues:**
- Check CC Avenue configuration
- Verify redirect URLs in `.env`
- Check browser console for errors

---

## 📝 Test Data

### Test Users

After running `npm run seed-test-users` in backend:

**Admin:**
- Email: `admin@wishwavesclub.com`
- Password: (check seed script)

**Member:**
- Email: `member@example.com`
- Password: (check seed script)

**Vendor:**
- API Key: `VENDOR001`
- (check seed script for details)

---

## 🔍 Monitoring & Logs

### Backend Logs
- Check console output when running `npm run dev`
- Logs include: API requests, errors, database queries

### Frontend Logs
- Browser DevTools Console
- Network tab for API calls
- Application tab for storage

### Database Logs
- Check database logs for queries
- Monitor for slow queries
- Check for connection issues

---

## ✅ Next Steps

1. **Run setup test:** `cd backend && npm run test-setup`
2. **Start servers:** Backend + Frontend
3. **Test registration flow:** Complete end-to-end
4. **Test payment:** Verify CC Avenue integration
5. **Set up automated tests:** Install testing framework
6. **Create test suite:** Write unit and integration tests

---

## 📚 Additional Resources

- `TESTING_GUIDE.md` - Detailed payment flow testing
- `backend/examples/test-api.sh` - API test script
- `backend/scripts/test-setup.js` - Setup verification
- `TEST_CREDENTIALS.md` - Test account credentials

---

**Need Help?** Check the logs, verify environment variables, and ensure all services are running.


