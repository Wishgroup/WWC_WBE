@echo off
REM Complete cPanel Build and Deployment Script for Windows
REM This script builds the application and prepares it for cPanel deployment

echo.
echo 🚀 Wish Waves Club - cPanel Build Script
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo ✅ Node.js detected
echo.

REM Install frontend dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    call npm install
)

REM Install backend dependencies if needed
if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

REM Run the build script
echo.
echo 🔨 Running cPanel build...
node build-cpanel.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Build completed successfully!
    echo.
    echo 📦 Your build is ready in: cpanel-build\
    echo.
    echo Next steps:
    echo 1. Review cpanel-build\DEPLOYMENT_INSTRUCTIONS.md
    echo 2. Upload cpanel-build\public_html\ to your cPanel public_html\
    echo 3. Set up Node.js app in cPanel with cpanel-build\backend\
    echo 4. Configure database and environment variables
    echo 5. Run 'npm run migrate' in the backend directory
) else (
    echo.
    echo ❌ Build failed. Please check the errors above.
    exit /b 1
)


