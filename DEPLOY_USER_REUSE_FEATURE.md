# Deploy User Reuse Feature to Production

This guide will help you deploy the user reuse feature that prevents duplicate user creation when the same guest books multiple times.

## Changes Included

### Backend Changes
- **ResortApp/app/api/booking.py**: 
  - Added `get_or_create_guest_user()` function to find or create guest users
  - Updated `create_booking()` and `create_guest_booking()` to link bookings to existing user_id
  - Creates "guest" role automatically if it doesn't exist
  
- **ResortApp/app/curd/packages.py**:
  - Added `get_or_create_guest_user()` function
  - Updated `book_package()` to link package bookings to existing user_id

### Frontend Changes
- **dasboard/src/layout/DashboardLayout.jsx**: 
  - Prevent navigation refresh when clicking active sidebar item
  - Optimized route detection

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
curl http://localhost:8000/api/bill/active-rooms
```

### 5. Build and Deploy Frontend (if needed)

```bash
cd dasboard
npm install --legacy-peer-deps
npm run build

sudo mkdir -p /var/www/resort/dashboard/
sudo cp -r build/* /var/www/resort/dashboard/
sudo chown -R www-data:www-data /var/www/resort/dashboard/
sudo chmod -R 755 /var/www/resort/dashboard/
```

### 6. Verify Deployment

Test the feature by creating a booking with an email/mobile that already exists in the system. The booking should be linked to the existing user_id instead of creating a new user.

```bash
# Check backend logs
sudo journalctl -u resort.service -n 50 --no-pager

# Verify API is working
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/bookings
```

## Feature Details

### How It Works

1. **User Matching**: When a booking is created, the system checks if a user with the same email or mobile number already exists
2. **User Creation**: If no user exists, a new "guest" user is created with:
   - Email (or generated email if not provided)
   - Mobile number
   - Guest role (auto-created if needed)
   - Placeholder password (guests won't log in)
3. **Booking Linking**: All bookings (regular and package) are now linked to the user_id
4. **Name Update**: If the user exists but name differs, it's updated to the latest provided name

### Benefits

- **No Duplicate Users**: Same guest booking multiple times uses the same user_id
- **User History**: All bookings are linked to the user, enabling better guest tracking
- **Data Consistency**: One user profile per email/mobile combination
- **Guest Role**: Automatic creation of "guest" role for booking users

### Database Impact

- No migration needed - existing bookings will continue to work
- New bookings will have user_id set
- Guest role will be auto-created on first booking

## Testing

### Test Case 1: New Guest Booking
1. Create a booking with a new email/mobile
2. Check that a new guest user is created
3. Verify booking has user_id set

### Test Case 2: Existing Guest Booking
1. Create a booking with email/mobile that already exists
2. Verify booking is linked to existing user_id
3. Check that no duplicate user is created

### Test Case 3: Package Booking
1. Create a package booking with existing email/mobile
2. Verify it uses the same user_id as regular bookings

## Troubleshooting

### If User Creation Fails

```bash
# Check backend logs for errors
sudo journalctl -u resort.service -n 100 --no-pager | grep "guest user"

# Verify database connection
cd /var/www/resort/Resort_first/ResortApp
python3 -c "from app.database import engine; from app.models import Base; print('DB OK')"
```

### If Guest Role Doesn't Exist

The system will automatically create it on first use. You can also manually create it:

```sql
-- Connect to your database and run:
INSERT INTO roles (name, permissions) VALUES ('guest', '[]') ON CONFLICT DO NOTHING;
```

### If Bookings Don't Link to Users

Check that bookings have user_id set:
```bash
# Query the database to verify
# Bookings should now have user_id populated
```

## Rollback (if needed)

If you need to rollback:

```bash
cd /var/www/resort/Resort_first
git log --oneline -5  # Find the commit before this feature
git checkout <previous-commit-hash>
sudo systemctl restart resort.service
```

---

**Status**: Ready for production deployment
**Date**: After user reuse feature implementation

