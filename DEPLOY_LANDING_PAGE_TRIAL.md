# Deploy Landing Page with Resort App Trial Option

## Changes Made:
1. ✅ **Header Navigation** - Added "Try App" button next to "Get Started"
2. ✅ **Hero Section** - Added "Try Resort App" button next to "Get Started"
3. ✅ **Services Section** - Added "Resort Management System" service card with trial link
4. ✅ **Dedicated CTA Section** - New prominent section before Contact section
5. ✅ **CSS Styling** - Added hover effects and animations for trial buttons

## Trial Options Added:

### 1. Header Button (Top Right)
- Green gradient button: "Try App"
- Links to: `https://www.teqmates.com/admin`
- Always visible in navigation

### 2. Hero Section Button
- Green gradient button: "Try Resort App"
- Appears below the main "Get Started" button
- Links to: `https://www.teqmates.com/admin`

### 3. Service Card (Services Section)
- Highlighted "Resort Management System" card
- Green border and styling to stand out
- Direct "Try Free Trial" link
- Describes all features

### 4. Dedicated CTA Section
- Full-width green gradient background section
- White card with prominent call-to-action
- "Start Free Trial Now" primary button
- "Request Demo" secondary button
- Trust indicators: "No credit card required • Free for 30 days • Full feature access"

## Deployment Steps:

### On Server:
```bash
# 1. Pull latest changes
cd /var/www/resort/Resort_first
git pull origin main

# 2. The landing page is static HTML, so just verify it's accessible
# Check if files are in the correct location for nginx/web server

# 3. Restart web server if needed
sudo systemctl restart nginx
# OR
sudo systemctl restart apache2
```

### If Landing Page is Served by Nginx:
```bash
# Landing page is typically served from:
# /var/www/resort/landingpage/ or similar
# Check nginx config:
sudo nano /etc/nginx/sites-available/default
# Or verify the path is correct
```

## Verification Checklist:
- [ ] "Try App" button visible in header navigation
- [ ] "Try Resort App" button visible in hero section
- [ ] Resort Management System card visible in Services section
- [ ] Dedicated CTA section appears before Contact section
- [ ] All buttons link to `https://www.teqmates.com/admin`
- [ ] Buttons open in new tab (`target="_blank"`)
- [ ] Hover effects work on trial buttons

## Files Modified:
- `landingpage/index.html` - Added trial buttons and CTA section
- `landingpage/assets/css/main.css` - Added button hover effects

All changes have been committed and pushed to GitHub.

