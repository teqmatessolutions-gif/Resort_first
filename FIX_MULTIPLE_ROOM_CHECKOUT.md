# Fix Multiple Room Checkout Issue

## Issue
Multiple room checkout was not working in production.

## Root Causes Identified

1. **Unique Constraint on booking_id** - The Checkout model has `unique=True` on `booking_id`, which means if a checkout already exists for a booking, it cannot be created again.

2. **Missing validation** - No check for existing checkout records before attempting to create a new one.

3. **No check for already checked out rooms** - If some rooms were already checked out individually, the multiple room checkout would fail.

4. **Poor error handling** - Generic error messages didn't help identify the actual issue.

## Fixes Applied

### 1. Added Pre-Checkout Validation (Multiple Room Checkout)
```python
# Check if a checkout record already exists for this booking (unique constraint)
existing_checkout = None
if not is_package:
    existing_checkout = db.query(Checkout).filter(Checkout.booking_id == booking.id).first()
else:
    existing_checkout = db.query(Checkout).filter(Checkout.package_booking_id == booking.id).first()

if existing_checkout:
    raise HTTPException(status_code=409, detail=f"This booking has already been checked out. Checkout ID: {existing_checkout.id}")
```

### 2. Check for Already Checked Out Rooms
```python
# Check if any rooms are already checked out
already_checked_out_rooms = [room.number for room in all_rooms if room.status == "Available"]
if already_checked_out_rooms:
    raise HTTPException(
        status_code=409, 
        detail=f"Some rooms in this booking are already checked out: {', '.join(already_checked_out_rooms)}. Please checkout remaining rooms individually or select rooms that are still checked in."
    )
```

### 3. Enhanced Error Handling
- Added specific handling for unique constraint violations
- Better error messages to identify the exact issue
- Proper error codes (409 for conflicts, 500 for internal errors)

### 4. Added checkout_mode Validation
```python
# Ensure checkout_mode is valid
if checkout_mode not in ["single", "multiple"]:
    checkout_mode = "multiple"  # Default to multiple if invalid
```

## Changes Made

1. **ResortApp/app/api/checkout.py**:
   - Added existing checkout check before multiple room checkout
   - Added check for already checked out rooms
   - Enhanced error handling with specific constraint violation detection
   - Added checkout_mode validation
   - Fixed checkout_date fallback to use created_at if checkout_date is None

## Testing

After deploying, test the following scenarios:

1. **Fresh Booking Checkout** (All rooms checked in):
   - Select "All Rooms in Booking #X" option
   - Should successfully checkout all rooms together

2. **Partially Checked Out Booking**:
   - Checkout one room individually first
   - Try to checkout all rooms - should show error message about already checked out rooms

3. **Already Checked Out Booking**:
   - Checkout all rooms successfully
   - Try to checkout again - should show "already checked out" error

4. **Single Room Checkout**:
   - Select individual room option
   - Should checkout only that room

## Deployment Steps

```bash
cd /var/www/resort/Resort_first
git pull origin main
sudo systemctl restart resort
# OR
sudo systemctl restart resort-backend
# OR
sudo supervisorctl restart resort
```

## Expected Behavior After Fix

✅ Multiple room checkout should work correctly for bookings with all rooms checked in
✅ Clear error messages when booking is already checked out
✅ Clear error messages when some rooms are already checked out
✅ Single room checkout continues to work
✅ Both checkout modes validate properly

