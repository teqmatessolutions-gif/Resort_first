# 🚀 Quick Deployment Guide

## Step 1: Connect to Your Production Server

```bash
ssh root@your_server_ip
# OR
ssh username@your_server_ip
```

## Step 2: Choose Your Deployment Path

### Path A: Fresh Server (First Time Setup)

```bash
# 1. Create app directory
sudo mkdir -p /var/www/resort
cd /var/www/resort

# 2. Clone repository
sudo git clone https://github.com/teqmatessolutions-gif/Resort_first.git .

# 3. Run automated deployment
cd ResortApp
sudo chmod +x deploy.sh
sudo ./deploy.sh
```

**The script will:**
- ✅ Install all dependencies (Python, Node.js, PostgreSQL, Nginx)
- ✅ Set up database
- ✅ Build frontend applications
- ✅ Configure Nginx and SSL
- ✅ Create systemd service
- ✅ Set up auto-backups

**After script completes:**
1. Save the database password shown in the output
2. Create admin user (command will be shown)
3. Configure email settings (see Step 3 below)

---

### Path B: Update Existing Deployment

```bash
# 1. Navigate to project
cd /var/www/resort/Resort_first

# 2. Pull latest code
sudo git pull origin main

# 3. Update backend
cd ResortApp
source venv/bin/activate
pip install -r requirements_production.txt

# 4. Rebuild frontends
cd ../../dasboard
sudo npm install
sudo npm run build

cd ../userend/userend
sudo npm install
sudo npm run build

# 5. Restart services
cd /var/www/resort/Resort_first/ResortApp
sudo systemctl restart resort.service
sudo systemctl restart nginx

# 6. Check status
sudo systemctl status resort.service
```

---

## Step 3: Configure Email Settings (⚠️ REQUIRED)

Emails won't work until you configure SMTP settings:

```bash
# Edit service file to add environment variables
sudo systemctl edit resort.service
```

**Add this configuration:**

```ini
[Service]
Environment="SMTP_HOST=smtp.gmail.com"
Environment="SMTP_PORT=587"
Environment="SMTP_USER=your-email@gmail.com"
Environment="SMTP_PASSWORD=your-app-password"
Environment="SMTP_USE_TLS=true"
Environment="SMTP_FROM_EMAIL=noreply@elysianretreat.com"
Environment="SMTP_FROM_NAME=Elysian Retreat"
```

**OR create/edit .env file:**

```bash
cd /var/www/resort/Resort_first/ResortApp
sudo nano .env
```

Add:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_USE_TLS=true
SMTP_FROM_EMAIL=noreply@elysianretreat.com
SMTP_FROM_NAME=Elysian Retreat
```

Then restart:
```bash
sudo systemctl restart resort.service
```

---

## Step 4: Verify Deployment

### Check Services
```bash
# Backend service
sudo systemctl status resort.service

# Nginx
sudo systemctl status nginx

# Database
sudo systemctl status postgresql
```

### Test URLs
- Landing Page: https://www.teqmates.com
- Dashboard: https://www.teqmates.com/admin
- Userend: https://www.teqmates.com/resort
- API Docs: https://www.teqmates.com/api/docs

### Test Email
1. Create a test booking from dashboard or userend
2. Check logs: `sudo journalctl -u resort.service -f | grep Email`
3. Verify email received in inbox

---

## Step 5: Common Commands

### View Logs
```bash
# Application logs
sudo journalctl -u resort.service -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check for email activity
sudo journalctl -u resort.service | grep Email
```

### Restart Services
```bash
# Restart backend
sudo systemctl restart resort.service

# Restart web server
sudo systemctl restart nginx

# Restart database (if needed)
sudo systemctl restart postgresql
```

### Update Code
```bash
cd /var/www/resort/Resort_first
sudo git pull origin main
cd ResortApp && source venv/bin/activate && pip install -r requirements_production.txt
cd ../../dasboard && sudo npm run build
cd ../userend/userend && sudo npm run build
sudo systemctl restart resort.service
```

---

## Troubleshooting

### 502 Bad Gateway
```bash
# Check if backend is running
sudo systemctl status resort.service

# Check if port 8000 is listening
sudo netstat -tlnp | grep 8000

# Restart backend
sudo systemctl restart resort.service
```

### 404 on Frontend Routes
```bash
# Rebuild frontends
cd /var/www/resort/Resort_first/dasboard
sudo npm run build

cd ../userend/userend
sudo npm run build

# Reload nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Email Not Sending
```bash
# Check email logs
sudo journalctl -u resort.service | grep -i email

# Verify SMTP settings are loaded
sudo systemctl show resort.service | grep SMTP

# Test SMTP connection manually
python3 -c "
import smtplib
server = smtplib.SMTP('smtp.gmail.com', 587)
server.starttls()
server.login('your-email@gmail.com', 'your-password')
print('SMTP connection successful')
server.quit()
"
```

---

## 🔐 Security Checklist

- [ ] SSL certificate installed and auto-renewing
- [ ] Firewall configured (UFW)
- [ ] Database password is secure
- [ ] Admin user created (not default credentials)
- [ ] Email credentials secured
- [ ] Backups scheduled

---

## 📞 Support

If you encounter issues:
1. Check logs: `sudo journalctl -u resort.service -n 100`
2. Review `DEPLOYMENT_GUIDE.md` for detailed steps
3. Check `EMAIL_CONFIGURATION.md` for email setup

---

## ✅ Deployment Complete!

Your Resort Management System should now be live at:
- **www.teqmates.com** - Landing Page
- **www.teqmates.com/admin** - Dashboard
- **www.teqmates.com/resort** - User Interface
- **www.teqmates.com/api/docs** - API Documentation

**Remember:** Configure email settings before going live to enable booking confirmations!

