# Deploy Automatic Booking Email Feature

## ✅ Completed Features

1. **Automatic Email Sending** - When a booking is completed, an email is automatically sent to the guest's email
2. **Complete Booking Details** - Email includes:
   - ✅ Formatted Booking ID (BK-000001 for regular, PK-000001 for package)
   - ✅ Guest name and mobile number
   - ✅ Room numbers with room types and prices
   - ✅ Check-in and check-out dates
   - ✅ Stay duration (number of nights)
   - ✅ Guest count (adults and children)
   - ✅ Room charges (calculated: room price × nights × number of rooms)
   - ✅ Package charges (for package bookings)
   - ✅ Subtotal, Tax (5%), and Grand Total
   - ✅ All booking information in a professional HTML email template

3. **Works for All Booking Types:**
   - ✅ Regular room bookings (authenticated)
   - ✅ Guest room bookings (public)
   - ✅ Package bookings (authenticated)
   - ✅ Guest package bookings (public)

## Deployment Steps

### Option 1: SSH Access
```bash
ssh root@139.84.211.200
cd /var/www/resort/Resort_first

# 1. Pull latest changes
git pull origin main

# 2. Restart backend service
cd ResortApp
sudo systemctl restart resort.service

# 3. Verify backend is running
sudo systemctl status resort.service
```

### Option 2: Web Console (Recommended)
1. Log into your server hosting control panel
2. Open Web Console/Terminal
3. Run:

```bash
cd /var/www/resort/Resort_first
git pull origin main
cd ResortApp
sudo systemctl restart resort.service
```

## Email Configuration (if not already set)

The email feature uses SMTP configuration from environment variables. To configure email sending:

1. **Set environment variables** in `.env` file:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@elysianretreat.com
SMTP_FROM_NAME=Elysian Retreat
SMTP_USE_TLS=true
```

2. **For Gmail**, you need to:
   - Enable 2-Step Verification
   - Generate an App Password (not your regular password)
   - Use the App Password in `SMTP_PASSWORD`

## What Gets Sent

### Email Subject:
- Regular: `Booking Confirmation BK-000001 - Elysian Retreat`
- Package: `Package Booking Confirmation PK-000001 - Elysian Retreat`

### Email Content Includes:
1. **Booking ID** (formatted: BK-000001 or PK-000001)
2. **Guest Details:**
   - Guest Name
   - Mobile Number
   - Number of Adults and Children

3. **Booking Dates:**
   - Check-in Date
   - Check-out Date
   - Stay Duration (nights)

4. **Room Details:**
   - Room Numbers
   - Room Types
   - Room Prices per night

5. **Charges Breakdown:**
   - Room Charges (room price × nights × rooms)
   - Package Charges (if package booking)
   - Subtotal
   - Tax (5%)
   - **Grand Total**

6. **Important Information:**
   - Check-in time (2:00 PM onwards)
   - Check-out time (before 11:00 AM)
   - Contact information

## Testing

### Test Regular Booking:
1. Create a room booking through the dashboard
2. Verify email is sent to guest's email address
3. Check email contains all details including charges

### Test Package Booking:
1. Create a package booking
2. Verify email is sent with package details
3. Check package charges are calculated correctly

### If Email Not Sending:
1. Check backend logs: `sudo journalctl -u resort.service -n 50`
2. Verify SMTP configuration in `.env` file
3. Check if SMTP credentials are correct
4. Email sending errors are logged but don't fail the booking

## Verification

After deployment:
1. Create a test booking
2. Check guest's email inbox
3. Verify email contains:
   - ✅ Booking ID (BK-000001 format)
   - ✅ All room numbers
   - ✅ All charges (room charges, tax, grand total)
   - ✅ Guest details
   - ✅ Stay duration

## Notes

- ✅ Email is sent automatically when booking is created
- ✅ Email sending failures don't prevent booking creation (logged only)
- ✅ Works for both regular and package bookings
- ✅ Includes all booking details in professional HTML format
- ✅ No frontend changes needed (backend-only feature)

