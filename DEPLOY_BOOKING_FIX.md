# Deploy Booking Error Fix to Production

This guide will help you deploy the fix for internal errors in both room and package bookings.

## Issues Fixed

**Problem**: Both room booking and package booking were experiencing internal errors when creating bookings. This was caused by:
1. Empty strings being passed to guest user creation function
2. Database constraint violations when trying to create users with empty strings
3. Missing validation for required identifiers (email or mobile)

**Solution**: 
- Normalize empty strings to None before processing
- Add proper validation for email/mobile in guest user creation
- Handle edge cases where both email and mobile might be None
- Generate unique emails when both identifiers are missing

## Changes Included

### Backend Changes
- **ResortApp/app/api/booking.py**: 
  - Updated `create_booking` to normalize email/mobile before calling `get_or_create_guest_user`
  - Updated `create_guest_booking` to normalize email/mobile before calling `get_or_create_guest_user`
  - Updated `get_or_create_guest_user` to handle empty strings and None values properly
  - Added validation to ensure at least one identifier (email or mobile) is provided
  - Generate unique email if both email and mobile are missing

- **ResortApp/app/curd/packages.py**:
  - Updated `book_package` to normalize email/mobile before calling `get_or_create_guest_user`
  - Updated `get_or_create_guest_user` to handle empty strings and None values properly
  - Added validation to ensure at least one identifier (email or mobile) is provided

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

### 5. Test Bookings

Test both room and package bookings:
1. Try creating a room booking via userend
2. Try creating a package booking via userend
3. Verify both work without internal errors

```bash
# Check backend logs for any errors
sudo journalctl -u resort.service -n 100 --no-pager | grep -i "error\|warning"
```

## Testing

### Test Case 1: Room Booking with Email Only
1. Create a room booking with email only (no mobile)
2. **Expected**: Booking should be created successfully
3. **Expected**: Guest user should be created/linked properly

### Test Case 2: Room Booking with Mobile Only
1. Create a room booking with mobile only (no email)
2. **Expected**: Booking should be created successfully
3. **Expected**: Guest user should be created/linked properly

### Test Case 3: Room Booking with Both Email and Mobile
1. Create a room booking with both email and mobile
2. **Expected**: Booking should be created successfully
3. **Expected**: Guest user should be created/linked properly

### Test Case 4: Package Booking with Email Only
1. Create a package booking with email only (no mobile)
2. **Expected**: Booking should be created successfully
3. **Expected**: Guest user should be created/linked properly

### Test Case 5: Package Booking with Mobile Only
1. Create a package booking with mobile only (no email)
2. **Expected**: Booking should be created successfully
3. **Expected**: Guest user should be created/linked properly

### Test Case 6: Package Booking with Both Email and Mobile
1. Create a package booking with both email and mobile
2. **Expected**: Booking should be created successfully
3. **Expected**: Guest user should be created/linked properly

### Test Case 7: Empty String Handling
1. Create a booking with empty strings for email/mobile (shouldn't happen due to frontend validation, but test backend handling)
2. **Expected**: Backend should normalize empty strings to None
3. **Expected**: Should not cause database errors

## Troubleshooting

### If Bookings Still Fail

```bash
# Check backend logs for detailed error messages
sudo journalctl -u resort.service -n 200 --no-pager | grep -i "error\|exception\|traceback"

# Check database for any constraint violations
# Connect to your database and check for recent errors
```

### If Guest User Creation Fails

```bash
# Check backend logs for guest user creation errors
sudo journalctl -u resort.service -n 100 --no-pager | grep -i "guest user"

# Verify guest role exists in database
# Run: SELECT * FROM roles WHERE name = 'guest';
```

### If Email Sending Fails

Email sending errors won't cause booking failures - they're caught and logged:
```bash
# Check for email sending errors (these won't fail the booking)
sudo journalctl -u resort.service -n 100 --no-pager | grep -i "email\|smtp"
```

### Verify Backend is Running

```bash
# Check if backend service is running
sudo systemctl status resort.service

# Check if API is accessible
curl http://localhost:8000/api/bookings
curl http://localhost:8000/api/packages
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
**Date**: After booking error fix implementation

