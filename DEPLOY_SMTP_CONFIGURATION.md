# Deploy SMTP Configuration on Server

## Quick Setup (One Command)

Run this script on your server:

```bash
cd /var/www/resort/Resort_first
curl -s https://raw.githubusercontent.com/teqmatessolutions-gif/Resort_first/main/configure_smtp_server.sh -o configure_smtp_server.sh
chmod +x configure_smtp_server.sh
sudo ./configure_smtp_server.sh
```

## Manual Setup (Step by Step)

### Option 1: Using the Configuration Script

1. **Copy script to server** (or run directly):
   ```bash
   cd /var/www/resort/Resort_first
   git pull origin main
   cd ResortApp
   chmod +x ../configure_smtp_server.sh
   sudo ../configure_smtp_server.sh
   ```

2. **Follow the prompts:**
   - Enter SMTP Host (default: smtp.gmail.com)
   - Enter SMTP Port (default: 587)
   - Enter SMTP Username (your Gmail)
   - Enter SMTP Password (Gmail App Password)
   - Enter From Email (default: noreply@elysianretreat.com)
   - Enter From Name (default: Elysian Retreat)
   - Use TLS? (default: true)

3. **Script will:**
   - Update `.env.production` with SMTP settings
   - Set proper file permissions
   - Restart the backend service
   - Verify configuration

### Option 2: Manual Configuration

1. **SSH to server or use Web Console**

2. **Edit environment file:**
   ```bash
   cd /var/www/resort/Resort_first/ResortApp
   sudo nano .env.production
   ```

3. **Add/Update SMTP settings:**
   ```bash
   # SMTP Email Configuration (Required for booking confirmation emails)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   SMTP_FROM_EMAIL=noreply@elysianretreat.com
   SMTP_FROM_NAME=Elysian Retreat
   SMTP_USE_TLS=true
   ```

4. **Save and set permissions:**
   ```bash
   # Save file (Ctrl+X, Y, Enter in nano)
   
   # Set proper permissions
   sudo chmod 600 .env.production
   sudo chown www-data:www-data .env.production
   ```

5. **Restart backend service:**
   ```bash
   sudo systemctl restart resort.service
   ```

6. **Verify service is running:**
   ```bash
   sudo systemctl status resort.service
   ```

## For Gmail Users - Get App Password

1. **Enable 2-Step Verification:**
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter: "Resort Management System"
   - Click "Generate"
   - **Copy the 16-character password** (format: `xxxx xxxx xxxx xxxx`)

3. **Use this password in SMTP_PASSWORD:**
   ```bash
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx
   # You can include spaces or remove them
   ```

## Verify Configuration

### Check 1: Environment Variables
```bash
cd /var/www/resort/Resort_first/ResortApp
cat .env.production | grep SMTP
```

**Expected output:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=**** (hidden)
SMTP_FROM_EMAIL=noreply@elysianretreat.com
SMTP_FROM_NAME=Elysian Retreat
SMTP_USE_TLS=true
```

### Check 2: Service Status
```bash
sudo systemctl status resort.service
```

**Should show:** `Active: active (running)`

### Check 3: Test Email Sending
1. Create a test booking through the dashboard
2. Check logs:
   ```bash
   sudo journalctl -u resort.service -n 50 --no-pager | grep -i email
   ```
3. Look for:
   - `[Email] Successfully sent email to...` ✅
   - `[Email] SMTP not configured...` ❌ (configuration issue)
   - `[Email] Failed to send email...` ❌ (SMTP credentials issue)

## Troubleshooting

### If Service Doesn't Restart:
```bash
# Find service name
sudo systemctl list-units | grep resort

# Try alternative names
sudo systemctl restart resort-backend.service
# OR
sudo systemctl restart resort.service

# Reload systemd if needed
sudo systemctl daemon-reload
sudo systemctl restart resort.service
```

### If SMTP Not Configured:
```bash
# Check if SMTP_USER and SMTP_PASSWORD are set
cd /var/www/resort/Resort_first/ResortApp
grep "SMTP_USER\|SMTP_PASSWORD" .env.production

# If empty, add them:
sudo nano .env.production
# Add the SMTP settings as shown above
```

### If Authentication Fails:
1. **For Gmail:** Use App Password (not regular password)
2. **Verify password:** No extra spaces or quotes
3. **Check username:** Use full email address

### If Connection Refused:
```bash
# Test SMTP connection
telnet smtp.gmail.com 587

# Check firewall
sudo ufw status
# Port 587 should be open for outbound traffic
```

## Quick Verification Commands

```bash
# 1. Check SMTP configuration exists
cd /var/www/resort/Resort_first/ResortApp
cat .env.production | grep SMTP | wc -l
# Should show: 7 (7 SMTP variables)

# 2. Check SMTP_USER is set (not placeholder)
grep "SMTP_USER=" .env.production | grep -v "your-email@gmail.com"

# 3. Check service is using the env file
sudo systemctl show resort.service | grep EnvironmentFile
# Should show: EnvironmentFile=/var/www/resort/Resort_first/ResortApp/.env.production

# 4. Test email sending
# Create a booking and check logs:
sudo journalctl -u resort.service -f | grep -i email
```

## After Configuration

Once SMTP is configured:

1. ✅ **Automatic email sending** is enabled
2. ✅ **Booking confirmations** will be sent automatically
3. ✅ **Email includes all booking details:**
   - Booking ID (BK-000001 or PK-000001)
   - Room numbers
   - Booking charges
   - Guest details
   - Check-in/check-out dates

## Security Notes

- ✅ `.env.production` has restricted permissions (600)
- ✅ File is owned by www-data user
- ✅ Never commit .env files to Git
- ✅ Use App Passwords for Gmail (more secure)

## Files Created

- `configure_smtp_server.sh` - Interactive configuration script
- `quick_configure_smtp.sh` - Quick setup script
- `SMTP_SETUP_GUIDE.md` - Detailed guide
- `CONFIGURE_SMTP_ON_SERVER.md` - Quick reference

## Next Steps

After configuring SMTP:
1. Restart the backend service
2. Create a test booking
3. Verify email is received
4. Check logs for any errors

All scripts have been committed to GitHub and are ready to use!

