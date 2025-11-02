# Deploy Latest Changes to Server

## Changes to Deploy:
1. ✅ Updated all API endpoints to use pagination (default limit: 20)
2. ✅ Fixed KPI card calculations in Dashboard
3. ✅ Improved infinite scroll for instant loading (no delays)

## Deployment Steps:

### 1. Pull Latest Changes on Server
```bash
cd /var/www/resort/Resort_first
git pull origin main
```

### 2. Build Frontend Dashboard
```bash
cd dasboard
npm install --legacy-peer-deps
npm run build
```

### 3. Copy Build Files
```bash
# Ensure directory exists
sudo mkdir -p /var/www/resort/dashboard/

# Copy build files
sudo cp -r build/* /var/www/resort/dashboard/

# Set correct permissions
sudo chown -R www-data:www-data /var/www/resort/dashboard/
sudo chmod -R 755 /var/www/resort/dashboard/
```

### 4. Restart Backend Service
```bash
cd /var/www/resort/Resort_first/ResortApp
sudo systemctl restart resort.service
```

### 5. Verify Service Status
```bash
# Check if service is running
sudo systemctl status resort.service

# Verify API is responding
curl http://localhost:8000/api/bookings?skip=0&limit=20

# Should return JSON with bookings array (up to 20 items)
```

## Quick Deploy Script (Run on Server)

```bash
#!/bin/bash
cd /var/www/resort/Resort_first
git pull origin main

cd dasboard
npm install --legacy-peer-deps
npm run build

sudo mkdir -p /var/www/resort/dashboard/
sudo cp -r build/* /var/www/resort/dashboard/
sudo chown -R www-data:www-data /var/www/resort/dashboard/
sudo chmod -R 755 /var/www/resort/dashboard/

cd ../ResortApp
sudo systemctl restart resort.service

echo "✅ Deployment complete!"
echo "Verifying service..."
sleep 2
sudo systemctl status resort.service --no-pager -l | head -10
```

## Verification Checklist:
- [ ] Frontend builds successfully
- [ ] Build files copied to `/var/www/resort/dashboard/`
- [ ] Backend service restarted successfully
- [ ] API endpoints return paginated results (max 20 items)
- [ ] Infinite scroll works smoothly on Bookings, Billing, Expenses pages
- [ ] Dashboard KPI cards show correct values

## Rollback (If Needed):
```bash
cd /var/www/resort/Resort_first
git reset --hard HEAD~1  # Go back one commit
git pull origin main     # Pull previous version
# Then repeat build and deployment steps
```

