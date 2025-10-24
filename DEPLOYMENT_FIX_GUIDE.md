# TeqMates Resort Management System - Deployment Fix Guide

## Issues Identified and Solutions

### Problem Summary
Your deployment has the following issues:
1. **Dashboard shows blank page** - API calls are pointing to localhost instead of production domain
2. **Userend shows "Failed to load resort data"** - Same API configuration issue
3. **Frontend applications need to be built for production**

## Step-by-Step Fix

### Step 1: Fix API Configuration (Already Done)

I've already fixed the API configuration in your frontend applications:

#### Dashboard (`dasboard/src/services/api.js`)
- ✅ Updated to use production domain when `NODE_ENV=production`
- ✅ Falls back to localhost for development

#### Userend (`userend/userend/src/services/api.js`)
- ✅ Updated to use production domain when `NODE_ENV=production`
- ✅ Falls back to localhost for development

#### Userend App.js
- ✅ Updated all API calls to use production domain
- ✅ Fixed image URLs to use production domain
- ✅ Added `/api/` prefix to all API endpoints

### Step 2: Build Frontend Applications

Run the deployment script I created:

```bash
# Make the script executable
chmod +x deploy_frontend.sh

# Run the deployment script
./deploy_frontend.sh
```

This script will:
- Install dependencies for both applications
- Build both applications for production
- Set proper permissions
- Verify the builds

### Step 3: Manual Build (Alternative)

If the script doesn't work, build manually:

#### Build Dashboard:
```bash
cd dasboard
npm install
NODE_ENV=production npm run build
```

#### Build Userend:
```bash
cd userend/userend
npm install
NODE_ENV=production npm run build
```

### Step 4: Restart Services

After building, restart your services:

```bash
# Restart FastAPI backend
sudo systemctl restart resort.service

# Restart Nginx
sudo systemctl restart nginx

# Check service status
sudo systemctl status resort.service
sudo systemctl status nginx
```

### Step 5: Verify Deployment

Test your applications:

1. **Landing Page**: https://www.teqmates.com
2. **Dashboard**: https://www.teqmates.com/admin
3. **User Interface**: https://www.teqmates.com/resort

## Troubleshooting

### If Dashboard Still Shows Blank Page

1. Check browser console for errors:
   - Open Developer Tools (F12)
   - Look for network errors or JavaScript errors

2. Check if build files exist:
   ```bash
   ls -la dasboard/build/
   ```

3. Check Nginx configuration:
   ```bash
   sudo nginx -t
   ```

### If Userend Still Shows "Failed to load resort data"

1. Check if backend is running:
   ```bash
   curl https://www.teqmates.com/health
   ```

2. Check API endpoints:
   ```bash
   curl https://www.teqmates.com/api/rooms/
   ```

3. Check backend logs:
   ```bash
   sudo journalctl -u resort.service -f
   ```

### Common Issues and Solutions

#### Issue: "Module not found" errors during build
**Solution**: Run `npm install` in the application directory

#### Issue: Build fails with permission errors
**Solution**: 
```bash
sudo chown -R $USER:$USER dasboard/
sudo chown -R $USER:$USER userend/
```

#### Issue: Nginx 404 errors
**Solution**: Check Nginx configuration and restart:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

#### Issue: API calls return 404
**Solution**: Verify API endpoints exist in your FastAPI backend

## File Structure After Fix

```
/var/www/resort/Resort_first/
├── dasboard/
│   ├── build/                    # ✅ Built React app
│   │   ├── index.html
│   │   └── static/
│   └── src/
│       └── services/
│           └── api.js            # ✅ Fixed API configuration
├── userend/
│   └── userend/
│       ├── build/                # ✅ Built React app
│       │   ├── index.html
│       │   └── static/
│       └── src/
│           ├── App.js            # ✅ Fixed API calls
│           └── services/
│               └── api.js        # ✅ Fixed API configuration
└── ResortApp/
    └── main.py                   # ✅ Backend with proper routing
```

## Environment Variables

The applications now automatically detect the environment:

- **Development**: Uses `http://localhost:8000` or `http://127.0.0.1:8000`
- **Production**: Uses `https://www.teqmates.com`

## API Endpoints

All API calls now use the correct endpoints:
- `/api/rooms/` - Get rooms
- `/api/services/` - Get services
- `/api/food-items/` - Get food items
- `/api/packages/` - Get packages
- `/api/bookings/guest` - Create booking
- `/api/food-orders/` - Create food order

## Next Steps

After fixing the deployment:

1. **Test all functionality**:
   - Landing page loads correctly
   - Dashboard loads and shows data
   - User interface loads and shows data
   - Booking forms work
   - API calls succeed

2. **Monitor logs**:
   ```bash
   sudo journalctl -u resort.service -f
   sudo tail -f /var/log/nginx/resort_access.log
   ```

3. **Set up monitoring** for production

## Support

If you encounter any issues:

1. Check the logs first
2. Verify all services are running
3. Test API endpoints directly
4. Check browser console for errors

The main issue was that your frontend applications were trying to connect to `localhost:8000` instead of your production domain. This has been fixed, and the applications will now work correctly in production.
