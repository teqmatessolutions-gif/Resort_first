# TeqMates Resort Management System - Production Deployment Guide

## Overview

This guide will help you deploy the TeqMates Resort Management System on Vultr with the following URL structure:
- **www.teqmates.com** → Landing Page
- **www.teqmates.com/admin** → Admin Dashboard (React)
- **www.teqmates.com/resort** → User Interface (React)

## Prerequisites

- Vultr VPS (minimum 2 CPU, 4GB RAM, 80GB SSD)
- Ubuntu 20.04 or 22.04 LTS
- Domain name (teqmates.com) pointing to your server IP
- Root or sudo access to the server

## Step-by-Step Deployment on Vultr

### Step 1: Create and Configure Vultr VPS

1. **Create Vultr Account**
   - Go to https://vultr.com
   - Sign up for an account
   - Add payment method

2. **Deploy New Server**
   - Click "Deploy New Server"
   - Choose Server Type: **Cloud Compute**
   - Location: Choose closest to your users
   - Server Image: **Ubuntu 22.04 LTS**
   - Server Size: **$12/month** (2 CPU, 4GB RAM, 80GB SSD) minimum
   - Additional Features: Enable **IPv6**, **Auto Backups**
   - SSH Keys: Upload your SSH public key (recommended)
   - Server Hostname: `teqmates-resort`
   - Deploy Now

3. **Configure DNS**
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Set nameservers to Vultr's DNS or configure A records:
     ```
     A Record: teqmates.com → [Your Server IP]
     A Record: www.teqmates.com → [Your Server IP]
     ```

### Step 2: Initial Server Setup

1. **Connect to Server**
   ```bash
   ssh root@your_server_ip
   ```

2. **Update System**
   ```bash
   apt update && apt upgrade -y
   ```

3. **Create Non-Root User (Optional but Recommended)**
   ```bash
   adduser deploy
   usermod -aG sudo deploy
   ```

### Step 3: Upload Application Files

1. **Using SCP (from your local machine):**
   ```bash
   # Compress your project
   tar -czf resort-app.tar.gz Resort_first/
   
   # Upload to server
   scp resort-app.tar.gz root@your_server_ip:/tmp/
   ```

2. **Using Git (Alternative):**
   ```bash
   # On server
   cd /var/www
   git clone https://github.com/yourusername/resort-management.git resort
   ```

3. **Extract Files on Server:**
   ```bash
   cd /var/www
   tar -xzf /tmp/resort-app.tar.gz
   mv Resort_first resort/Resort_first
   ```

### Step 4: Run Automated Deployment Script

1. **Make Script Executable:**
   ```bash
   cd /var/www/resort/Resort_first/ResortApp
   chmod +x deploy.sh
   ```

2. **Run Deployment Script:**
   ```bash
   sudo ./deploy.sh
   ```

   This script will automatically:
   - Install all system dependencies
   - Set up PostgreSQL database
   - Configure Python virtual environment
   - Build React applications
   - Configure Nginx
   - Set up SSL certificates
   - Configure systemd services
   - Set up monitoring and backups

### Step 5: Manual Configuration (if needed)

If the automated script fails or you prefer manual setup:

#### A. Install System Dependencies
```bash
# System packages
sudo apt install -y python3 python3-pip python3-venv python3-dev \
    postgresql postgresql-contrib nginx redis-server git curl wget \
    unzip supervisor certbot python3-certbot-nginx build-essential \
    libpq-dev libffi-dev libssl-dev nodejs npm

# Node.js (latest LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### B. Setup Database
```bash
# Create PostgreSQL user and database
sudo -u postgres createuser -s resort_user
sudo -u postgres createdb resort_db
sudo -u postgres psql -c "ALTER USER resort_user PASSWORD 'your_secure_password';"
```

#### C. Setup Python Environment
```bash
cd /var/www/resort/Resort_first/ResortApp
python3 -m venv venv
source venv/bin/activate
pip install -r requirements_production.txt
```

#### D. Build React Applications
```bash
# Build Admin Dashboard
cd /var/www/resort/Resort_first/dasboard
npm install
npm run build

# Build User Interface
cd /var/www/resort/Resort_first/userend
npm install
npm run build
```

#### E. Configure Environment
```bash
cd /var/www/resort/Resort_first/ResortApp
cp .env.production .env
# Edit .env with your specific configuration
```

#### F. Setup Database Tables
```bash
cd /var/www/resort/Resort_first/ResortApp
source venv/bin/activate
python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

#### G. Configure Nginx
```bash
# Copy Nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/resort
sudo ln -s /etc/nginx/sites-available/resort /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### H. Setup SSL Certificate
```bash
sudo certbot --nginx -d teqmates.com -d www.teqmates.com
```

#### I. Setup Systemd Service
```bash
sudo cp resort.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable resort.service
sudo systemctl start resort.service
```

### Step 6: Configure Firewall

```bash
# Enable UFW firewall
sudo ufw --force enable

# Allow necessary ports
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS

# Optional: Database access (restrict to specific IPs in production)
sudo ufw allow 5432  # PostgreSQL
```

### Step 7: Create Admin User

1. **Using API (Recommended):**
   ```bash
   curl -X POST "https://www.teqmates.com/api/users/setup-admin" \
        -H "Content-Type: application/json" \
        -d '{
          "name": "Admin User",
          "email": "admin@teqmates.com",
          "password": "secure_admin_password",
          "phone": "+1234567890"
        }'
   ```

2. **Using Database (Alternative):**
   ```bash
   sudo -u postgres psql resort_db
   # Run SQL commands to create admin user
   ```

### Step 8: Test Deployment

1. **Test URLs:**
   - https://www.teqmates.com → Should show landing page
   - https://www.teqmates.com/admin → Should show admin dashboard
   - https://www.teqmates.com/resort → Should show user interface
   - https://www.teqmates.com/docs → Should show API documentation

2. **Test API:**
   ```bash
   curl https://www.teqmates.com/health
   # Should return: {"status": "healthy"}
   ```

3. **Check Services:**
   ```bash
   sudo systemctl status resort.service
   sudo systemctl status nginx
   sudo systemctl status postgresql
   ```

### Step 9: Monitoring and Maintenance

#### A. View Logs
```bash
# Application logs
sudo journalctl -u resort.service -f

# Nginx logs
sudo tail -f /var/log/nginx/resort_access.log
sudo tail -f /var/log/nginx/resort_error.log

# Application-specific logs
sudo tail -f /var/log/resort/app.log
```

#### B. Service Management
```bash
# Restart application
sudo systemctl restart resort.service

# Reload Nginx (for config changes)
sudo systemctl reload nginx

# Check service status
sudo systemctl status resort.service
```

#### C. Database Backup
```bash
# Manual backup
sudo -u postgres pg_dump resort_db > backup_$(date +%Y%m%d).sql

# Automated backups are configured via cron
```

#### D. Application Updates
```bash
# Pull latest code
cd /var/www/resort
git pull origin main

# Rebuild React apps if needed
cd Resort_first/dasboard && npm run build
cd ../userend && npm run build

# Restart application
sudo systemctl restart resort.service
```

## Configuration Files Overview

- **main.py** - FastAPI application with routing
- **.env.production** - Environment variables
- **gunicorn.conf.py** - WSGI server configuration
- **nginx.conf** - Web server configuration
- **resort.service** - Systemd service definition
- **requirements_production.txt** - Python dependencies

## Troubleshooting

### Common Issues

1. **Application won't start:**
   ```bash
   # Check logs
   sudo journalctl -u resort.service -n 50
   
   # Check configuration
   cd /var/www/resort/Resort_first/ResortApp
   source venv/bin/activate
   python main.py  # Test manually
   ```

2. **Database connection issues:**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Test connection
   sudo -u postgres psql resort_db
   ```

3. **SSL certificate issues:**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificate
   sudo certbot renew
   ```

4. **Static files not loading:**
   ```bash
   # Check file permissions
   ls -la /var/www/resort/Resort_first/
   
   # Fix permissions
   sudo chown -R www-data:www-data /var/www/resort
   ```

### Performance Optimization

1. **Database Optimization:**
   ```bash
   # Edit PostgreSQL configuration
   sudo nano /etc/postgresql/14/main/postgresql.conf
   
   # Increase shared_buffers, effective_cache_size
   # Restart PostgreSQL
   sudo systemctl restart postgresql
   ```

2. **Application Optimization:**
   ```bash
   # Increase worker processes in gunicorn.conf.py
   # Add Redis for caching
   # Enable gzip compression in Nginx
   ```

## Security Recommendations

1. **Server Security:**
   - Change default SSH port
   - Disable root login
   - Use SSH keys only
   - Enable fail2ban
   - Regular security updates

2. **Application Security:**
   - Use strong passwords
   - Enable rate limiting
   - Regular security audits
   - Monitor access logs
   - Keep dependencies updated

3. **Database Security:**
   - Restrict database access
   - Use strong passwords
   - Regular backups
   - Enable query logging

## Backup Strategy

1. **Automated Daily Backups:**
   - Database: Full backup at 2:00 AM
   - Files: Uploaded content backup
   - Retention: 7 days

2. **Manual Backup Commands:**
   ```bash
   # Database backup
   sudo -u postgres pg_dump resort_db > manual_backup.sql
   
   # Files backup
   tar -czf files_backup.tar.gz /var/www/resort/Resort_first/ResortApp/uploads
   ```

## Support and Maintenance

- **Log Location:** `/var/log/resort/`
- **Backup Location:** `/var/backups/resort/`
- **Service Name:** `resort.service`
- **Application User:** `www-data`

For issues and support, check the logs first, then refer to this documentation or contact your system administrator.

---

**Deployment Date:** _Fill in when deployed_
**Server IP:** _Fill in your server IP_
**Domain:** teqmates.com
**SSL Certificate:** Let's Encrypt (auto-renewal enabled)