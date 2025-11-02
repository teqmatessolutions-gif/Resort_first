# Deploy Landing Page Trial Button Changes to Server

## Changes to Deploy:
- Trial button with card preview showing Admin and Guest portal options
- Dropdown functionality with animations
- Updated CSS for hover effects and animations

## Server Deployment Steps:

### 1. SSH into Server
```bash
ssh root@139.84.211.200
```

### 2. Navigate to Project Directory
```bash
cd /var/www/resort/Resort_first
```

### 3. Pull Latest Changes from GitHub
```bash
git pull origin main
```

### 4. Copy Landing Page Files
```bash
# Copy landing page files to web server directory
# The exact path depends on your nginx configuration
# Common locations:
# - /var/www/html/ (default nginx)
# - /var/www/resort/landingpage/ (custom)
# - /var/www/resort/Resort_first/landingpage/ (current location)

# Option 1: If landing page is served from project directory
# Just ensure files are in place (git pull should handle this)

# Option 2: If landing page needs to be copied to web root
sudo cp -r landingpage/* /var/www/html/
# OR
sudo cp -r landingpage/* /var/www/resort/landingpage/
```

### 5. Set Correct Permissions
```bash
# Ensure web server can read the files
sudo chown -R www-data:www-data landingpage/
sudo chmod -R 755 landingpage/

# If copied to web root:
# sudo chown -R www-data:www-data /var/www/html/
# sudo chmod -R 755 /var/www/html/
```

### 6. Restart Web Server (if needed)
```bash
# Check nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# OR restart apache if using apache
sudo systemctl restart apache2
```

### 7. Verify Deployment
```bash
# Check if files are updated
ls -la landingpage/index.html

# Check nginx status
sudo systemctl status nginx

# Test the website
curl -I http://localhost
# OR check the actual domain
curl -I https://www.teqmates.com
```

## Quick Deployment Command (All in One):
```bash
cd /var/www/resort/Resort_first && \
git pull origin main && \
sudo chown -R www-data:www-data landingpage/ && \
sudo chmod -R 755 landingpage/ && \
sudo systemctl restart nginx && \
echo "Landing page deployed successfully!"
```

## Troubleshooting:

### If nginx config points to different location:
```bash
# Check nginx configuration
sudo nano /etc/nginx/sites-available/default
# OR
sudo nano /etc/nginx/sites-available/teqmates.com

# Look for root directive and copy files to that location
# Example: root /var/www/resort/landingpage;
# Then: sudo cp -r /var/www/resort/Resort_first/landingpage/* /var/www/resort/landingpage/
```

### If changes don't appear:
```bash
# Clear browser cache or use incognito mode
# Or add cache-busting query string: ?v=2

# Clear nginx cache if using caching
sudo rm -rf /var/cache/nginx/*
sudo systemctl restart nginx
```

## Files Modified:
- `landingpage/index.html` - Added trial dropdown buttons and card previews
- `landingpage/assets/css/main.css` - Added animations and hover effects

