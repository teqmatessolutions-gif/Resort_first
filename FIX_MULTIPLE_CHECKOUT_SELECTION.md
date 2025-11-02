# Fix Multiple Room Checkout Selection Issue

## Problem
When selecting "All Rooms in Booking #X" option from the dropdown, the UI was still showing "Single Room Checkout" message. This happened because both single and multiple checkout options for the same booking had the same `room_number` value (the first room), so the frontend couldn't distinguish between them.

## Solution
Changed the dropdown option values to use a **composite key** format: `booking_id-room_number-checkout_mode`

### Example:
- Single room option: `9-301-single`
- Multiple rooms option: `9-301-multiple`

This ensures each option has a unique identifier, allowing the frontend to correctly identify and display the checkout mode.

## Changes Made

### 1. Dropdown Option Values
- **Before**: Used just `room_number` as value (e.g., "301")
- **After**: Uses composite key `booking_id-room_number-checkout_mode` (e.g., "9-301-multiple")

### 2. Selection Handler
- Updated `onChange` handler to parse the composite key
- Correctly finds the selected option by matching all three parts: `booking_id`, `room_number`, and `checkout_mode`

### 3. Display Logic
- Updated the UI display logic to correctly parse the composite key
- Shows the correct message based on the actual `checkout_mode`

### 4. API Calls
- Updated `handleGetBill` and `handleCheckout` to extract the actual room number from the composite key
- Extracts room number: `roomNumber.split('-')[1]`

## Files Modified
- `dasboard/src/pages/Billing.jsx`

## Testing
After deployment:
1. Select a booking with multiple rooms
2. You should see both:
   - Individual room options (e.g., "Room 301 (guest name)")
   - "All Rooms in Booking #X" option
3. When selecting "All Rooms", you should see:
   - Blue box with message: "⚠️ Important: This will checkout ALL rooms in the booking"
   - Button text: "Get Bill for Entire Booking"
4. When selecting a single room, you should see:
   - Green box with message: "✓ Single Room Checkout: Only this room will be checked out"
   - Button text: "Get Bill for Single Room"

## Deployment
The changes are committed and ready to deploy. Build on the server using:
```bash
cd /var/www/resort/Resort_first/dasboard
npm install --legacy-peer-deps
npm run build
sudo cp -r build/* /var/www/resort/dashboard/
```

