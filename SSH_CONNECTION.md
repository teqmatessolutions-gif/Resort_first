# SSH Connection Guide

## To Connect to Server:

Run this command and enter your **root password** when prompted:
```powershell
ssh root@139.84.211.200
```

## Once Connected, You Can:

### 1. Navigate to Project Directory
```bash
cd /var/www/resort/Resort_first
```

### 2. Check Current Files
```bash
ls -la landingpage/
```

### 3. Pull Latest Changes from Git
```bash
git pull origin main
```

### 4. Or Manually Deploy Files

If git pull doesn't work, you can manually copy files:

```bash
# Navigate to landingpage directory
cd /var/www/resort/Resort_first/landingpage

# Edit files directly or use wget to download from GitHub
wget https://raw.githubusercontent.com/teqmatessolutions-gif/Resort_first/main/landingpage/index.html
wget https://raw.githubusercontent.com/teqmatessolutions-gif/Resort_first/main/landingpage/service-details.html
wget https://raw.githubusercontent.com/teqmatessolutions-gif/Resort_first/main/landingpage/assets/css/main.css -P assets/css/
```

### 5. Check Service Status
```bash
# Check if web server is running
systemctl status nginx
systemctl status resort.service

# Restart services if needed
sudo systemctl restart resort.service
sudo systemctl restart nginx
```

### 6. View Recent Logs
```bash
# View application logs
sudo journalctl -u resort.service -n 50

# View nginx error logs
tail -f /var/log/nginx/error.log
```

## Alternative: Use PuTTY (Windows)

If PowerShell SSH doesn't work:

1. Download PuTTY: https://www.putty.org/
2. Enter:
   - Host: 139.84.211.200
   - Port: 22
   - Connection type: SSH
3. Click Open
4. Enter username: root
5. Enter password when prompted

## Server Information:
- **IP:** 139.84.211.200
- **Domain:** www.teqmates.com
- **Username:** root
- **Project Path:** /var/www/resort/Resort_first
- **Landing Page Path:** /var/www/resort/Resort_first/landingpage

