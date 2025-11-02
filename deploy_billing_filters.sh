#!/bin/bash
set -e
echo "🚀 Deploying Billing Filters & Fixes to Production..."

# Navigate to project directory
cd /var/www/resort/Resort_first || exit 1

echo "📥 Pulling latest changes from GitHub..."
git pull origin main
if [ $? -ne 0 ]; then
    echo "❌ Git pull failed. Resolving conflicts..."
    git reset --hard HEAD
    git pull origin main
fi

echo "🔨 Building frontend..."
cd dasboard
npm install --legacy-peer-deps
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "📦 Copying frontend build to production..."
sudo cp -r build/* /var/www/resort/admin/

echo "🔄 Restarting backend service..."
cd ../ResortApp
sudo systemctl restart resort.service
sleep 3

echo "✅ Checking service status..."
if sudo systemctl is-active --quiet resort.service; then
    echo "✅ Backend service is running"
else
    echo "❌ Backend service failed to start. Check logs:"
    echo "   sudo journalctl -u resort.service -n 50 --no-pager"
    exit 1
fi

echo "🧪 Testing checkout endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/bill/checkouts?skip=0&limit=20 || echo "000")
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
echo "   2. Test billing page: Visit https://www.teqmates.com/admin/billing"
echo "   3. Test filters: Try using search and filter options"
echo "   4. Test checkout: Try checking out a room and verify booking_id shows correctly"
echo ""
echo "🎉 All done!"

