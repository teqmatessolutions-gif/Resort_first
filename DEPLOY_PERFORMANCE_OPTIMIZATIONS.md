# Deploy Performance Optimizations to Server

This guide will help you deploy the latest performance optimizations to the production server.

## Changes Included

- **Dashboard.jsx**: Reduced API limits to 500, added React.memo for components
- **Bookings.jsx**: Reduced API limits from 10000 to 500, memoized components
- **Billing.jsx**: Memoized KPI and modal components

## Server Deployment Steps

### 1. Connect to Server

```bash
ssh root@139.84.211.200
```

### 2. Navigate to Project Directory

```bash
cd /var/www/resort/Resort_first
```

### 3. Pull Latest Changes from GitHub

```bash
git pull origin main
```

If you encounter local changes conflicts:
```bash
git reset --hard HEAD
git pull origin main
```

### 4. Build Frontend Dashboard

```bash
cd dasboard
npm install --legacy-peer-deps
npm run build
```

### 5. Copy Build Files to Web Directory

```bash
# Make sure the directory exists
sudo mkdir -p /var/www/resort/dashboard/

# Copy build files
sudo cp -r build/* /var/www/resort/dashboard/

# Set correct permissions
sudo chown -R www-data:www-data /var/www/resort/dashboard/
sudo chmod -R 755 /var/www/resort/dashboard/
```

### 6. Restart Backend Service (if needed)

```bash
# Check service status
sudo systemctl status resort.service

# Restart if needed
sudo systemctl restart resort.service

# Verify it's running
ps aux | grep gunicorn
curl http://localhost:8000/api/bill/active-rooms
```

### 7. Restart Nginx (if needed)

```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

## Verification

1. **Test Dashboard Page**: Visit `https://www.teqmates.com/admin` and check that the dashboard loads faster
2. **Test Bookings Page**: Check that bookings load quickly with pagination
3. **Test Billing Page**: Verify checkout functionality works correctly
4. **Check Browser Console**: Ensure no JavaScript errors
5. **Monitor Performance**: Use browser DevTools Network tab to verify reduced API payload sizes

## Expected Improvements

- **Faster Initial Load**: Reduced API limits mean less data fetched on first load
- **Better Responsiveness**: Memoized components prevent unnecessary re-renders
- **Lower Memory Usage**: Smaller datasets processed on client-side
- **Smoother Scrolling**: Optimized infinite scroll implementation

## Troubleshooting

### If Build Fails

```bash
# Clean and rebuild
cd dasboard
rm -rf node_modules build
npm install --legacy-peer-deps
npm run build
```

### If Service Won't Start

```bash
# Check logs
sudo journalctl -u resort.service -n 50 --no-pager

# Check for syntax errors
cd /var/www/resort/Resort_first/ResortApp
python3 -m py_compile app/api/*.py
```

### If Changes Don't Appear

```bash
# Clear browser cache or do hard refresh
# In browser: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

# Verify files were copied
ls -la /var/www/resort/dashboard/

# Check file timestamps
stat /var/www/resort/dashboard/index.html
```

## Quick Deploy Script

You can also run this as a single command sequence:

```bash
cd /var/www/resort/Resort_first && \
git pull origin main && \
cd dasboard && \
npm install --legacy-peer-deps && \
npm run build && \
sudo mkdir -p /var/www/resort/dashboard/ && \
sudo cp -r build/* /var/www/resort/dashboard/ && \
sudo chown -R www-data:www-data /var/www/resort/dashboard/ && \
sudo chmod -R 755 /var/www/resort/dashboard/ && \
sudo systemctl restart resort.service && \
echo "✅ Deployment complete!"
```

## Notes

- All functionality is preserved - pagination and infinite scroll handle remaining data
- No database changes required
- Backend API endpoints already support pagination with `limit=500`
- Changes are backward compatible

---

**Last Updated**: After performance optimizations deployment
**Status**: Ready for production deployment

