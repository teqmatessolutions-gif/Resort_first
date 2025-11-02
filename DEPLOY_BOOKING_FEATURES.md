# Deploy Booking Status Filter Fix and Sharing Features

## Changes to Deploy
1. ✅ Fixed status filter (now correctly filters "Checked-out" status)
2. ✅ Added unique booking ID display (BK-000001 for regular, PK-000001 for package)
3. ✅ Added Email sharing functionality
4. ✅ Added WhatsApp sharing functionality (uses guest mobile number)

## Deployment Steps

### Option 1: SSH Access
```bash
ssh root@139.84.211.200
cd /var/www/resort/Resort_first

# 1. Pull latest changes
git pull origin main

# 2. Build frontend dashboard
cd dasboard
npm install --legacy-peer-deps
npm run build

# 3. Copy build files to web directory
sudo cp -r build/* /var/www/resort/dashboard/

# 4. Restart backend (if needed)
cd ../ResortApp
sudo systemctl restart resort.service
# OR
sudo systemctl restart resort-backend
# OR check service name:
sudo systemctl list-units | grep resort
```

### Option 2: Web Console (Recommended)
1. Log into your server hosting control panel (Vultr/Provider)
2. Open Web Console/Terminal
3. Run the following commands:

```bash
cd /var/www/resort/Resort_first
git pull origin main
cd dasboard
npm install --legacy-peer-deps
npm run build
sudo cp -r build/* /var/www/resort/dashboard/
cd ../ResortApp
sudo systemctl restart resort.service
```

### Option 3: One-liner Command
```bash
cd /var/www/resort/Resort_first && git pull origin main && cd dasboard && npm install --legacy-peer-deps && npm run build && sudo cp -r build/* /var/www/resort/dashboard/ && cd ../ResortApp && sudo systemctl restart resort.service || sudo systemctl restart resort-backend
```

## Verification Steps

1. **Check Build Success:**
   ```bash
   ls -la /var/www/resort/dashboard/
   # Should see index.html and static/ directory
   ```

2. **Check Backend Status:**
   ```bash
   sudo systemctl status resort.service
   ```

3. **Test in Browser:**
   - Visit: `https://teqmates.com/admin/bookings`
   - Verify:
     - ✅ Unique booking IDs display (BK-000001, PK-000001)
     - ✅ Status filter works correctly (select "Checked-out" shows only checked-out bookings)
     - ✅ Email and WhatsApp buttons appear in Actions column
     - ✅ Email button opens email client with booking details
     - ✅ WhatsApp button opens WhatsApp with guest mobile number

## What to Test

### Status Filter Test:
1. Select "Checked-out" from status filter dropdown
2. ✅ Should show ONLY bookings with "checked-out" or "checked_out" status
3. ✅ Should NOT show "checked-in", "cancelled", or "booked" statuses

### Unique ID Test:
1. Look at ID column in bookings table
2. ✅ Regular bookings show: `BK-000011` format
3. ✅ Package bookings show: `PK-000003` format
4. ✅ Both show internal ID below: `ID: 11` or `ID: 3`

### Email Sharing Test:
1. Click 📧 Email button for a booking
2. ✅ Email client should open
3. ✅ Recipient: guest's email address
4. ✅ Subject: "Booking Confirmation - BK-000011"
5. ✅ Body: Contains booking details with unique ID

### WhatsApp Sharing Test:
1. Click 💬 WhatsApp button for a booking
2. ✅ WhatsApp should open in new tab/window
3. ✅ Recipient: guest's mobile number (extracted from booking)
4. ✅ Message: Contains booking details with unique ID
5. ✅ Works with international numbers (removes non-digits)

## Troubleshooting

### If Frontend Build Fails:
```bash
cd dasboard
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

### If Build Files Don't Copy:
```bash
sudo rm -rf /var/www/resort/dashboard/*
sudo cp -r /var/www/resort/Resort_first/dasboard/build/* /var/www/resort/dashboard/
sudo chown -R www-data:www-data /var/www/resort/dashboard
```

### If Backend Doesn't Restart:
```bash
# Find service name
sudo systemctl list-units | grep resort

# Try alternative restart methods
sudo supervisorctl restart resort
# OR
ps aux | grep gunicorn
pkill -f gunicorn
# Then restart service
```

### If WhatsApp Not Working:
- Check browser popup blocker
- Verify mobile number format in booking
- Test with a booking that has a valid mobile number

## Notes
- Frontend changes only (no database migrations needed)
- No backend API changes
- Works for both regular bookings and package bookings
- WhatsApp uses guest's mobile number automatically
- Email uses guest's email address automatically

