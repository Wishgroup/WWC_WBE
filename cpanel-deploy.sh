#!/bin/bash
# Quick cPanel Deployment Script
# Run this after building to deploy to cPanel

echo "🚀 cPanel Deployment Script"
echo "=========================="
echo ""

# Check if build exists
if [ ! -d "cpanel-build" ]; then
    echo "❌ Build directory not found. Run 'npm run build:cpanel' first."
    exit 1
fi

echo "📦 Build found in cpanel-build/"
echo ""
echo "Next steps:"
echo "1. Upload cpanel-build/public_html/* to your cPanel public_html directory"
echo "2. Upload cpanel-build/backend/* to your backend directory"
echo "3. Set up Node.js app in cPanel"
echo "4. Configure environment variables"
echo "5. Run database migration"
echo ""
echo "See DEPLOYMENT_CPANEL.md for detailed instructions."
echo ""

