# Resort Management System - Project Summary

## Current Status: Production Environment
**Server:** 139.84.211.200  
**Domain:** www.teqmates.com  
**Last Updated:** Current Session

---

## Recent Issues Fixed

### 1. Guest Capacity Validation Issue
**Problem:** Booking form was accepting more guests than room capacity allowed.  
**Fix:** Modified validation in `dasboard/src/pages/Bookings.jsx` to check adults and children capacity separately instead of total capacity.

**Files Modified:**
- `dasboard/src/pages/Bookings.jsx` (lines 675-695)
  - Updated `totalCapacity` to return object with `adults`, `children`, and `total`
  - Added separate validation for adults and children capacity
  - Applied same validation to package bookings

**Current Behavior:**
- Room with 2 adults + 2 children allows: 2A+2C, 2A+0C, 0A+2C
- Room with 2 adults + 2 children rejects: 4A+0C, 3A+1C

---

### 2. Duplicate Booking Entries Issue
**Problem:** Bookings appearing twice in the "All Bookings" table.  
**Fix:** 
- Changed deduplication logic to use composite keys with type prefix
- Updated duplicate checks in booking creation to only compare same type

**Files Modified:**
- `dasboard/src/pages/Bookings.jsx` (lines 437-449, 823-843, 677-683)

**Changes:**
```javascript
// Before: bookingsMap.set(b.id, ...)
// After:  bookingsMap.set(`regular_${b.id}`, ...)
```

---

### 3. Missing Bookings in "Process New Checkout" Dropdown
**Problem:** Not all checked-in rooms appearing in billing page dropdown.  
**Root Cause:** Status values in database may have inconsistent format (hyphen vs underscore).

**Files to Check:**
- `ResortApp/app/api/checkout.py` (lines 37, 42, 74, 81)
- Current filter: `status.in_(['checked-in', 'booked'])`
- May need to add: `'checked_in'` with underscore

**Investigation Needed:**
```sql
SELECT DISTINCT status FROM bookings;
SELECT DISTINCT status FROM package_bookings;
```

---

## Key Configuration Files

### 1. Nginx Configuration
**Location:** `/etc/nginx/sites-available/resort`

**Key Settings:**
- `client_max_body_size 10M` (for file uploads)
- Proxy timeouts: 600s (for large file uploads)
- SSL/HTTPS configured via Let's Encrypt
- Upstream: Unix socket `/run/gunicorn.sock`

### 2. Systemd Service
**Location:** `/etc/systemd/system/resort.service`

**Configuration:**
- 4 Gunicorn workers
- Uvicorn worker class
- Timeout: 600s
- Runs as `www-data` user

### 3. Environment Variables
**Location:** `ResortApp/.env` or systemd service override

```
DATABASE_URL=postgresql://resort_user:****@localhost:5432/resort_db
SECRET_KEY=****
ENVIRONMENT=production

# Email Configuration (REQUIRED for booking confirmations)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_USE_TLS=true
SMTP_FROM_EMAIL=noreply@elysianretreat.com
SMTP_FROM_NAME=Elysian Retreat
```

**Configuration Method:**
```bash
sudo systemctl edit resort.service
# Add [Service] section with Environment variables above
sudo systemctl daemon-reload
sudo systemctl restart resort.service
```

---

## Database Schema

### Key Tables
- `bookings` - Regular room bookings
- `package_bookings` - Package bookings  
- `package_booking_rooms` - Package booking room links
- `booking_rooms` - Regular booking room links
- `rooms` - Room inventory
- `checkouts` - Checkout records
- `food_orders`, `food_order_items` - Food billing
- `assigned_services` - Service billing

### Status Values (Important!)
**Bookings:** `booked`, `checked-in`, `checked_out`, `cancelled`  
**Rooms:** `Available`, `Booked`, `Checked-in`, `Occupied`, `Maintenance`

⚠️ **Note:** Status normalization varies:
- Backend may use: `checked-in` (hyphen)
- Some queries may expect: `checked_in` (underscore)
- Frontend normalizes: `.replace(/[-_]/g, '')`

---

## Deployment Process

### Standard Deployment
```bash
# On production server
cd /var/www/resort/Resort_first
git pull origin main

# Update backend dependencies
cd ResortApp
source venv/bin/activate
pip install -r requirements_production.txt

# Build frontend applications
cd ../dasboard
npm install --legacy-peer-deps  # Note: Required for TypeScript compatibility
npm run build

cd ../userend/userend
npm install
npm run build

# Restart services
cd /var/www/resort/Resort_first/ResortApp
sudo systemctl restart resort.service
sudo systemctl restart nginx
```

### Important Notes
- **npm install for dashboard:** Use `--legacy-peer-deps` flag due to TypeScript version conflict
- **Email Configuration:** Must configure SMTP settings after deployment (see EMAIL_CONFIGURATION.md)

### Direct File Upload (If git not synced)
```bash
# Upload specific file
scp dasboard/src/pages/Bookings.jsx root@139.84.211.200:/var/www/resort/Resort_first/dasboard/src/pages/Bookings.jsx

# Build
ssh root@139.84.211.200 "cd /var/www/resort/Resort_first/dasboard && npm run build && sudo systemctl restart nginx"
```

---

## Known Issues & Pending Tasks

### ⚠️ Critical: Billing Page Dropdown Issue
**Status:** Investigating  
**Issue:** Not all booked rooms showing in "Process New Checkout" dropdown  
**Potential Causes:**
1. Status format mismatch (`checked-in` vs `checked_in`)
2. Missing eager loading of relationships
3. Filter logic in `get_active_rooms` endpoint

**Next Steps:**
1. Check actual booking statuses in database
2. Add `'checked_in'` with underscore to filter
3. Verify relationships are properly loaded

### 🔍 Recommended Investigation
```sql
-- Check booking statuses
SELECT DISTINCT status, COUNT(*) FROM bookings GROUP BY status;
SELECT DISTINCT status, COUNT(*) FROM package_bookings GROUP BY status;

-- Check active bookings not appearing in dropdown
SELECT b.id, b.guest_name, b.status, r.number as room_number
FROM bookings b
JOIN booking_rooms br ON b.id = br.booking_id
JOIN rooms r ON br.room_id = r.id
WHERE b.status IN ('checked-in', 'checked_in', 'booked')
ORDER BY b.id DESC;
```

---

## Frontend Components Structure

### Admin Dashboard (`dasboard/src/`)
- `pages/Bookings.jsx` - Booking management (recently modified for capacity validation)
- `pages/Billing.jsx` - Billing and checkout
- `pages/CreateRooms.jsx` - Room management
- `pages/Package.jsx` - Package bookings
- `components/BannerMessage.jsx` - Auto-dismissing notifications

### API Configuration
**File:** `dasboard/src/services/api.js`
```javascript
baseURL: process.env.NODE_ENV === 'production' 
  ? "https://www.teqmates.com" 
  : "http://localhost:8000"
```

---

## Backend API Structure

### Key Endpoints
- `/api/bookings` - Booking CRUD (sends email confirmation)
- `/api/bookings/guest` - Guest booking (sends email confirmation)
- `/api/bookings/{id}/check-in` - Check-in with photos
- `/api/packages/book` - Create package booking (dashboard, sends email)
- `/api/packages/book/guest` - Guest package booking (sends email confirmation)
- `/api/bill/active-rooms` - Get rooms for checkout dropdown ⚠️
- `/api/bill/{room_number}` - Get bill details
- `/api/bill/checkout/{room_number}` - Process checkout
- `/api/rooms/` - Room management

### Important Files
- `ResortApp/app/utils/email.py` - Email utility for booking confirmations
- `ResortApp/app/api/checkout.py` - Billing/checkout logic
- `ResortApp/app/api/booking.py` - Booking management + email integration
- `ResortApp/app/api/packages.py` - Package booking + email integration
- `ResortApp/app/api/room.py` - Room management
- `ResortApp/app/database.py` - Database configuration (SSL disabled)
- `ResortApp/EMAIL_CONFIGURATION.md` - Email setup guide

---

## Testing Checklist

### Capacity Validation
- [ ] Book room with 2A+2C capacity, try 2A+2C ✓ Should work
- [ ] Book room with 2A+2C capacity, try 4A+0C ✓ Should reject
- [ ] Book room with 2A+2C capacity, try 3A+1C ✓ Should reject

### Booking Display
- [ ] Create regular booking, verify appears in table
- [ ] Create package booking, verify appears in table
- [ ] Verify no duplicate entries
- [ ] Verify ordering (latest first)

### Billing/Checkout
- [ ] Check-in a booking
- [ ] Verify room appears in "Process New Checkout" dropdown
- [ ] Process checkout successfully
- [ ] Verify room becomes available

---

## Quick Commands Reference

### Restart Services
```bash
sudo systemctl restart resort.service
sudo systemctl restart nginx
```

### Check Logs
```bash
sudo journalctl -u resort.service -f
sudo tail -f /var/log/nginx/error.log
```

### Database Access
```bash
sudo -u postgres psql -d resort_db
```

### Check Service Status
```bash
sudo systemctl status resort.service
sudo systemctl status nginx
```

---

## Environment Details

### Python Backend
- **Location:** `/var/www/resort/Resort_first/ResortApp`
- **Virtual Env:** `venv/` directory
- **Entry Point:** `gunicorn app.main:app`
- **Workers:** 4

### React Frontend
- **Admin Dashboard:** `dasboard/build/` → `/admin/`
- **Userend:** `userend/userend/build/` → `/userend/`
- **Build Tool:** Create React App with CRACO

### Database
- **Type:** PostgreSQL
- **Name:** `resort_db`
- **User:** `resort_user`
- **Host:** `localhost:5432`
- **SSL:** Disabled for local connections

---

## Contact & Support

### Deployment Guide
Created detailed installation and deployment guide: `DEPLOYMENT_INSTALLATION_GUIDE.md`

### Repository
- **GitHub:** [Repository URL]
- **Main Branch:** `main`

### Server Access
- **IP:** 139.84.211.200
- **SSH:** `ssh root@139.84.211.200`
- **Domain:** www.teqmates.com

---

## Recent Sessions Summary

### Session Focus Areas
1. ✅ Fixed guest capacity validation (adults/children separate)
2. ✅ Fixed duplicate booking entries (composite keys)
3. ✅ Added automatic email confirmation for all bookings
4. ✅ Improved package booking flow with selection modal
5. ✅ Removed food and service prices from userend
6. ✅ Fixed package booking validation and error handling
7. 🔍 Investigating billing page dropdown issue (in progress)

### Latest Deployment (Current Session)
- **Date:** October 28, 2025
- **New Features:**
  - Automatic email confirmations for all bookings (dashboard + userend)
  - Package selection modal before booking form
  - Removed price displays from food items and services
  - Enhanced booking validation and error messages
- **Files Modified:**
  - `ResortApp/app/utils/email.py` (new - email utility)
  - `ResortApp/app/api/booking.py` (email integration)
  - `ResortApp/app/api/packages.py` (email integration + dashboard support)
  - `userend/userend/src/App.js` (package selection, price removal, fixes)
  - `ResortApp/requirements_production.txt` (dependency fixes)
- **Status:** Deployed to production

---

**Note for Partner:**  
This document contains all critical information about the current state of the project. If you encounter the billing page dropdown issue, start by checking the booking status values in the database and comparing them with the filter in `get_active_rooms` endpoint.

For any questions or clarifications, refer to this document and the code comments in the affected files.
