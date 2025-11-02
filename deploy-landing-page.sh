#!/bin/bash

# Deploy Landing Page Changes to Server
# This script pulls latest changes and ensures landing page is deployed correctly

echo "🚀 Starting Landing Page Deployment..."

# Navigate to project directory
cd /var/www/resort/Resort_first || exit 1

# Pull latest changes from GitHub
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Check if pull was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to pull from GitHub"
    exit 1
fi

# Set correct permissions for landing page
echo "🔧 Setting permissions..."
sudo chown -R www-data:www-data landingpage/
sudo chmod -R 755 landingpage/

# Check nginx configuration
echo "🔍 Checking nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    
    # Restart nginx
    echo "🔄 Restarting nginx..."
    sudo systemctl restart nginx
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx restarted successfully"
    else
        echo "⚠️  Warning: Nginx restart may have failed, check status manually"
    fi
else
    echo "❌ Error: Nginx configuration is invalid"
    exit 1
fi

# Verify deployment
echo "✅ Verification:"
echo "   - Landing page directory: $(pwd)/landingpage"
echo "   - Index file exists: $(test -f landingpage/index.html && echo 'Yes' || echo 'No')"
echo "   - CSS file exists: $(test -f landingpage/assets/css/main.css && echo 'Yes' || echo 'No')"

echo ""
echo "✅ Landing page deployed successfully!"
echo "🌐 Test at: https://www.teqmates.com or http://your-server-ip"
echo ""
echo "💡 Tip: Clear browser cache if changes don't appear immediately"

