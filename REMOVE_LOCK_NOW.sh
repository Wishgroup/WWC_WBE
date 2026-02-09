#!/bin/bash
# Script to remove Node.js app lock in cPanel
# Run this via SSH after authorizing your SSH key

echo "🔓 Removing lock files..."

# Navigate to home directory
cd ~

# Remove all lock files
find . -name ".passenger_lock" -type f -delete 2>/dev/null
find . -name "passenger.lock" -type f -delete 2>/dev/null
find . -name "*.pid" -path "*/tmp/pids/*" -delete 2>/dev/null
find Wishwaveclubbackend -name "*lock*" -type f -delete 2>/dev/null

# Kill stuck processes
echo "🛑 Killing stuck processes..."
pkill -9 -f "passenger.*Wishwaveclubbackend" 2>/dev/null
pkill -9 -f "node.*Wishwaveclubbackend" 2>/dev/null
pkill -9 -f "passenger.*wishhosp" 2>/dev/null

# Remove restart file
rm -f ~/tmp/restart.txt

# Wait
sleep 2

# Create new restart file
touch ~/tmp/restart.txt 2>/dev/null

echo "✅ Lock removed! Try DESTROY in cPanel now."

# Show what's left (should be nothing)
echo ""
echo "Checking for remaining locks:"
find . -name "*lock*" -o -name "*.pid" 2>/dev/null | head -5

