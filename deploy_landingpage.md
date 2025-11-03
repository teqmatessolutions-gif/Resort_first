# Landing Page Deployment Commands

Run these commands from the project root directory:

## 1. Copy CSS file
```bash
scp -o StrictHostKeyChecking=no landingpage/assets/css/main.css root@139.84.211.200:/var/www/resort/Resort_first/landingpage/assets/css/
```

## 2. Copy index.html
```bash
scp -o StrictHostKeyChecking=no landingpage/index.html root@139.84.211.200:/var/www/resort/Resort_first/landingpage/
```

## 3. Copy service-details.html
```bash
scp -o StrictHostKeyChecking=no landingpage/service-details.html root@139.84.211.200:/var/www/resort/Resort_first/landingpage/
```

**Note:** You'll be prompted for the root password each time. Or use all 3 files in one command:

```bash
scp -o StrictHostKeyChecking=no landingpage/assets/css/main.css landingpage/index.html landingpage/service-details.html root@139.84.211.200:/var/www/resort/Resort_first/landingpage/
```

## Alternative: Use WinSCP or FileZilla
If you prefer a GUI:
- Host: 139.84.211.200
- Username: root
- Protocol: SFTP
- Navigate to: /var/www/resort/Resort_first/landingpage/

## Changes Summary:
✅ Hidden "Our Process" button
✅ Fixed callback forms (using Gmail instead of PHP)
✅ Enhanced Request Call Back modal with beautiful design
✅ Fixed spelling "Serices" → "Services"

