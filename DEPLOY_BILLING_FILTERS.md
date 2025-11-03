# Deploy Billing Page Filters & Fixes

This deployment includes:
1. Comprehensive filters and search options on the billing page
2. Fix for booking_id N/A issue in single room checkouts
3. Improved error messages for already checked out rooms

## Changes Made

### Frontend (`dasboard/src/pages/Billing.jsx`)
- Added comprehensive filter system with:
  - General search bar (searches ID, guest name, room number, booking ID)
  - Guest name filter
  - Room number filter
  - Booking/Package ID filter
  - Payment method dropdown filter
  - Date range filters (From Date, To Date)
  - Amount range filters (Min Amount, Max Amount)
- Real-time filtering with `useMemo` for performance
- Active filter count badge
- Clear filters button
- Shows "X of Y checkouts" when filters are active

### Backend (`ResortApp/app/api/checkout.py`)
- Fixed booking_id N/A issue: Only the first single-room checkout per booking gets the booking_id set (to work around unique constraint)
- Improved error message for already checked out rooms
- Added `func` import from sqlalchemy for date filtering

## Deployment Steps

### 1. Frontend Deployment
```bash
cd /var/www/resort/Resort_first/dasboard
npm install
npm run build
sudo cp -r build/* /var/www/resort/admin/
```

### 2. Backend Deployment
```bash
cd /var/www/resort/Resort_first/ResortApp
sudo systemctl restart resort.service
```

### 3. Verify Deployment
```bash
# Check backend service status
sudo systemctl status resort.service

# Check backend logs
sudo journalctl -u resort.service -n 50 --no-pager

# Test checkout endpoint
curl -X GET http://localhost:8000/api/bill/checkouts?skip=0&limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Testing Checklist

- [ ] Filters work correctly on billing page
- [ ] General search finds checkouts by ID, guest name, room number, booking ID
- [ ] Payment method filter shows all unique payment methods
- [ ] Date range filter filters correctly
- [ ] Amount range filter works correctly
- [ ] Clear filters button clears all filters
- [ ] Single room checkout shows booking_id (at least for first checkout)
- [ ] Error message is clear when trying to checkout already checked out room
- [ ] Table shows filtered results correctly

## Notes

- The booking_id will only appear on the first single-room checkout for each booking due to the unique constraint
- Subsequent single-room checkouts from the same booking will show N/A for booking_id (this is expected behavior)
- All filters work together (AND logic) - all conditions must match

