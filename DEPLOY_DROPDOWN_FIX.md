# Deploy Dropdown Visibility Fix to Server

## Changes to Deploy:
- Fixed dropdown card positioning to ensure full visibility
- Changed dropdown from absolute to fixed positioning
- Added overflow: visible to parent containers
- Increased z-index for proper layering

## Server Deployment Steps:

### Quick One-Command Deployment:
```bash
cd /var/www/resort/Resort_first && git reset --hard HEAD && git pull origin main && sudo chown -R www-data:www-data landingpage/ && sudo chmod -R 755 landingpage/ && sudo systemctl restart nginx && echo "✅ Dropdown fix deployed successfully!"
```

### Step-by-Step Deployment:
```bash
# 1. Navigate to project directory
cd /var/www/resort/Resort_first

# 2. Discard local changes (if any)
git reset --hard HEAD

# 3. Pull latest changes from GitHub
git pull origin main

# 4. Set correct permissions
sudo chown -R www-data:www-data landingpage/
sudo chmod -R 755 landingpage/

# 5. Test nginx configuration
sudo nginx -t

# 6. Restart nginx
sudo systemctl restart nginx

# 7. Verify deployment
sudo systemctl status nginx
```

## Verification Checklist:
- [ ] Landing page loads correctly
- [ ] Click "Try Resort App" button in hero section
- [ ] Dropdown card appears fully visible
- [ ] Both "Admin Dashboard" and "Guest Portal" buttons are fully visible
- [ ] No buttons are cut off or partially hidden
- [ ] Dropdown positions correctly on different screen sizes
- [ ] Dropdown closes when clicking outside

## Files Modified:
- `landingpage/index.html` - Fixed dropdown positioning and overflow
- `landingpage/assets/css/main.css` - Added overflow: visible rules

## Troubleshooting:

If dropdown is still partially visible:
```bash
# Clear browser cache or use incognito mode
# Check browser console for JavaScript errors
# Verify files were updated: ls -la landingpage/index.html
```

If nginx config points to different location:
```bash
# Check nginx configuration
sudo nano /etc/nginx/sites-available/default
# OR
sudo nano /etc/nginx/sites-available/teqmates.com

# Look for root directive and copy files to that location if needed
```

