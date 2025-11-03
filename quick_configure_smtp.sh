#!/bin/bash

# Quick SMTP Configuration Script
# Simple version - just prompts for email and password

APP_DIR="/var/www/resort/Resort_first/ResortApp"
ENV_FILE="${APP_DIR}/.env.production"

echo "=========================================="
echo "Quick SMTP Configuration"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Navigate to app directory
cd "$APP_DIR" || exit 1

# Check if .env.production exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env.production not found at $ENV_FILE"
    echo "Please run full deployment script first"
    exit 1
fi

# Prompt for configuration
echo "Gmail SMTP Configuration:"
read -p "Your Gmail address: " SMTP_USER
read -sp "Gmail App Password (16 chars): " SMTP_PASSWORD
echo ""

# Remove old SMTP config
sed -i '/^SMTP_/d' "$ENV_FILE"

# Add new SMTP config
cat >> "$ENV_FILE" << EOF

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=$SMTP_USER
SMTP_PASSWORD=$SMTP_PASSWORD
SMTP_FROM_EMAIL=noreply@elysianretreat.com
SMTP_FROM_NAME=Elysian Retreat
SMTP_USE_TLS=true
EOF

# Set permissions
chmod 600 "$ENV_FILE"
chown www-data:www-data "$ENV_FILE"

echo ""
echo "✅ SMTP configured!"
echo ""

# Restart service
if systemctl restart resort.service 2>/dev/null; then
    echo "✅ Service restarted"
elif systemctl restart resort-backend.service 2>/dev/null; then
    echo "✅ Service restarted"
else
    echo "⚠️  Please restart service manually:"
    echo "   sudo systemctl restart resort.service"
fi

echo ""
echo "Test by creating a booking!"

