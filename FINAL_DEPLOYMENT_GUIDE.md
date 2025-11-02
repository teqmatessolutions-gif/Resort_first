# Final Deployment Guide - All Changes Ready

## Current Status ✅

**All changes are committed locally** and ready to deploy:
1. ✅ Landing page - Hidden "Our Process" button
2. ✅ Landing page - Enhanced Request Call Back modal  
3. ✅ Landing page - Fixed callback/contact forms (Gmail integration)
4. ✅ Landing page - Fixed spelling "Serices" → "Services"
5. ✅ Dashboard - Fixed API baseURL (added `/api` prefix)

## Problem: SSH Authentication Failing

The password provided is not being accepted by the server.

## Solution: Use Git-Based Deployment

Since direct SSH isn't working, the best approach is:

### Step 1: Push Changes to GitHub

```powershell
# First, let's try to push to GitHub
git remote -v
git push origin main
```

If that works, files will be on GitHub.

### Step 2: Pull on Server via Hosting Console

1. Log in to your hosting provider (Vultr, etc.)
2. Open **Web Console** or **VNC Console**
3. Click on server IP: **139.84.211.200**
4. Click **"View Console"** or **"Launch Console"**
5. You'll get a browser-based terminal (no password needed!)
6. Run these commands:

```bash
cd /var/www/resort/Resort_first
git pull origin main
cd dasboard && npm run build
cd ..
sudo systemctl restart resort.service
sudo systemctl restart nginx
```

### Step 3: Verify Deployment

Visit **https://www.teqmates.com** and verify:
- ✅ "Our Process" button is hidden
- ✅ Request Call Back modal has beautiful design
- ✅ Contact forms open Gmail when submitted

## Alternative: Manual File Upload

If you have hosting control panel:

1. **Go to hosting panel** (cPanel/File Manager)
2. **Navigate to:** `/var/www/resort/Resort_first/landingpage/`
3. **Upload these 3 files:**
   - `index.html`
   - `service-details.html`
   - `assets/css/main.css`

## Files to Deploy (Location on Your PC)

```
C:\Resort\Resortwithlandingpagenew\Resortwithlandingpage\Resort_first\landingpage\index.html
C:\Resort\Resortwithlandingpagenew\Resortwithlandingpage\Resort_first\landingpage\service-details.html
C:\Resort\Resortwithlandingpagenew\Resortwithlandingpage\Resort_first\landingpage\assets\css\main.css
C:\Resort\Resortwithlandingpagenew\Resortwithlandingpage\Resort_first\dasboard\src\services\api.js
```

## Need Help Finding Console?

**For Vultr:**
- Visit: https://my.vultr.com/
- Click on your server
- Click "View Console"

**For DigitalOcean:**
- Visit: https://cloud.digitalocean.com/
- Click "Console" button in server panel

**For AWS:**
- Visit AWS Console
- Use Systems Manager Session Manager

**For Other Providers:**
- Look for "Console", "Terminal", "Web SSH", or "VNC" in control panel


