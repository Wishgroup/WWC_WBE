# Quick Test Script for Wish Waves Club
# Run this in PowerShell to quickly test your setup

Write-Host "🧪 Wish Waves Club - Quick Test Script" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "1️⃣  Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
Write-Host "2️⃣  Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "   ✅ npm installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm not found" -ForegroundColor Red
    exit 1
}

# Check backend setup
Write-Host ""
Write-Host "3️⃣  Testing backend setup..." -ForegroundColor Yellow
if (Test-Path "backend") {
    Set-Location backend
    if (Test-Path "package.json") {
        Write-Host "   ✅ Backend directory found" -ForegroundColor Green
        
        # Check if node_modules exists
        if (-not (Test-Path "node_modules")) {
            Write-Host "   ⚠️  node_modules not found. Run: npm install" -ForegroundColor Yellow
        } else {
            Write-Host "   ✅ Dependencies installed" -ForegroundColor Green
        }
        
        # Run test-setup if available
        if (Test-Path "scripts\test-setup.js") {
            Write-Host "   Running backend setup test..." -ForegroundColor Cyan
            npm run test-setup
        }
    } else {
        Write-Host "   ⚠️  package.json not found in backend" -ForegroundColor Yellow
    }
    Set-Location ..
} else {
    Write-Host "   ⚠️  Backend directory not found" -ForegroundColor Yellow
}

# Check frontend setup
Write-Host ""
Write-Host "4️⃣  Testing frontend setup..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "   ✅ Frontend package.json found" -ForegroundColor Green
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "   ⚠️  node_modules not found. Run: npm install" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Dependencies installed" -ForegroundColor Green
    }
} else {
    Write-Host "   ⚠️  package.json not found" -ForegroundColor Yellow
}

# Check environment files
Write-Host ""
Write-Host "5️⃣  Checking environment files..." -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    Write-Host "   ✅ Backend .env file exists" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Backend .env file not found" -ForegroundColor Yellow
    Write-Host "   💡 Create backend/.env with required variables" -ForegroundColor Cyan
}

# Test backend health endpoint (if server is running)
Write-Host ""
Write-Host "6️⃣  Testing backend health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Backend server is running!" -ForegroundColor Green
        Write-Host "   📍 Backend URL: http://localhost:3001" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ⚠️  Backend server is not running" -ForegroundColor Yellow
    Write-Host "   💡 Start backend: cd backend && npm run dev" -ForegroundColor Cyan
}

# Test frontend (if server is running)
Write-Host ""
Write-Host "7️⃣  Testing frontend server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend server is running!" -ForegroundColor Green
        Write-Host "   📍 Frontend URL: http://localhost:5173" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ⚠️  Frontend server is not running" -ForegroundColor Yellow
    Write-Host "   💡 Start frontend: npm run dev" -ForegroundColor Cyan
}

# Summary
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Quick test completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Install dependencies: npm install (root) and cd backend && npm install" -ForegroundColor White
Write-Host "   2. Configure .env files with your credentials" -ForegroundColor White
Write-Host "   3. Run backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "   4. Run frontend: npm run dev" -ForegroundColor White
Write-Host "   5. Visit: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed testing guide, see: COMPREHENSIVE_TESTING_GUIDE.md" -ForegroundColor Cyan
Write-Host ""

