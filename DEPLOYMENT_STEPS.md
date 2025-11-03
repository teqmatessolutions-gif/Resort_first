# Quick Deployment Steps - Production Ready

## Prerequisites
✅ Code is committed and pushed to GitHub
✅ Server access (SSH) to production
✅ Domain configured (teqmates.com)

## Deployment Options

### Option 1: Fresh Deployment (New Server)

If this is a fresh server, run the automated deployment script:

```bash
# On your local machine, connect to server
ssh root@your_server_ip

# Clone or upload the project
cd /var/www
git clone https://github.com/teqmatessolutions-gif/Resort_first.git resort

# Run deployment script
cd resort/ResortApp
chmod +x deploy.sh
sudo ./deploy.sh
```

### Option 2: Update Existing Deployment

If you're updating an existing deployment:

```bash
# SSH to server
ssh root@your_server_ip

# Navigate to project
cd /var/www/resort/Resort_first

# Pull latest changes
git pull origin main

# Update Python dependencies
cd ResortApp
source venv/bin/activate
pip install -r requirements_production.txt

# Rebuild frontend applications
cd ../../dasboard
npm install
npm run build

cd ../userend/userend
npm install
npm run build

# Restart services
sudo systemctl restart resort.service
sudo systemctl restart nginx
```

## ⚠️ IMPORTANT: Configure Email Settings

After deployment, you MUST configure email settings:

1. **Edit environment variables:**
   ```bash
   sudo nano /var/www/resort/Resort_first/ResortApp/.env
   # OR if using systemd service:
   sudo systemctl edit resort.service
   ```

2. **Add these variables:**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_USE_TLS=true
   SMTP_FROM_EMAIL=noreply@elysianretreat.com
   SMTP_FROM_NAME=Elysian Retreat
   ```

3. **Restart service:**
   ```bash
   sudo systemctl restart resort.service
   ```

## Post-Deployment Checklist

- [ ] Verify application is running: `sudo systemctl status resort.service`
- [ ] Check nginx is running: `sudo systemctl status nginx`
- [ ] Test landing page: https://www.teqmates.com
- [ ] Test dashboard: https://www.teqmates.com/admin
- [ ] Test userend: https://www.teqmates.com/resort
- [ ] Test API: https://www.teqmates.com/api/docs
- [ ] Create a test booking and verify email is sent
- [ ] Check email logs: `sudo journalctl -u resort.service -f | grep Email`

## Troubleshooting

### Check Logs
```bash
# Application logs
sudo journalctl -u resort.service -n 50 -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Common Issues

1. **502 Bad Gateway**: Backend not running or wrong port
   - Check: `sudo systemctl status resort.service`
   - Fix: `sudo systemctl restart resort.service`

2. **404 Not Found**: Frontend build missing
   - Rebuild: `cd dasboard && npm run build`
   - Check nginx config points to correct build directories

3. **Email not sending**: SMTP not configured
   - Add SMTP credentials to environment variables
   - Verify credentials with a test email

## Need Help?

Refer to:
- `DEPLOYMENT_GUIDE.md` - Full deployment guide
- `EMAIL_CONFIGURATION.md` - Email setup guide
- `ResortApp/deploy.sh` - Automated deployment script

