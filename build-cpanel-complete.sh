#!/bin/bash
# Complete cPanel Build and Deployment Script
# This script builds the application and prepares it for cPanel deployment

echo "🚀 Wish Waves Club - cPanel Build Script"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Install backend dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Run the build script
echo ""
echo "🔨 Running cPanel build..."
node build-cpanel.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build completed successfully!"
    echo ""
    echo "📦 Your build is ready in: cpanel-build/"
    echo ""
    echo "Next steps:"
    echo "1. Review cpanel-build/DEPLOYMENT_INSTRUCTIONS.md"
    echo "2. Upload cpanel-build/public_html/ to your cPanel public_html/"
    echo "3. Set up Node.js app in cPanel with cpanel-build/backend/"
    echo "4. Configure database and environment variables"
    echo "5. Run 'npm run migrate' in the backend directory"
else
    echo ""
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi


