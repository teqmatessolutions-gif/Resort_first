# Resort Management System - Deployment & Installation Guide

## Overview
This document outlines the complete installation and deployment process for the Resort Management System on a production server (Vultr VPS).

**Server Details:**
- **IP Address:** 139.84.211.200
- **Domain:** www.teqmates.com
- **OS:** Ubuntu (Linux)
- **Web Server:** Nginx
- **Database:** PostgreSQL
- **Backend:** FastAPI (Python)
- **Frontend:** React (Node.js/npm)

---

## Table of Contents
1. [Initial Server Setup](#1-initial-server-setup)
2. [Database Installation](#2-database-installation)
3. [Python Backend Setup](#3-python-backend-setup)
4. [Frontend Applications Setup](#4-frontend-applications-setup)
5. [Nginx Configuration](#5-nginx-configuration)
6. [Systemd Service Configuration](#6-systemd-service-configuration)
7. [SSL/HTTPS Setup](#7-sslhttps-setup)
8. [Firewall Configuration](#8-firewall-configuration)
9. [Deployment Process](#9-deployment-process)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Initial Server Setup

### 1.1. Update System Packages
```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2. Install Essential Tools
```bash
sudo apt install -y curl wget git build-essential
```

### 1.3. Create Application Directory
```bash
sudo mkdir -p /var/www/resort
sudo chown -R $USER:$USER /var/www/resort
cd /var/www/resort
```

### 1.4. Clone Repository
```bash
git clone <repository-url> Resort_first
cd Resort_first
```

---

## 2. Database Installation

### 2.1. Install PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
```

### 2.2. Start PostgreSQL Service
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2.3. Create Database and User
```bash
sudo -u postgres psql
```

Within PostgreSQL shell:
```sql
CREATE DATABASE resort_db;
CREATE USER resort_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE resort_db TO resort_user;
ALTER DATABASE resort_db OWNER TO resort_user;
\q
```

### 2.4. Configure PostgreSQL for Remote Access (Optional)
Edit `/etc/postgresql/[version]/main/postgresql.conf`:
```conf
listen_addresses = 'localhost'
```

Edit `/etc/postgresql/[version]/main/pg_hba.conf`:
```
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

---

## 3. Python Backend Setup

### 3.1. Install Python 3.11+
```bash
sudo apt install python3.11 python3.11-venv python3-pip -y
```

### 3.2. Navigate to Backend Directory
```bash
cd /var/www/resort/Resort_first/ResortApp
```

### 3.3. Create Virtual Environment
```bash
python3.11 -m venv venv
source venv/bin/activate
```

### 3.4. Install Python Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3.5. Install Gunicorn (WSGI Server)
```bash
pip install gunicorn
```

### 3.6. Configure Environment Variables
Create `.env` file:
```bash
nano .env
```

Add the following:
```env
DATABASE_URL=postgresql://resort_user:your_password@localhost:5432/resort_db
SECRET_KEY=your_secret_key_here
ENVIRONMENT=production
```

### 3.7. Run Database Migrations
```bash
alembic upgrade head
```

### 3.8. Initialize Static Directories
```bash
mkdir -p static/rooms static/food_items static/food_categories static/packages static/employees static/uploads/checkin_proofs static/uploads/expenses
```

### 3.9. Set Permissions
```bash
chmod -R 755 static
sudo chown -R www-data:www-data static
```

---

## 4. Frontend Applications Setup

### 4.1. Install Node.js and npm
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 4.2. Build Admin Dashboard
```bash
cd /var/www/resort/Resort_first/dasboard
npm install
npm run build
```

**Note:** If encountering peer dependency issues, use:
```bash
npm install --legacy-peer-deps
```

### 4.3. Build Userend Application
```bash
cd /var/www/resort/Resort_first/userend/userend
npm install
npm run build
```

### 4.4. Set Build Directory Permissions
```bash
sudo chown -R www-data:www-data /var/www/resort/Resort_first/dasboard/build
sudo chown -R www-data:www-data /var/www/resort/Resort_first/userend/userend/build
```

---

## 5. Nginx Configuration

### 5.1. Install Nginx
```bash
sudo apt install nginx -y
```

### 5.2. Create Nginx Configuration File
```bash
sudo nano /etc/nginx/sites-available/resort
```

Add the following configuration:
```nginx
# Upstream configuration for FastAPI backend
upstream fastapi_backend {
    server unix:/run/gunicorn.sock;
    # Alternative TCP configuration:
    # server 127.0.0.1:8000;
}

# HTTP server block (redirects to HTTPS)
server {
    listen 80;
    listen [::]:80;
    server_name www.teqmates.com teqmates.com;

    # Increase max body size for file uploads
    client_max_body_size 10M;

    # Redirect all HTTP requests to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server block
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.teqmates.com teqmates.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/www.teqmates.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.teqmates.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Increase max body size for file uploads
    client_max_body_size 10M;

    # Proxy timeouts for long-running requests
    proxy_connect_timeout 600s;
    proxy_send_timeout 600s;
    proxy_read_timeout 600s;

    # Root directory for static files
    root /var/www/resort/Resort_first/landingpage;
    index index.html;

    # Serve landing page
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Admin Dashboard
    location /admin/ {
        alias /var/www/resort/Resort_first/dasboard/build/;
        try_files $uri $uri/ /admin/index.html;
    }

    # Userend Application
    location /userend/ {
        alias /var/www/resort/Resort_first/userend/userend/build/;
        try_files $uri $uri/ /userend/index.html;
    }

    # Backend API endpoints
    location /api/ {
        proxy_pass http://fastapi_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Additional API paths without /api prefix (for backward compatibility)
    location ~ ^/(rooms|bookings|packages|users|employees|expenses|payments|dashboard|login|logout|food|services|checkout|report|attendance|frontend)/ {
        proxy_pass http://fastapi_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Static files for backend (room images, etc.)
    location /static/ {
        alias /var/www/resort/Resort_first/ResortApp/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Serve logo and other assets
    location /logo.jpeg {
        alias /var/www/resort/Resort_first/dasboard/build/logo.jpeg;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 5.3. Enable the Site
```bash
sudo ln -s /etc/nginx/sites-available/resort /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5.4. Update Global Nginx Configuration
Edit `/etc/nginx/nginx.conf`:
```conf
http {
    client_max_body_size 10M;
    # ... other configurations
}
```

Restart Nginx:
```bash
sudo systemctl restart nginx
```

---

## 6. Systemd Service Configuration

### 6.1. Create Gunicorn Service File
```bash
sudo nano /etc/systemd/system/resort.service
```

Add the following:
```ini
[Unit]
Description=Resort Management System (FastAPI with Gunicorn)
After=network.target postgresql.service

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/var/www/resort/Resort_first/ResortApp
Environment="PATH=/var/www/resort/Resort_first/ResortApp/venv/bin"
EnvironmentFile=/var/www/resort/Resort_first/ResortApp/.env
ExecStart=/var/www/resort/Resort_first/ResortApp/venv/bin/gunicorn \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --timeout 600 \
    --bind unix:/run/gunicorn.sock \
    app.main:app \
    --access-logfile - \
    --error-logfile -
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always
RestartSec=10
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

**Alternative TCP-based configuration:**
```ini
ExecStart=/var/www/resort/Resort_first/ResortApp/venv/bin/gunicorn \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --timeout 600 \
    --bind 127.0.0.1:8000 \
    app.main:app
```

### 6.2. Create Socket File for Unix Socket
```bash
sudo nano /etc/systemd/system/gunicorn.socket
```

Add:
```ini
[Unit]
Description=gunicorn socket

[Socket]
ListenStream=/run/gunicorn.sock

[Install]
WantedBy=sockets.target
```

### 6.3. Enable and Start Services
```bash
sudo systemctl daemon-reload
sudo systemctl enable gunicorn.socket
sudo systemctl enable resort.service
sudo systemctl start gunicorn.socket
sudo systemctl start resort.service
```

### 6.4. Check Service Status
```bash
sudo systemctl status resort.service
sudo systemctl status gunicorn.socket
sudo journalctl -u resort.service -f
```

---

## 7. SSL/HTTPS Setup

### 7.1. Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 7.2. Obtain SSL Certificate
```bash
sudo certbot --nginx -d www.teqmates.com -d teqmates.com
```

### 7.3. Auto-Renewal Setup
```bash
sudo certbot renew --dry-run
```

The renewal process is automated via cron job installed by certbot.

---

## 8. Firewall Configuration

### 8.1. Configure UFW (Uncomplicated Firewall)
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 8.2. Check Firewall Status
```bash
sudo ufw status
```

---

## 9. Deployment Process

### 9.1. Update Application Code
```bash
cd /var/www/resort/Resort_first
git pull origin main
```

### 9.2. Update Backend Dependencies (if needed)
```bash
cd ResortApp
source venv/bin/activate
pip install -r requirements.txt
```

### 9.3. Run Database Migrations (if schema changes)
```bash
alembic upgrade head
```

### 9.4. Rebuild Frontend Applications
```bash
cd ../dasboard
npm run build

cd ../userend/userend
npm run build
```

### 9.5. Restart Services
```bash
sudo systemctl restart resort.service
sudo systemctl restart nginx
```

### 9.6. Verify Deployment
```bash
curl https://www.teqmates.com
curl https://www.teqmates.com/api/rooms/
```

---

## 10. Troubleshooting

### 10.1. Check Nginx Error Logs
```bash
sudo tail -f /var/log/nginx/error.log
```

### 10.2. Check Application Logs
```bash
sudo journalctl -u resort.service -f
```

### 10.3. Check Database Connection
```bash
cd /var/www/resort/Resort_first/ResortApp
source venv/bin/activate
python -c "from app.database import SessionLocal; db = SessionLocal(); print('DB Connected'); db.close()"
```

### 10.4. Test Gunicorn Manually
```bash
cd /var/www/resort/Resort_first/ResortApp
source venv/bin/activate
gunicorn --workers 2 --bind 127.0.0.1:8000 app.main:app
```

### 10.5. Check File Permissions
```bash
sudo chown -R www-data:www-data /var/www/resort/Resort_first
sudo chmod -R 755 /var/www/resort/Resort_first
```

### 10.6. Common Issues and Solutions

#### Issue: 502 Bad Gateway
- **Cause:** Backend service not running or socket not accessible
- **Solution:**
  ```bash
  sudo systemctl status resort.service
  sudo systemctl restart resort.service
  ```

#### Issue: 413 Request Entity Too Large
- **Cause:** File upload size exceeds limit
- **Solution:** Update `client_max_body_size` in Nginx config to `10M` or higher

#### Issue: Connection timeout when uploading large files
- **Cause:** Proxy timeouts too short
- **Solution:** Increase `proxy_read_timeout`, `proxy_send_timeout` in Nginx config

#### Issue: Frontend shows blank page
- **Cause:** Build directory not found or incorrect paths
- **Solution:** Verify build paths in Nginx config and rebuild frontend

#### Issue: Database connection errors
- **Cause:** Wrong credentials or database not running
- **Solution:**
  ```bash
  sudo systemctl status postgresql
  sudo -u postgres psql -c "\l"
  ```

---

## 11. Maintenance

### 11.1. Regular Backups
```bash
# Database backup
sudo -u postgres pg_dump resort_db > /var/backups/resort_db_$(date +%Y%m%d).sql

# Application files backup
tar -czf /var/backups/resort_app_$(date +%Y%m%d).tar.gz /var/www/resort/Resort_first
```

### 11.2. Update System Packages
```bash
sudo apt update
sudo apt upgrade -y
```

### 11.3. Monitor Disk Usage
```bash
df -h
du -sh /var/www/resort/*
```

### 11.4. Monitor Application Performance
```bash
sudo journalctl -u resort.service --since "1 hour ago"
```

---

## 12. Environment-Specific Settings

### 12.1. Development Environment
- Use `localhost` or `127.0.0.1` for database
- Set `ENVIRONMENT=development` in `.env`
- Use HTTP instead of HTTPS

### 12.2. Production Environment
- Use domain name for database connections
- Set `ENVIRONMENT=production` in `.env`
- Always use HTTPS
- Enable all security headers

---

## 13. Contact Information

For issues or questions regarding this deployment:
- **Repository:** [GitHub Repository URL]
- **Server:** 139.84.211.200
- **Domain:** www.teqmates.com

---

## Appendix: Quick Command Reference

```bash
# Restart services
sudo systemctl restart resort.service
sudo systemctl restart nginx

# Check service status
sudo systemctl status resort.service
sudo systemctl status nginx

# View logs
sudo journalctl -u resort.service -f
sudo tail -f /var/log/nginx/error.log

# Deploy updates
cd /var/www/resort/Resort_first && git pull origin main
cd dasboard && npm run build
cd ../userend/userend && npm run build
sudo systemctl restart resort.service

# Database operations
sudo -u postgres psql -d resort_db
sudo -u postgres pg_dump resort_db > backup.sql

# Check running processes
ps aux | grep gunicorn
ps aux | grep nginx
```

---

**Document Version:** 1.0  
**Last Updated:** [Current Date]  
**Author:** Deployment Team
