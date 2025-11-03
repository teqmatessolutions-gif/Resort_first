#!/bin/bash

# SMTP Configuration Script for Production Server
# Run this script on your server to configure SMTP settings

set -e  # Exit on error

echo "=========================================="
echo "SMTP Configuration Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Server paths
APP_DIR="/var/www/resort/Resort_first/ResortApp"
ENV_FILE="${APP_DIR}/.env.production"

# Check if .env.production exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}Warning: .env.production not found. Creating from template...${NC}"
    
    # Create .env.production if it doesn't exist
    cat > "$ENV_FILE" << 'EOF'
# Production Environment Configuration
ENVIRONMENT=production
DEBUG=False

# Database Configuration (Update these with your actual values)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
DB_HOST=localhost
DB_PORT=5432
DB_NAME=resort_db
DB_USER=resort_user
DB_PASSWORD=your_password

# Security Configuration
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Server Configuration
HOST=0.0.0.0
PORT=8000
WORKERS=4

# Domain Configuration
DOMAIN=teqmates.com
ALLOWED_HOSTS=teqmates.com,www.teqmates.com

# CORS Configuration
CORS_ORIGINS=https://www.teqmates.com,https://teqmates.com

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_FOLDER=uploads
STATIC_FOLDER=static

# Redis Configuration
REDIS_URL=redis://localhost:6379/0
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=/var/log/resort/app.log

# SSL Configuration
SSL_ENABLED=True
SSL_CERT_PATH=/etc/letsencrypt/live/teqmates.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/teqmates.com/privkey.pem

# Frontend Paths
LANDING_PAGE_PATH=../landingpage
DASHBOARD_PATH=../dasboard/build
USEREND_PATH=../userend/userend/build
EOF
    echo -e "${GREEN}Created .env.production template${NC}"
fi

echo -e "${YELLOW}Current SMTP Configuration:${NC}"
if grep -q "SMTP_" "$ENV_FILE"; then
    grep "SMTP_" "$ENV_FILE" | sed 's/SMTP_PASSWORD=.*/SMTP_PASSWORD=****/'
else
    echo -e "${RED}No SMTP configuration found${NC}"
fi

echo ""
echo "=========================================="
echo "Please provide SMTP configuration:"
echo "=========================================="
echo ""

# Prompt for SMTP configuration
read -p "SMTP Host [smtp.gmail.com]: " SMTP_HOST
SMTP_HOST=${SMTP_HOST:-smtp.gmail.com}

read -p "SMTP Port [587]: " SMTP_PORT
SMTP_PORT=${SMTP_PORT:-587}

read -p "SMTP Username/Email: " SMTP_USER
if [ -z "$SMTP_USER" ]; then
    echo -e "${RED}Error: SMTP Username is required${NC}"
    exit 1
fi

read -sp "SMTP Password (App Password for Gmail): " SMTP_PASSWORD
echo ""
if [ -z "$SMTP_PASSWORD" ]; then
    echo -e "${RED}Error: SMTP Password is required${NC}"
    exit 1
fi

read -p "From Email [noreply@elysianretreat.com]: " SMTP_FROM_EMAIL
SMTP_FROM_EMAIL=${SMTP_FROM_EMAIL:-noreply@elysianretreat.com}

read -p "From Name [Elysian Retreat]: " SMTP_FROM_NAME
SMTP_FROM_NAME=${SMTP_FROM_NAME:-Elysian Retreat}

read -p "Use TLS? [true]: " SMTP_USE_TLS
SMTP_USE_TLS=${SMTP_USE_TLS:-true}

echo ""
echo "=========================================="
echo "Updating .env.production file..."
echo "=========================================="

# Remove existing SMTP configuration
sed -i '/^SMTP_/d' "$ENV_FILE"

# Add new SMTP configuration at the end
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

echo -e "${GREEN}✅ SMTP configuration updated successfully!${NC}"
echo ""
echo "=========================================="
echo "Verification:"
echo "=========================================="

# Show SMTP config (hide password)
echo -e "${GREEN}SMTP Configuration:${NC}"
grep "SMTP_" "$ENV_FILE" | sed 's/SMTP_PASSWORD=.*/SMTP_PASSWORD=****/' | sed 's/^/  /'

echo ""
echo "=========================================="
echo "Restarting backend service..."
echo "=========================================="

# Restart the service
if systemctl is-active --quiet resort.service; then
    systemctl restart resort.service
    echo -e "${GREEN}✅ Service restarted successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Service 'resort.service' not found or not running${NC}"
    echo "Trying alternative service names..."
    
    # Try alternative service names
    if systemctl is-active --quiet resort-backend.service; then
        systemctl restart resort-backend.service
        echo -e "${GREEN}✅ Service 'resort-backend.service' restarted successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Please manually restart the backend service:${NC}"
        echo "   sudo systemctl restart resort.service"
        echo "   OR"
        echo "   sudo systemctl restart resort-backend.service"
    fi
fi

echo ""
echo "=========================================="
echo "Testing SMTP Configuration:"
echo "=========================================="

# Check if SMTP variables are set
if grep -q "SMTP_USER=" "$ENV_FILE" && grep -q "SMTP_PASSWORD=" "$ENV_FILE"; then
    SMTP_USER_VALUE=$(grep "SMTP_USER=" "$ENV_FILE" | cut -d'=' -f2)
    if [ -n "$SMTP_USER_VALUE" ] && [ "$SMTP_USER_VALUE" != "your-email@gmail.com" ]; then
        echo -e "${GREEN}✅ SMTP configuration appears to be set${NC}"
        echo ""
        echo "To test email sending:"
        echo "1. Create a test booking through the dashboard"
        echo "2. Check backend logs: sudo journalctl -u resort.service -n 50 | grep -i email"
        echo "3. Verify email is received in guest's inbox"
    else
        echo -e "${YELLOW}⚠️  SMTP_USER appears to be placeholder. Please update with actual email.${NC}"
    fi
else
    echo -e "${RED}❌ SMTP configuration is incomplete${NC}"
fi

echo ""
echo "=========================================="
echo "Service Status:"
echo "=========================================="

# Check service status
if systemctl is-active --quiet resort.service 2>/dev/null; then
    systemctl status resort.service --no-pager -l | head -10
elif systemctl is-active --quiet resort-backend.service 2>/dev/null; then
    systemctl status resort-backend.service --no-pager -l | head -10
else
    echo -e "${YELLOW}⚠️  Could not find active backend service${NC}"
    echo "Run: sudo systemctl list-units | grep resort"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "✅ SMTP Configuration Complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Create a test booking to verify email sending"
echo "2. Check logs: sudo journalctl -u resort.service -n 50"
echo "3. If issues, see: SMTP_SETUP_GUIDE.md"
echo ""

