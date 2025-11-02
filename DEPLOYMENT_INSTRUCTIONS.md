# Landing Page Deployment Instructions

## ✅ Changes Ready for Deployment

All changes have been committed to your local Git repository:

**Files Modified:**
1. ✅ `landingpage/assets/css/main.css` - Hide "Our Process" button
2. ✅ `landingpage/index.html` - Fixed callback forms, enhanced modal, Gmail integration
3. ✅ `landingpage/service-details.html` - Fixed spelling "Serices" → "Services"

## 🚀 Deployment Methods

### Method 1: Manual SCP (Requires Server Password)

Run these commands in PowerShell and enter your **root password** when prompted:

```powershell
# Copy CSS file
scp landingpage/assets/css/main.css root@139.84.211.200:/var/www/resort/Resort_first/landingpage/assets/css/

# Copy HTML files  
scp landingpage/index.html root@139.84.211.200:/var/www/resort/Resort_first/landingpage/

scp landingpage/service-details.html root@139.84.211.200:/var/www/resort/Resort_first/landingpage/
```

### Method 2: Use WinSCP (Recommended - Easy GUI)

1. Download WinSCP: https://winscp.net/
2. Connect with these settings:
   - **Host:** 139.84.211.200
   - **Username:** root  
   - **Password:** [your server password]
   - **Protocol:** SFTP
3. Navigate to: `/var/www/resort/Resort_first/landingpage/`
4. Upload the 3 files:
   - Upload `main.css` to `assets/css/` folder
   - Upload `index.html` to root
   - Upload `service-details.html` to root

### Method 3: Hosting Control Panel (If Available)

1. Log in to cPanel/Plesk/DirectAdmin
2. Open **File Manager**
3. Navigate to `/var/www/resort/Resort_first/landingpage/`
4. Upload files via the web interface

### Method 4: Server Console Access

If you have console/terminal access to the server:

```bash
# SSH to server (via hosting panel console)
cd /var/www/resort/Resort_first

# Pull latest changes (if you can push to GitHub first)
git pull origin main

# OR manually copy files if git doesn't work
```

## 📋 Quick File Locations

**Source files on your computer:**
- `C:\Resort\Resortwithlandingpagenew\Resortwithlandingpage\Resort_first\landingpage\assets\css\main.css`
- `C:\Resort\Resortwithlandingpagenew\Resortwithlandingpage\Resort_first\landingpage\index.html`
- `C:\Resort\Resortwithlandingpagenew\Resortwithlandingpage\Resort_first\landingpage\service-details.html`

**Destination on server:**
- `/var/www/resort/Resort_first/landingpage/assets/css/main.css`
- `/var/www/resort/Resort_first/landingpage/index.html`
- `/var/www/resort/Resort_first/landingpage/service-details.html`

## ✨ What Changed?

1. **Hidden Process Button** - "Our Process" video button is now hidden
2. **Fixed Forms** - Request Call Back and Contact forms now use Gmail instead of PHP
3. **Beautiful Modal** - Request Call Back modal has gradient design with emojis
4. **Fixed Spelling** - "Serices List" corrected to "Services List"

## 🔍 Verify Deployment

After deploying, visit www.teqmates.com and check:
- ✅ "Our Process" button should be hidden
- ✅ Request Call Back modal should have purple gradient header
- ✅ Forms should open Gmail when submitted
- ✅ Service details page should show "Services List" (not "Serices List")

## 💡 Need Help?

If you're having trouble:
1. Try **Method 2 (WinSCP)** - It's the easiest for file uploads
2. Ask someone with server access to pull the git changes
3. Use the hosting control panel if available

