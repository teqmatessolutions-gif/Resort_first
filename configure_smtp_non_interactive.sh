#!/bin/bash

# Non-Interactive SMTP Configuration Script
# This script sets up SMTP with pre-configured values

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Server paths
APP_DIR="/var/www/resort/Resort_first/ResortApp"
ENV_FILE="${APP_DIR}/.env.production"

echo "=========================================="
echo "SMTP Configuration (Non-Interactive)"
echo "=========================================="
echo ""

# SMTP Configuration Values
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="teqmatessolutions@gmail.com"
SMTP_PASSWORD="yzoo wxec oulc gxey"
SMTP_FROM_EMAIL="noreply@elysianretreat.com"
SMTP_FROM_NAME="Elysian Retreat"
SMTP_USE_TLS="true"

# Navigate to app directory
cd "$APP_DIR" || exit 1

# Check if .env.production exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}Warning: .env.production not found.${NC}"
    exit 1
fi

echo -e "${GREEN}Updating SMTP configuration...${NC}"

# Remove existing SMTP configuration
sed -i '/^SMTP_/d' "$ENV_FILE"

# Add new SMTP configuration
cat >> "$ENV_FILE" << EOF

# SMTP Email Configuration (Required for booking confirmation emails)
SMTP_HOST=$SMTP_HOST
SMTP_PORT=$SMTP_PORT
SMTP_USER=$SMTP_USER
SMTP_PASSWORD=$SMTP_PASSWORD
SMTP_FROM_EMAIL=$SMTP_FROM_EMAIL
SMTP_FROM_NAME=$SMTP_FROM_NAME
SMTP_USE_TLS=$SMTP_USE_TLS
EOF

# Set proper permissions
chmod 600 "$ENV_FILE"
chown www-data:www-data "$ENV_FILE"

echo -e "${GREEN}✅ SMTP configuration updated!${NC}"
echo ""

# Display configuration (hide password)
echo "=========================================="
echo "SMTP Configuration:"
echo "=========================================="
grep "SMTP_" "$ENV_FILE" | sed 's/SMTP_PASSWORD=.*/SMTP_PASSWORD=****/' | sed 's/^/  /'
echo ""

# Restart service
echo "=========================================="
echo "Restarting backend service..."
echo "=========================================="

if systemctl is-active --quiet resort.service 2>/dev/null; then
    systemctl restart resort.service
    echo -e "${GREEN}✅ Service 'resort.service' restarted${NC}"
elif systemctl is-active --quiet resort-backend.service 2>/dev/null; then
    systemctl restart resort-backend.service
    echo -e "${GREEN}✅ Service 'resort-backend.service' restarted${NC}"
else
    echo -e "${YELLOW}⚠️  Service not found. Please restart manually:${NC}"
    echo "   sudo systemctl restart resort.service"
fi

# Wait a moment for service to start
sleep 2

# Check service status
echo ""
echo "=========================================="
echo "Service Status:"
echo "=========================================="

if systemctl is-active --quiet resort.service 2>/dev/null; then
    systemctl status resort.service --no-pager -l | head -10
elif systemctl is-active --quiet resort-backend.service 2>/dev/null; then
    systemctl status resort-backend.service --no-pager -l | head -10
else
    echo -e "${YELLOW}⚠️  Could not check service status${NC}"
    echo "Run: sudo systemctl status resort.service"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "✅ SMTP Configuration Complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Test by creating a booking"
echo "2. Check logs: sudo journalctl -u resort.service -n 50 | grep -i email"
echo "3. Verify email is sent successfully"
echo ""

