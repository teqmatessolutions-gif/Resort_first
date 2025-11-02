# 🚀 Deploy All Changes to Production

This guide will help you deploy all the latest fixes and improvements to the production server.

## Changes to Deploy

### Backend Changes
✅ Fixed 500 errors in `/api/bookings/guest` endpoint  
✅ Fixed 500 errors in `/api/packages/book/guest` endpoint  
✅ Added comprehensive error handling  
✅ Added race condition handling in user creation  
✅ Improved SQLAlchemy query logic  
✅ Added database rollback on errors  

### Frontend Changes
✅ Updated booking sorting (booked → checked-in → checked-out)  
✅ Verified status filter functionality  

## Quick Deployment Steps

### Step 1: Deploy Backend (Server)

**Connect to server:**
```bash
ssh root@139.84.211.200
```

**Deploy backend changes:**
```bash
cd /var/www/resort/Resort_first
git pull origin main
sudo systemctl restart resort.service
sudo systemctl status resort.service
```

**Or use the deployment script:**
```bash
cd /var/www/resort/Resort_first
chmod +x deploy_fix_500.sh
./deploy_fix_500.sh
```

### Step 2: Deploy Frontend (Server)

**Deploy dashboard changes:**
```bash
cd /var/www/resort/Resort_first/dasboard
npm run build
sudo cp -r build/* /var/www/resort/dashboard/
```

**Restart nginx (if needed):**
```bash
sudo systemctl restart nginx
```

## Full Deployment Command

**One-line deployment:**
```bash
ssh root@139.84.211.200 "cd /var/www/resort/Resort_first && git pull origin main && sudo systemctl restart resort.service && cd dasboard && npm run build && sudo cp -r build/* /var/www/resort/dashboard/"
```

## Verification Steps

### 1. Check Backend is Running
```bash
sudo systemctl status resort.service
curl http://localhost:8000/api/bookings
```

### 2. Test Bookings
- Go to https://www.teqmates.com/resort/
- Try creating a **room booking** → Should work without 500 error
- Try creating a **package booking** → Should work without 500 error

### 3. Check Dashboard
- Go to https://www.teqmates.com/admin
- Navigate to **Bookings** page
- Verify bookings are sorted: **Booked** → **Checked-in** → **Checked-out**
- Test status filter → Should work correctly

### 4. Monitor Logs
```bash
sudo journalctl -u resort.service -f
```

## Troubleshooting

### If Backend Won't Start
```bash
# Check for syntax errors
cd /var/www/resort/Resort_first/ResortApp
python3 -m py_compile app/api/booking.py
python3 -m py_compile app/curd/packages.py

# Check logs
sudo journalctl -u resort.service -n 100 --no-pager | grep -i error
```

### If Frontend Build Fails
```bash
cd /var/www/resort/Resort_first/dasboard
npm install
npm run build
```

### If 500 Errors Persist
```bash
# Get detailed error from logs
sudo journalctl -u resort.service -n 200 --no-pager | grep -A 30 "Error in"
```

## What's Fixed

✅ Room booking endpoint returns proper errors instead of 500  
✅ Package booking endpoint returns proper errors instead of 500  
✅ Bookings page shows correct status order  
✅ Status filter works correctly  
✅ All filters work together properly  

---

**Status**: Ready for deployment  
**Date**: After all fixes implementation  

