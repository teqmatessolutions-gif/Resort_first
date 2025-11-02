# How to Connect to Server

## Server Information
- **IP Address:** 139.84.211.200
- **Domain:** www.teqmates.com
- **Username:** root
- **SSH Port:** 22

## Connection Methods

### Method 1: SSH via PowerShell (Requires Password)

Run this command and enter the root password:
```powershell
ssh root@139.84.211.200
```

### Method 2: PuTTY (Recommended - Windows GUI)

1. Download PuTTY: https://www.putty.org/
2. Open PuTTY
3. Enter connection details:
   - **Host Name:** 139.84.211.200
   - **Port:** 22
   - **Connection Type:** SSH
4. Click "Open"
5. When prompted, enter username: `root`
6. Enter password when prompted

### Method 3: WinSCP (For File Transfers)

1. Download WinSCP: https://winscp.net/
2. Connect with:
   - **Host:** 139.84.211.200
   - **Username:** root
   - **Protocol:** SFTP
3. Browse files in GUI
4. Can upload/download files easily

### Method 4: Terminal via cPanel/DirectAdmin

If you have hosting control panel access:
1. Log in to your hosting control panel
2. Look for "Terminal" or "SSH Access"
3. Click to open browser-based terminal

### Method 5: Browser SSH

Some hosting providers offer web-based SSH:
1. Log in to hosting panel
2. Look for "Web Terminal" or "SSH Console"
3. Click to open in browser

## Once Connected - Quick Commands

```bash
# Navigate to project
cd /var/www/resort/Resort_first

# Check git status
git status

# Pull latest changes
git pull origin main

# Check services
systemctl status resort.service
systemctl status nginx

# View logs
tail -f /var/log/nginx/error.log
journalctl -u resort.service -f
```

## Deploy Landing Page Changes

Once connected to server, deploy the landing page fixes we made:

```bash
# Navigate to landing page directory
cd /var/www/resort/Resort_first/landingpage

# Or pull from git
cd /var/www/resort/Resort_first
git pull origin main
```

## Current Changes Ready to Deploy:

1. ✅ `landingpage/assets/css/main.css` - Hidden "Our Process" button
2. ✅ `landingpage/index.html` - Fixed callback forms, enhanced modal
3. ✅ `landingpage/service-details.html` - Fixed spelling
4. ✅ `dasboard/src/services/api.js` - Fixed API baseURL (added /api prefix)

## Don't Have Server Password?

If you don't have the root password:
1. **Contact hosting provider** to reset SSH access
2. **Use hosting control panel** (cPanel/File Manager) to upload files
3. **Ask server administrator** to run git pull on server
4. **Reset password** via hosting provider's dashboard

## Alternative: Use Git Pull on Server

If someone with server access can run:
```bash
ssh root@139.84.211.200
cd /var/www/resort/Resort_first
git pull https://github.com/teqmatessolutions-gif/Resort_first.git main
```



