# Fix Room Number Display in Production

## Issue
Room numbers were not showing in the checkout dropdown in production.

## Root Cause
The code was extracting room numbers without proper null/empty checks, which could cause:
1. Rooms with null/empty numbers to be included
2. Missing rooms when relationship isn't fully loaded
3. Display errors when room.number is None

## Solution Applied

### Changes Made:
1. **Added helper function `get_room_number()`** that safely extracts room numbers with proper error handling
2. **Enhanced null checks** to filter out:
   - None values
   - Empty strings
   - Whitespace-only strings
3. **Added exception handling** for AttributeError and other exceptions

### Code Changes:
- `ResortApp/app/api/checkout.py` - Updated `get_active_rooms()` endpoint
  - Added `get_room_number()` helper function
  - Updated room number extraction for both regular and package bookings
  - Used walrus operator for cleaner null filtering

## Deployment Steps

1. **Pull latest changes on server:**
   ```bash
   cd /var/www/resort/Resort_first
   git pull origin main
   ```

2. **Restart backend service:**
   ```bash
   # Find your backend service name
   sudo systemctl list-units | grep -E "resort|uvicorn|fastapi"
   
   # Restart the service (adjust name as needed)
   sudo systemctl restart resort
   # OR
   sudo systemctl restart resort-backend
   # OR if using supervisor
   sudo supervisorctl restart resort
   sudo supervisorctl restart all
   ```

3. **Verify the fix:**
   ```bash
   # Test the endpoint (replace token with your auth token)
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/bill/active-rooms
   
   # Check if room numbers are included in the response
   ```

4. **Test in production:**
   - Go to Billing page
   - Check if room numbers appear in the dropdown
   - Verify both single room and multiple room options are shown

## Testing Checklist

- [ ] Pull latest changes from git
- [ ] Restart backend service
- [ ] Verify API endpoint returns room numbers
- [ ] Check Billing page dropdown shows room numbers
- [ ] Test single room checkout option
- [ ] Test multiple room checkout option
- [ ] Verify room numbers display correctly in bill summary

## Additional Notes

If room numbers still don't show:
1. Check database - verify rooms have valid `number` field values
2. Check bookings - ensure booking_rooms links are correct
3. Verify room relationships are loaded correctly
4. Check server logs for any errors

