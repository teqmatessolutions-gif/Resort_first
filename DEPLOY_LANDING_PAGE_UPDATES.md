# Deploy Landing Page Updates to Server

## Changes to Deploy:
1. ✅ Improved hero section readability (larger fonts, better spacing)
2. ✅ Try App button placed after Get Started button
3. ✅ Removed background color from Try App button (transparent with border)
4. ✅ Improved CTA section readability (larger fonts, better contrast)
5. ✅ Changed CTA section background to match landing page (white background)

## Server Deployment Steps:

### Option 1: Quick One-Command Deployment
```bash
cd /var/www/resort/Resort_first && git pull origin main && sudo chown -R www-data:www-data landingpage/ && sudo chmod -R 755 landingpage/ && sudo systemctl restart nginx && echo "✅ Landing page deployed successfully!"
```

### Option 2: Step-by-Step Deployment
```bash
# 1. Navigate to project directory
cd /var/www/resort/Resort_first

# 2. Pull latest changes from GitHub
git pull origin main

# 3. Verify files are updated
ls -la landingpage/index.html
ls -la landingpage/assets/css/main.css

# 4. Set correct permissions
sudo chown -R www-data:www-data landingpage/
sudo chmod -R 755 landingpage/

# 5. Test nginx configuration
sudo nginx -t

# 6. Restart nginx
sudo systemctl restart nginx

# 7. Check nginx status
sudo systemctl status nginx

# 8. Verify deployment
curl -I http://localhost
# OR check the actual domain
curl -I https://www.teqmates.com
```

### Option 3: Use Deployment Script
```bash
cd /var/www/resort/Resort_first
chmod +x deploy-landing-page.sh
sudo ./deploy-landing-page.sh
```

## Files Modified:
- `landingpage/index.html` - Hero section and CTA section improvements
- `landingpage/assets/css/main.css` - Typography and styling improvements

## Verification Checklist:
- [ ] Landing page loads correctly
- [ ] Hero section heading is larger and more readable
- [ ] "Try App" button appears after "Get Started" button in header
- [ ] "Try App" button has transparent background with green border
- [ ] "Try Resort App" button in hero has transparent background with green border
- [ ] CTA section has white background (matches landing page)
- [ ] CTA section text is larger and more readable
- [ ] All buttons work correctly
- [ ] Card previews show Admin and Guest portal options

## Troubleshooting:

### If changes don't appear:
```bash
# Clear browser cache or use incognito mode
# Or add cache-busting query string: ?v=3

# Clear nginx cache if using caching
sudo rm -rf /var/cache/nginx/*
sudo systemctl restart nginx
```

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

### Check nginx error logs if needed:
```bash
sudo tail -f /var/log/nginx/error.log
```

