# Alternative Deployment Methods

## SSH Password Failed - Try These Solutions:

### Solution 1: Use Hosting Control Panel

1. Log in to your hosting control panel (cPanel/DirectAdmin)
2. Open **File Manager**
3. Navigate to: `/var/www/resort/Resort_first/landingpage/`
4. Upload these files:
   - Upload `landingpage/index.html`
   - Upload `landingpage/service-details.html`
   - Upload `landingpage/assets/css/main.css` to `assets/css/`

### Solution 2: Use WinSCP (GUI)

1. Download: https://winscp.net/
2. Connect to:
   - **Host:** 139.84.211.200
   - **Username:** root
   - **Password:** 4bE!beciK#deo-_w
   - **Protocol:** SFTP
3. Navigate to `/var/www/resort/Resort_first/landingpage/`
4. Upload files

### Solution 3: Reset SSH Access

Contact your hosting provider to:
- Reset root password
- Enable SSH key authentication
- Check if SSH is enabled for your account

### Solution 4: Server Console Access

If you have server console access (Vultr/AWS/etc):
1. Log in via browser console
2. Run commands directly

```bash
cd /var/www/resort/Resort_first
git pull origin main
cd dasboard && npm run build
sudo systemctl restart resort.service
sudo systemctl restart nginx
```

### Solution 5: Verify Password

The password contains special characters that might need escaping:
Password: `4bE!beciK#deo-_w`

Special characters: `!` `#` `-` `_`

When typing in terminal, try:
- Double-quote the password: `"4bE!beciK#deo-_w"`
- Or escape special chars: `4bE\!beciK\#deo-_w`

## Immediate Action Required

Since SSH is not working, **use the hosting control panel** (cPanel/File Manager) to upload files manually. This is the most reliable method.



