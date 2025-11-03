# Deploy Checkout Feature Changes

## Summary
Successfully added single room and multiple room checkout options in the billing system.

## Changes Made:
1. **Backend API** (`ResortApp/app/api/checkout.py`):
   - Modified `/bill/active-rooms` to return both individual rooms and grouped bookings
   - Added `_calculate_bill_for_single_room()` function
   - Updated checkout endpoint to support `checkout_mode` parameter

2. **Schema** (`ResortApp/app/schemas/checkout.py`):
   - Added `checkout_mode` field to `CheckoutRequest`

3. **Frontend** (`dasboard/src/pages/Billing.jsx`):
   - Added checkout mode selection
   - Updated UI to show both single and multiple room options

## Deployment Steps

### Option 1: Via Web Console/SSH

1. **Connect to server** (139.84.211.200)
2. **Navigate to project directory:**
   ```bash
   cd /var/www/resort/Resort_first
   ```

3. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

4. **Restart backend service:**
   ```bash
   sudo systemctl restart resort-backend
   # OR if using supervisor
   sudo supervisorctl restart resort-backend
   ```

5. **Build and deploy dashboard:**
   ```bash
   cd dasboard
   npm install  # if needed
   npm run build
   sudo systemctl restart resort-dashboard  # if using systemd
   # OR copy build files to nginx directory
   sudo cp -r build/* /var/www/resort/dashboard/
   ```

6. **Verify services are running:**
   ```bash
   sudo systemctl status resort-backend
   sudo systemctl status resort-dashboard
   ```

### Option 2: Manual File Transfer (if SSH not working)

If you need to manually transfer files, the key files that changed are:
- `ResortApp/app/api/checkout.py`
- `ResortApp/app/schemas/checkout.py`
- `dasboard/src/pages/Billing.jsx`
- `dasboard/src/services/api.js`

## Testing After Deployment

1. **Test Single Room Checkout:**
   - Go to Billing page
   - Select a single room from dropdown
   - Should show "Single Room Checkout: Only this room will be checked out"
   - Get bill and complete checkout
   - Verify only that room is checked out

2. **Test Multiple Room Checkout:**
   - Go to Billing page
   - Select "All Rooms in Booking #X" option
   - Should show "Important: This will checkout ALL rooms in the booking"
   - Get bill and complete checkout
   - Verify all rooms are checked out

3. **Verify Active Rooms List:**
   - All checked-in rooms should appear individually
   - Bookings with multiple rooms should also show grouped option

## Rollback (if needed)

If issues occur, rollback to previous version:
```bash
cd /var/www/resort/Resort_first
git log  # Find previous commit hash
git checkout <previous-commit-hash>
# Then rebuild and restart services
```

