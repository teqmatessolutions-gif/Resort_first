# 🌐 Resort Management System - Complete Hosting Guide

## 🎯 Quick Overview

This guide provides **3 deployment options** for hosting your Resort Management System on Vultr with the domain structure:

- **Main Site**: `https://www.teqmates.com` (Landing Page)
- **Admin Panel**: `https://www.teqmates.com/dashboard` (React Dashboard)
- **User Portal**: `https://www.teqmates.com/userend` (User Interface)
- **API Docs**: `https://www.teqmates.com/api/docs` (FastAPI Documentation)

---

## 🚀 Choose Your Deployment Method

### Option 1: 🤖 Automated Deployment (Recommended)
**Best for**: Quick setup, production deployment
**Time**: ~15-30 minutes
**Skill Level**: Beginner

### Option 2: 🐳 Docker Deployment
**Best for**: Containerized environments, easy scaling
**Time**: ~20-45 minutes
**Skill Level**: Intermediate

### Option 3: 🛠️ Manual Deployment
**Best for**: Custom configurations, learning
**Time**: ~45-90 minutes
**Skill Level**: Advanced

---

## 📋 Prerequisites (All Methods)

1. **Vultr VPS Server**
   - Ubuntu 22.04 LTS
   - 2+ CPU cores, 4GB+ RAM, 80GB+ SSD
   - Static IP address

2. **Domain Configuration**
   - Domain: `teqmates.com`
   - DNS A Records pointing to your server IP:
     - `teqmates.com` → `your-server-ip`
     - `www.teqmates.com` → `your-server-ip`

3. **GitHub Repository**
   - Fork or clone this repository
   - Push your code to GitHub

---

## 🤖 Option 1: Automated Deployment

### Step 1: Prepare GitHub Repository

```bash
# On your local machine
cd Resort_first
git init
git add .
# 2. Clone and push your code
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/teqmatessolutions-gif/Resort_first.git
git push -u origin main
```

### Step 2: Server Setup

```bash
# SSH into your Vultr server
ssh root@YOUR_SERVER_IP

# Install basic dependencies
apt update && apt upgrade -y
apt install -y curl wget git

# Create application user
useradd -m -s /bin/bash appuser
usermod -aG sudo appuser
su - appuser
```

### Step 3: Run Automated Deployment

```bash
# Download and run the deployment script
curl -fsSL https://raw.githubusercontent.com/teqmatessolutions-gif/Resort_first/main/deployment/deploy.sh -o deploy.sh

# Make it executable
chmod +x deploy.sh

# Edit the script to use your GitHub repository URL
sed -i 's|yourusername|YOURUSERNAME|g' deploy.sh

# Run deployment (production mode)
sudo ./deploy.sh production
```

### Step 4: Configure Environment

```bash
# Edit production environment file
sudo nano /var/www/teqmates.com/Resort_first/ResortApp/.env

# Update these critical values:
# DATABASE_URL=postgresql://resort_user:YOUR_SECURE_PASSWORD@localhost:5432/resort_db
# SECRET_KEY=YOUR_SUPER_SECRET_JWT_KEY_AT_LEAST_32_CHARACTERS_LONG
# CORS_ORIGINS=https://teqmates.com,https://www.teqmates.com
```

### Step 5: Restart Services

```bash
sudo systemctl restart resort-api
sudo systemctl restart nginx
```

**✅ You're done!** Skip to the [Verification](#-verification) section.

---

## 🐳 Option 2: Docker Deployment

### Step 1: Install Docker

```bash
# SSH into your server
ssh root@YOUR_SERVER_IP

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install -y docker-compose-plugin

# Add user to docker group
usermod -aG docker $USER
```

### Step 2: Clone and Configure

```bash
# Clone repository
git clone https://github.com/teqmatessolutions-gif/Resort_first.git /opt/resort
cd /opt/resort

# Copy environment file
cp ResortApp/.env.production ResortApp/.env

# Edit environment variables
nano ResortApp/.env
```

### Step 3: Build and Deploy

```bash
# Build and start all services
docker compose up -d

# Check if all services are running
docker compose ps

# View logs if needed
docker compose logs -f api
```

### Step 4: Setup SSL (Optional)

```bash
# Install certbot
apt install -y certbot

# Get SSL certificate
certbot certonly --standalone -d teqmates.com -d www.teqmates.com

# Copy certificates to project
cp /etc/letsencrypt/live/teqmates.com/*.pem ./ssl/
```

**✅ Docker deployment complete!** Skip to [Verification](#-verification).

---

## 🛠️ Option 3: Manual Deployment

### Step 1: System Dependencies

```bash
ssh root@YOUR_SERVER_IP

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y nginx postgresql postgresql-contrib python3-pip python3-venv nodejs npm git certbot python3-certbot-nginx curl htop

# Create application user
useradd -m -s /bin/bash appuser
usermod -aG sudo appuser
```

### Step 2: Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE resort_db;
CREATE USER resort_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE resort_db TO resort_user;
ALTER USER resort_user CREATEDB;
\q
```

### Step 3: Application Setup

```bash
# Switch to app user
su - appuser

# Clone repository
sudo mkdir -p /var/www/teqmates.com
sudo chown appuser:appuser /var/www/teqmates.com
cd /var/www/teqmates.com
git clone https://github.com/teqmatessolutions-gif/Resort_first.git .
cd Resort_first
```

### Step 4: Backend Configuration

```bash
cd ResortApp

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Configure environment
cp .env.production .env
nano .env  # Edit with your values

# Run database migrations
alembic upgrade head
```

### Step 5: Frontend Build

```bash
# Build admin dashboard
cd /var/www/teqmates.com/dasboard
npm install
npm run build

# Create web directories and copy files
sudo mkdir -p /var/www/teqmates.com/dashboard
sudo cp -r build/* /var/www/teqmates.com/dashboard/

# Build user frontend
cd ../userend/userend
npm install
npm run build

sudo mkdir -p /var/www/teqmates.com/userend
sudo cp -r build/* /var/www/teqmates.com/userend/

# Setup landing page
sudo mkdir -p /var/www/teqmates.com/landingpage
sudo cp -r ../landingpage/* /var/www/teqmates.com/landingpage/
```

### Step 6: System Service

```bash
# Copy and configure service file
sudo cp /var/www/teqmates.com/Resort_first/deployment/resort-api.service /etc/systemd/system/

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable resort-api
sudo systemctl start resort-api

# Check service status
sudo systemctl status resort-api
```

### Step 7: Nginx Configuration

```bash
# Copy nginx configuration
sudo cp /var/www/teqmates.com/deployment/nginx.conf /etc/nginx/sites-available/teqmates.com

# Enable the site
sudo ln -s /etc/nginx/sites-available/teqmates.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart nginx
sudo nginx -t
sudo systemctl restart nginx
```

### Step 8: SSL Certificate

```bash
# Get SSL certificate
sudo certbot --nginx -d teqmates.com -d www.teqmates.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 9: Permissions

```bash
# Set proper file permissions
sudo mkdir -p /var/www/teqmates.com/{uploads,logs}
sudo chown -R www-data:www-data /var/www/teqmates.com
sudo chmod -R 755 /var/www/teqmates.com
sudo chmod -R 775 /var/www/teqmates.com/uploads
sudo chmod -R 775 /var/www/teqmates.com/logs
```

---

## ✅ Verification

### 1. Check Services Status

```bash
# Check all services are running
sudo systemctl status resort-api
sudo systemctl status nginx
sudo systemctl status postgresql

# Check ports are listening
sudo netstat -tuln | grep -E ':80|:443|:8000'
```

### 2. Test Endpoints

```bash
# Test API health
curl https://www.teqmates.com/api/health

# Test main pages (should return 200)
curl -I https://www.teqmates.com
curl -I https://www.teqmates.com/dashboard
curl -I https://www.teqmates.com/userend
```

### 3. Browser Testing

Visit these URLs in your browser:

- ✅ **Landing Page**: https://www.teqmates.com
- ✅ **Admin Dashboard**: https://www.teqmates.com/dashboard
- ✅ **User Portal**: https://www.teqmates.com/userend
- ✅ **API Documentation**: https://www.teqmates.com/api/docs

---

## 🔧 Required Code Updates for Subpath Routing

### Dashboard Router Configuration

Edit `dasboard/src/App.js`:

```javascript
import { BrowserRouter as Router } from "react-router-dom";

function App() {
  return (
    <Router basename="/dashboard">
      {/* Your existing routes */}
    </Router>
  );
}
```

### User Frontend Router Configuration

Edit `userend/userend/src/App.js`:

```javascript
import { BrowserRouter as Router } from "react-router-dom";

function App() {
  return (
    <Router basename="/userend">
      {/* Your existing routes */}
    </Router>
  );
}
```

### API Base URL Configuration

**Dashboard API Configuration** (`dasboard/src/utils/api.js`):

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://www.teqmates.com/api'
  : 'http://localhost:8000';
```

**User Frontend API Configuration**:

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://www.teqmates.com/api'
  : 'http://localhost:8000';
```

### Package.json Updates

**Dashboard** (`dasboard/package.json`):

```json
{
  "homepage": "/dashboard",
  "scripts": {
    "build": "react-scripts build"
  }
}
```

**User Frontend** (`userend/userend/package.json`):

```json
{
  "homepage": "/userend",
  "scripts": {
    "build": "react-scripts build"
  }
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: 502 Bad Gateway

```bash
# Check API service
sudo systemctl status resort-api
sudo journalctl -u resort-api -f

# Restart if needed
sudo systemctl restart resort-api
```

### Issue 2: Database Connection Error

```bash
# Check PostgreSQL
sudo systemctl status postgresql

# Check database exists
sudo -u postgres psql -l | grep resort_db

# Verify .env file has correct DATABASE_URL
```

### Issue 3: React Apps Show 404 for Routes

```bash
# Check nginx configuration has try_files directive
sudo nginx -t
sudo systemctl reload nginx

# Verify basename is set in React Router
```

### Issue 4: CORS Errors

```bash
# Update CORS_ORIGINS in .env file
CORS_ORIGINS=https://teqmates.com,https://www.teqmates.com

# Restart API service
sudo systemctl restart resort-api
```

### Issue 5: SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

---

## 📊 Monitoring & Maintenance

### Log Locations

```bash
# API Service Logs
sudo journalctl -u resort-api -f

# Nginx Logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System Resources
htop
df -h
```

### Backup Commands

```bash
# Database backup
sudo -u postgres pg_dump resort_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Application files backup
tar -czf app_backup_$(date +%Y%m%d).tar.gz /var/www/teqmates.com/
```

### Update Deployment

```bash
# Pull latest changes
cd /var/www/teqmates.com
sudo git pull origin main

# Restart services
sudo systemctl restart resort-api
sudo systemctl reload nginx
```

---

## 🔐 Security Checklist

- ✅ Strong database passwords
- ✅ Secure JWT secret key (32+ characters)
- ✅ SSL certificate installed
- ✅ Firewall configured (UFW)
- ✅ Regular system updates
- ✅ Non-root user for services
- ✅ File permissions properly set
- ✅ Environment variables secured

---

## 🚨 Emergency Contacts & Support

### If Something Goes Wrong:

1. **Check service status** using monitoring commands
2. **Review logs** for error messages
3. **Verify configurations** match the examples
4. **Test individual components** (database, API, nginx)

### Performance Monitoring:

```bash
# Server resources
htop
free -h
df -h

# Service performance
sudo systemctl status resort-api
curl -w "%{time_total}" https://www.teqmates.com/api/health
```

---

## 🎉 Success!

If you've followed this guide correctly, your Resort Management System should now be fully operational at:

- 🏠 **Landing Page**: https://www.teqmates.com
- 🏢 **Admin Dashboard**: https://www.teqmates.com/dashboard
- 👥 **User Portal**: https://www.teqmates.com/userend
- 📚 **API Documentation**: https://www.teqmates.com/api/docs

### Next Steps:

1. **Create admin user** via API or database
2. **Configure resort information** in the admin panel
3. **Upload room images** and set up inventory
4. **Test booking flow** end-to-end
5. **Set up monitoring** and alerts
6. **Schedule regular backups**

**Congratulations! Your Resort Management System is now live! 🎊**

---

*Need help? Check the logs, review configurations, and ensure all services are running. The system is designed to be robust and self-healing in most scenarios.*