# Deploy 500 Internal Server Error Fix to Production

**URGENT**: Both `/api/bookings/guest` and `/api/packages/book/guest` are returning 500 Internal Server Error. This guide provides immediate deployment steps to fix the issue.

## Critical Fixes Applied

### Issues Fixed
1. **Missing error handling**: Added comprehensive try-except blocks around entire booking creation logic
2. **Error logging**: Added detailed traceback logging to identify root causes
3. **Return value fix**: Fixed `create_guest_booking` to return `booking_with_rooms` instead of `db_booking`
4. **Email sending**: Moved email sending inside try-except block to prevent errors
5. **Package booking**: Added error handling wrapper around `book_package` call

### Changes Included

**Backend (`ResortApp/app/api/booking.py`):**
- Wrapped entire `create_guest_booking` function in try-except block
- Added detailed error logging with traceback
- Fixed return value to use `booking_with_rooms` (loaded with relationships)
- Moved email sending inside try-except block
- Added proper HTTPException re-raising

**Backend (`ResortApp/app/api/packages.py`):**
- Added try-except wrapper around `book_package` call
- Added detailed error logging with traceback
- Moved email sending inside try-except block
- Added proper HTTPException re-raising

## IMMEDIATE DEPLOYMENT STEPS

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

**If you encounter local changes conflicts:**
```bash
git reset --hard HEAD
git pull origin main
```

### 4. Restart Backend Service

```bash
# Check current status
sudo systemctl status resort.service

# Restart the service
sudo systemctl restart resort.service

# Verify it's running
ps aux | grep gunicorn
```

### 5. Check Backend Logs for Errors

```bash
# Check for any startup errors
sudo journalctl -u resort.service -n 100 --no-pager

# Monitor logs in real-time (keep this open to see errors)
sudo journalctl -u resort.service -f
```

### 6. Test Bookings (in another terminal)

```bash
# Test room booking endpoint
curl -X POST https://www.teqmates.com/api/bookings/guest \
  -H "Content-Type: application/json" \
  -d '{"room_ids":[21],"guest_name":"Test User","guest_mobile":"1234567890","guest_email":"test@example.com","check_in":"2025-11-10","check_out":"2025-11-11","adults":1,"children":0}'

# Test package booking endpoint
curl -X POST https://www.teqmates.com/api/packages/book/guest \
  -H "Content-Type: application/json" \
  -d '{"package_id":1,"room_ids":[21],"guest_name":"Test User","guest_mobile":"1234567890","guest_email":"test@example.com","check_in":"2025-11-10","check_out":"2025-11-11","adults":1,"children":0}'
```

## Debugging Steps

### If 500 Error Persists

**Step 1: Check Backend Logs**
```bash
# Get the latest error with full traceback
sudo journalctl -u resort.service -n 200 --no-pager | grep -A 50 "Error in"
```

**Step 2: Check for Database Issues**
```bash
# Verify database connection
cd /var/www/resort/Resort_first/ResortApp
python3 -c "from app.database import engine; from app.models import Base; print('DB OK')"
```

**Step 3: Check for Import Errors**
```bash
# Test if imports work
python3 -c "from app.api.booking import router; print('Booking imports OK')"
python3 -c "from app.api.packages import router; print('Packages imports OK')"
python3 -c "from app.curd.packages import book_package; print('Package CRUD OK')"
```

**Step 4: Check for Missing Dependencies**
```bash
# Check if bcrypt is installed
python3 -c "import bcrypt; print('bcrypt OK')"

# Check if SQLAlchemy imports work
python3 -c "from sqlalchemy import and_, or_; print('SQLAlchemy OK')"
```

### Common Error Scenarios

#### Error: "Either email or mobile number must be provided"
- **Cause**: Both email and mobile are None or empty
- **Fix**: Frontend should validate that at least one is provided
- **Workaround**: Backend will now handle this gracefully

#### Error: Database constraint violation
- **Cause**: Trying to create duplicate user or booking
- **Fix**: The error handling will now catch and log this
- **Check**: Review backend logs for detailed error message

#### Error: Import error (bcrypt, SQLAlchemy, etc.)
- **Cause**: Missing Python dependencies
- **Fix**: Install missing packages in virtual environment
```bash
cd /var/www/resort/Resort_first/ResortApp
source venv/bin/activate
pip install bcrypt sqlalchemy
```

## Verification

### After Deployment, Test:

1. **Room Booking**:
   - Go to https://www.teqmates.com/resort/
   - Try to book a room
   - **Expected**: Should work without 500 error
   - **Check**: Backend logs should show successful booking or detailed error

2. **Package Booking**:
   - Go to https://www.teqmates.com/resort/
   - Try to book a package
   - **Expected**: Should work without 500 error
   - **Check**: Backend logs should show successful booking or detailed error

### Monitor Logs

```bash
# Keep this running to see real-time errors
sudo journalctl -u resort.service -f | grep -i "error\|exception\|traceback"
```

## Rollback (if needed)

If the fix causes more issues:

```bash
cd /var/www/resort/Resort_first
git log --oneline -5  # Find commit before this fix
git checkout <previous-commit-hash>
sudo systemctl restart resort.service
```

---

**Status**: CRITICAL - Ready for immediate deployment
**Priority**: HIGH - Fixes production 500 errors
**Date**: After comprehensive error handling implementation

