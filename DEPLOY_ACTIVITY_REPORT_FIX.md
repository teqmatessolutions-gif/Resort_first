# Deploy Activity Report Fix to Production

This guide will help you deploy the fix for the Activity Report error when viewing full details without dates.

## Issue Fixed

**Problem**: When trying to view the Activity Report for a user without selecting dates, the frontend was sending empty string values for `from_date` and `to_date`, which caused parsing errors on the backend.

**Solution**: Modified the frontend to only include date parameters in the API request if they have actual values. Empty date fields are now omitted from the request, allowing the backend to return all activities for the user.

## Changes Included

### Frontend Changes
- **dasboard/src/pages/EmployeeManagement.jsx**: 
  - Updated `handleFetchHistory` function to conditionally include date parameters
  - Only sends `from_date` and `to_date` if they have non-empty values
  - Allows viewing full activity report without date filters

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

### 5. Copy Build Files

```bash
# Ensure directory exists
sudo mkdir -p /var/www/resort/dashboard/

# Copy build files
sudo cp -r build/* /var/www/resort/dashboard/

# Set correct permissions
sudo chown -R www-data:www-data /var/www/resort/dashboard/
sudo chmod -R 755 /var/www/resort/dashboard/
```

### 6. Verify Deployment

Test the Activity Report feature:
1. Navigate to Employee Management → Activity Report
2. Select a user
3. Try viewing the report without selecting dates (should work now)
4. Try viewing with date filters (should still work)

```bash
# Check frontend build
ls -la /var/www/resort/dashboard/

# Check backend is still running
sudo systemctl status resort.service
```

## Testing

### Test Case 1: View Activity Report Without Dates
1. Go to Employee Management → Activity Report tab
2. Select a user from the dropdown
3. Leave date fields empty
4. Click "Get Activity Report"
5. **Expected**: Should display all activities for the user without errors

### Test Case 2: View Activity Report With Dates
1. Select a user
2. Enter "From" and "To" dates
3. Click "Get Activity Report"
4. **Expected**: Should display filtered activities for the date range

### Test Case 3: View Activity Report With Only From Date
1. Select a user
2. Enter only "From" date
3. Click "Get Activity Report"
4. **Expected**: Should display all activities from the specified date onwards

## Troubleshooting

### If Build Fails

```bash
# Check for dependency issues
cd /var/www/resort/Resort_first/dasboard
npm install --legacy-peer-deps --force

# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

### If Activity Report Still Shows Errors

1. Check browser console for JavaScript errors
2. Check backend logs:
   ```bash
   sudo journalctl -u resort.service -n 50 --no-pager
   ```
3. Verify the API endpoint is accessible:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/reports/user-history?user_id=1
   ```

### If Frontend Not Loading

```bash
# Check Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## Rollback (if needed)

If you need to rollback:

```bash
cd /var/www/resort/Resort_first
git log --oneline -5  # Find the commit before this fix
git checkout <previous-commit-hash>
cd dasboard
npm run build
sudo cp -r build/* /var/www/resort/dashboard/
sudo chown -R www-data:www-data /var/www/resort/dashboard/
sudo chmod -R 755 /var/www/resort/dashboard/
```

---

**Status**: Ready for production deployment
**Date**: After Activity Report fix implementation

