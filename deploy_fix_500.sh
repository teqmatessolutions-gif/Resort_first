#!/bin/bash

# Quick deployment script for 500 error fixes
# Run this on the server to deploy all fixes

set -e  # Exit on error

echo "🚀 Deploying 500 Error Fixes to Production..."
echo ""

# Navigate to project directory
cd /var/www/resort/Resort_first || exit 1

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Check if there were any conflicts
if [ $? -ne 0 ]; then
    echo "❌ Git pull failed. Resolving conflicts..."
    git reset --hard HEAD
    git pull origin main
fi

# Restart backend service
echo "🔄 Restarting backend service..."
sudo systemctl restart resort.service

# Wait a moment for service to start
sleep 3

# Check service status
echo "✅ Checking service status..."
if sudo systemctl is-active --quiet resort.service; then
    echo "✅ Backend service is running"
else
    echo "❌ Backend service failed to start. Check logs:"
    echo "   sudo journalctl -u resort.service -n 50 --no-pager"
    exit 1
fi

# Test endpoint
echo "🧪 Testing booking endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/bookings || echo "000")

if [ "$response" = "200" ] || [ "$response" = "401" ]; then
    echo "✅ Backend API is responding (HTTP $response)"
else
    echo "⚠️  Backend API returned HTTP $response"
    echo "   Check logs: sudo journalctl -u resort.service -n 100 --no-pager"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Monitor logs: sudo journalctl -u resort.service -f"
echo "   2. Test booking: Try creating a booking via the frontend"
echo "   3. Check errors: sudo journalctl -u resort.service -n 200 | grep -i error"

