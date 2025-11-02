# Configure SMTP on Production Server

## Quick Setup Instructions

### Step 1: Edit Environment File on Server

```bash
# SSH to server or use Web Console
cd /var/www/resort/Resort_first/ResortApp

# Edit .env.production file
sudo nano .env.production
```

### Step 2: Add SMTP Configuration

Add these lines to your `.env.production` file:

```bash
# SMTP Email Configuration (Required for booking emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password-here
SMTP_FROM_EMAIL=noreply@elysianretreat.com
SMTP_FROM_NAME=Elysian Retreat
SMTP_USE_TLS=true
```

### Step 3: Save and Restart Service

```bash
# Save the file (Ctrl+X, then Y, then Enter in nano)

# Restart backend service
sudo systemctl restart resort.service

# Verify service is running
sudo systemctl status resort.service
```

## For Gmail Users

### Step 1: Enable 2-Step Verification
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Enter "Resort Management System"
4. Click "Generate"
5. **Copy the 16-character password** (it will look like: `xxxx xxxx xxxx xxxx`)

### Step 3: Configure on Server
```bash
# Edit .env.production
sudo nano /var/www/resort/Resort_first/ResortApp/.env.production

# Add or update:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # Your 16-char app password (can include spaces)
SMTP_FROM_EMAIL=noreply@elysianretreat.com
SMTP_FROM_NAME=Elysian Retreat
SMTP_USE_TLS=true

# Save and restart
sudo systemctl restart resort.service
```

## Verify SMTP is Working

### Test 1: Check Environment Variables
```bash
cd /var/www/resort/Resort_first/ResortApp
cat .env.production | grep SMTP
```

### Test 2: Check Service Logs
```bash
# Check if service loaded the env variables
sudo journalctl -u resort.service -n 50 | grep -i "smtp\|email"

# Create a test booking and check logs
sudo journalctl -u resort.service -f | grep -i email
```

### Test 3: Create Test Booking
1. Create a booking through the dashboard
2. Check backend logs for email sending status:
```bash
sudo journalctl -u resort.service -n 100 --no-pager | tail -20
```

## Common Issues

### Issue 1: "SMTP not configured" in logs
**Solution:** Make sure `.env.production` has `SMTP_USER` and `SMTP_PASSWORD` set

### Issue 2: "Authentication failed"
**Solution:**
- For Gmail: Use App Password (not regular password)
- Verify username and password are correct
- Check for extra spaces in password

### Issue 3: "Connection refused"
**Solution:**
- Check firewall allows outbound port 587
- Verify SMTP host and port are correct
- Test: `telnet smtp.gmail.com 587`

### Issue 4: Service not loading .env.production
**Solution:**
- Check `resort.service` file has: `EnvironmentFile=/var/www/resort/Resort_first/ResortApp/.env.production`
- Reload systemd: `sudo systemctl daemon-reload`
- Restart service: `sudo systemctl restart resort.service`

## Security Best Practices

1. **File Permissions:**
   ```bash
   sudo chmod 600 /var/www/resort/Resort_first/ResortApp/.env.production
   sudo chown www-data:www-data /var/www/resort/Resort_first/ResortApp/.env.production
   ```

2. **Never commit .env files** (already in .gitignore)

3. **Use App Passwords** instead of main account passwords

4. **Regularly rotate** SMTP passwords

## Email Configuration Template

```bash
# Gmail Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM_EMAIL=noreply@elysianretreat.com
SMTP_FROM_NAME=Elysian Retreat
SMTP_USE_TLS=true
```

## Verification Checklist

- [ ] `.env.production` file exists
- [ ] SMTP_HOST is set
- [ ] SMTP_PORT is set (587 for Gmail)
- [ ] SMTP_USER is set (your email)
- [ ] SMTP_PASSWORD is set (App Password for Gmail)
- [ ] SMTP_FROM_EMAIL is set
- [ ] SMTP_FROM_NAME is set
- [ ] SMTP_USE_TLS=true
- [ ] Service restarted after configuration
- [ ] Test booking created and email sent

## Need Help?

See detailed guide in: `SMTP_SETUP_GUIDE.md`

