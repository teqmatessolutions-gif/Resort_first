# Deploy 500 Internal Server Error Fix to Production

This guide will help you deploy the fix for the 500 Internal Server Error in both room and package booking endpoints.

## Issues Fixed

**Problem**: Both `/api/bookings/guest` and `/api/packages/book/guest` were returning 500 Internal Server Error.

**Root Causes**:
1. Missing SQLAlchemy `and_` import causing runtime errors
2. Filter queries not handling None/empty email/mobile values properly
3. Booking creation trying to use unnormalized email/mobile values
4. AttributeError/TypeError when trying to call `.strip()` on None values

**Solution**: 
- Added proper SQLAlchemy imports (`and_`, `or_`)
- Improved email/mobile normalization with try-except blocks
- Fixed filter queries to handle None/empty values using SQLAlchemy `is_(None)` and `== ''`
- Use normalized email/mobile values in Booking/PackageBooking creation
- Added proper fallbacks for guest_name

## Changes Included

### Backend Changes
- **ResortApp/app/api/booking.py**: 
  - Added `from sqlalchemy import and_, or_` import
  - Improved email/mobile normalization with try-except blocks
  - Fixed duplicate booking filter to handle None/empty values
  - Fixed existing booking filter to handle None/empty values
  - Updated Booking creation to use normalized email/mobile values
  - Added guest_name fallback to "Guest User"

- **ResortApp/app/curd/packages.py**:
  - Improved email/mobile normalization with try-except blocks
  - Fixed existing package booking filter to handle None/empty values
  - Updated PackageBooking creation to use normalized email/mobile values
  - Added guest_name fallback to "Guest User"
  - Added proper SQLAlchemy imports

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

### 4. Restart Backend Service

```bash
# Check service status
sudo systemctl status resort.service

# Restart the service
sudo systemctl restart resort.service

# Verify it's running
ps aux | grep gunicorn
curl http://localhost:8000/api/bookings
```

### 5. Check Backend Logs for Errors

```bash
# Check for any startup errors
sudo journalctl -u resort.service -n 50 --no-pager

# Monitor logs in real-time
sudo journalctl -u resort.service -f
```

### 6. Test Bookings

Test both room and package bookings:
1. Try creating a room booking via userend
2. Try creating a package booking via userend
3. Verify both work without 500 errors

## Testing

### Test Case 1: Room Booking with Email Only
1. Create a room booking with email only (no mobile)
2. **Expected**: Should return 200 OK, not 500
3. **Expected**: Booking should be created successfully

### Test Case 2: Room Booking with Mobile Only
1. Create a room booking with mobile only (no email)
2. **Expected**: Should return 200 OK, not 500
3. **Expected**: Booking should be created successfully

### Test Case 3: Room Booking with Both Email and Mobile
1. Create a room booking with both email and mobile
2. **Expected**: Should return 200 OK, not 500
3. **Expected**: Booking should be created successfully

### Test Case 4: Package Booking with Email Only
1. Create a package booking with email only (no mobile)
2. **Expected**: Should return 200 OK, not 500
3. **Expected**: Booking should be created successfully

### Test Case 5: Package Booking with Mobile Only
1. Create a package booking with mobile only (no email)
2. **Expected**: Should return 200 OK, not 500
3. **Expected**: Booking should be created successfully

### Test Case 6: Package Booking with Both Email and Mobile
1. Create a package booking with both email and mobile
2. **Expected**: Should return 200 OK, not 500
3. **Expected**: Booking should be created successfully

## Troubleshooting

### If Backend Service Won't Start

```bash
# Check for Python syntax errors
cd /var/www/resort/Resort_first/ResortApp
python3 -m py_compile app/api/booking.py
python3 -m py_compile app/curd/packages.py

# Check for import errors
python3 -c "from app.api.booking import router; print('OK')"
python3 -c "from app.curd.packages import book_package; print('OK')"
```

### If 500 Error Persists

```bash
# Check backend logs for detailed error messages
sudo journalctl -u resort.service -n 200 --no-pager | grep -i "error\|exception\|traceback"

# Check if there are database connection issues
sudo journalctl -u resort.service -n 100 --no-pager | grep -i "database\|db\|connection"
```

### If SQLAlchemy Errors Occur

```bash
# Verify SQLAlchemy is installed
cd /var/www/resort/Resort_first/ResortApp
source venv/bin/activate
python3 -c "from sqlalchemy import and_, or_; print('SQLAlchemy OK')"

# Check if imports are correct
python3 -c "from app.api.booking import *; print('Imports OK')"
```

### Verify Backend is Running

```bash
# Check service status
sudo systemctl status resort.service

# Check if API is accessible
curl http://localhost:8000/api/bookings
curl http://localhost:8000/api/packages

# Check backend process
ps aux | grep gunicorn
```

## Rollback (if needed)

If you need to rollback:

```bash
cd /var/www/resort/Resort_first
git log --oneline -5  # Find the commit before this fix
git checkout <previous-commit-hash>
sudo systemctl restart resort.service
```

---

**Status**: Ready for production deployment
**Date**: After 500 error fix implementation

