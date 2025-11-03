#!/bin/bash

# Quick Deploy Script for Latest Changes
# Run this on the server

set -e

echo "=========================================="
echo "Deploying Latest Changes"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Navigate to project
cd /var/www/resort/Resort_first

echo -e "${YELLOW}1. Pulling latest changes from GitHub...${NC}"
git pull origin main
echo -e "${GREEN}✅ Pulled successfully${NC}"
echo ""

echo -e "${YELLOW}2. Building frontend dashboard...${NC}"
cd dasboard
npm install --legacy-peer-deps
npm run build
echo -e "${GREEN}✅ Build completed${NC}"
echo ""

echo -e "${YELLOW}3. Copying build files...${NC}"
sudo mkdir -p /var/www/resort/dashboard/
sudo cp -r build/* /var/www/resort/dashboard/
sudo chown -R www-data:www-data /var/www/resort/dashboard/
sudo chmod -R 755 /var/www/resort/dashboard/
echo -e "${GREEN}✅ Files copied${NC}"
echo ""

echo -e "${YELLOW}4. Restarting backend service...${NC}"
cd ../ResortApp
sudo systemctl restart resort.service
echo -e "${GREEN}✅ Service restarted${NC}"
echo ""

echo -e "${YELLOW}5. Verifying deployment...${NC}"
sleep 2
if systemctl is-active --quiet resort.service; then
    echo -e "${GREEN}✅ Backend service is running${NC}"
    echo ""
    echo "Service Status:"
    systemctl status resort.service --no-pager -l | head -10
else
    echo -e "${RED}❌ Backend service is not running${NC}"
    echo "Run: sudo systemctl status resort.service"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Deployment Complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Test the dashboard: https://www.teqmates.com/dashboard"
echo "2. Verify infinite scroll on Bookings, Billing, Expenses pages"
echo "3. Check API pagination: /api/bookings?skip=0&limit=20"
echo ""

