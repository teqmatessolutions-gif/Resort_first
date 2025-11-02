# Deploy Changes to Server

## Password provided: `4bE!beciK#deo-_w`

## Quick Deployment Steps

### Option 1: Manual SCP Commands

Run these commands in your terminal, and **enter the password when prompted**:

```powershell
# Deploy Landing Page Files
scp landingpage/index.html root@139.84.211.200:/var/www/resort/Resort_first/landingpage/

scp landingpage/service-details.html root@139.84.211.200:/var/www/resort/Resort_first/landingpage/

scp landingpage/assets/css/main.css root@139.84.211.200:/var/www/resort/Resort_first/landingpage/assets/css/

# Deploy Dashboard API fix
scp dasboard/src/services/api.js root@139.84.211.200:/var/www/resort/Resort_first/dasboard/src/services/
```

### Option 2: SSH and Pull from Git

Connect to server and pull changes:

```powershell
ssh root@139.84.211.200
```

Enter password: `4bE!beciK#deo-_w`

Then on the server, run:
```bash
cd /var/www/resort/Resort_first
git pull origin main
cd dasboard && npm run build
sudo systemctl restart resort.service
sudo systemctl restart nginx
```

### Option 3: Use WinSCP (Easiest - GUI)

1. Download WinSCP: https://winscp.net/
2. New Session:
   - **Host:** 139.84.211.200
   - **Username:** root
   - **Password:** 4bE!beciK#deo-_w
   - **Protocol:** SFTP
3. Click Login
4. Navigate to `/var/www/resort/Resort_first/landingpage/`
5. Upload files:
   - `landingpage/index.html`
   - `landingpage/service-details.html`  
   - `landingpage/assets/css/main.css`
6. Navigate to `/var/www/resort/Resort_first/dasboard/src/services/`
7. Upload: `dasboard/src/services/api.js`

## After Upload - Build Dashboard on Server

SSH to server and run:
```bash
cd /var/www/resort/Resort_first/dasboard
npm run build
cd ..
sudo systemctl restart resort.service
sudo systemctl restart nginx
```

## Files Changed:
1. ✅ Landing page - Hidden "Our Process" button
2. ✅ Landing page - Enhanced callback modal with Gmail
3. ✅ Landing page - Fixed spelling
4. ✅ Dashboard - Fixed API baseURL

## Test After Deployment:
Visit https://www.teqmates.com and verify changes are live!



