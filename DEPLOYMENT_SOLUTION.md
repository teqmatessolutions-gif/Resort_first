# Deployment Solution - SSH Password Auth Failed

## Issue
SSH password authentication is being rejected: `Permission denied (publickey,password)`

This means:
- Password might be incorrect
- Root login via password may be disabled
- Security restriction (too many failed attempts)
- Server only accepts SSH keys

## 🎯 BEST SOLUTION: Use Hosting Provider Console

### If Hosted on Vultr:

1. **Go to Vultr Console:**
   - Visit: https://my.vultr.com/
   - Log in
   - Find server: 139.84.211.200
   - Click "View Console"

2. **Access Web Console:**
   - Browser-based terminal opens
   - Already authenticated
   - No password needed

3. **Run These Commands:**
```bash
cd /var/www/resort/Resort_first
git pull origin main
cd dasboard && npm run build
cd ..
sudo systemctl restart resort.service
sudo systemctl restart nginx
```

### Alternative: File Manager Upload

If console not available, use File Manager:

1. Open hosting control panel
2. File Manager → Navigate to `/var/www/resort/Resort_first/landingpage/`
3. Upload files manually

## 📋 Files to Deploy

### Landing Page Files:
- `landingpage/index.html`
- `landingpage/service-details.html`  
- `landingpage/assets/css/main.css`

### Dashboard Fix:
- `dasboard/src/services/api.js` (for rebuild)

## ✅ What Changed

1. **Landing page:**
   - ✅ Hidden "Our Process" video button
   - ✅ Enhanced Request Call Back modal (gradient design)
   - ✅ Fixed contact/callback forms (using Gmail)
   - ✅ Fixed spelling in service-details

2. **Dashboard:**
   - ✅ Fixed API baseURL (added `/api` prefix)
   - ✅ Now connects to: `http://localhost:8000/api`

## 🚀 Quick Deploy Commands (If Console Access)

```bash
# SSH via console or hosting panel terminal
ssh root@localhost

# Or run directly if in web console:
cd /var/www/resort/Resort_first
git pull origin main

# Rebuild dashboard
cd dasboard
npm run build

# Restart services  
sudo systemctl restart resort.service
sudo systemctl restart nginx

# Done!
```

## Need Help?

**If you need:**
- Console access credentials
- File manager access
- Another deployment method
- Reset SSH access

**Contact:**
- Hosting provider support
- Server administrator
- Check hosting dashboard for "Console" or "Web Terminal" option



