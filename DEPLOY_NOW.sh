#!/bin/bash

# Resort Management System - Deployment Script
# Run this script on your production server

set -e  # Exit on error

echo "🚀 Starting Deployment Process..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run with sudo or as root${NC}"
    exit 1
fi

# Navigate to project directory
cd /var/www/resort/Resort_first || { echo -e "${RED}Project directory not found!${NC}"; exit 1; }

echo -e "${GREEN}Step 1/6: Pulling latest code from GitHub...${NC}"
git pull origin main || { echo -e "${RED}Git pull failed!${NC}"; exit 1; }
echo "✅ Code updated"
echo ""

echo -e "${GREEN}Step 2/6: Updating Python dependencies...${NC}"
cd ResortApp
source venv/bin/activate
pip install -r requirements_production.txt || { echo -e "${RED}Pip install failed!${NC}"; exit 1; }
echo "✅ Python dependencies updated"
echo ""

echo -e "${GREEN}Step 3/6: Building Dashboard frontend...${NC}"
cd ../dasboard
npm install --legacy-peer-deps || { echo -e "${RED}NPM install failed for dashboard!${NC}"; exit 1; }
npm run build || { echo -e "${RED}Dashboard build failed!${NC}"; exit 1; }
echo "✅ Dashboard built successfully"
echo ""

echo -e "${GREEN}Step 4/6: Building Userend frontend...${NC}"
cd ../userend/userend
npm install --legacy-peer-deps || { echo -e "${RED}NPM install failed for userend!${NC}"; exit 1; }
npm run build || { echo -e "${RED}Userend build failed!${NC}"; exit 1; }
echo "✅ Userend built successfully"
echo ""

echo -e "${GREEN}Step 5/6: Restarting services...${NC}"
cd /var/www/resort/Resort_first/ResortApp
systemctl restart resort.service || { echo -e "${RED}Failed to restart resort.service!${NC}"; exit 1; }
systemctl restart nginx || { echo -e "${RED}Failed to restart nginx!${NC}"; exit 1; }
echo "✅ Services restarted"
echo ""

echo -e "${GREEN}Step 6/6: Checking service status...${NC}"
sleep 2
systemctl status resort.service --no-pager -l | head -n 10
echo ""
systemctl status nginx --no-pager -l | head -n 10
echo ""

echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Test the application: https://www.teqmates.com"
echo "2. Test dashboard: https://www.teqmates.com/admin"
echo "3. Test userend: https://www.teqmates.com/resort"
echo "4. Configure email settings if not done:"
echo "   sudo systemctl edit resort.service"
echo ""
echo -e "${YELLOW}📊 Check logs if needed:${NC}"
echo "sudo journalctl -u resort.service -f"
echo ""

