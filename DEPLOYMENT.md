# 🚀 Quick Deployment Guide for Resort Management System

This guide will help you deploy your Resort Management System to Vultr with the domain structure:
- **Landing Page**: `www.teqmates.com`
- **Admin Dashboard**: `www.teqmates.com/dashboard`
- **User Portal**: `www.teqmates.com/userend`
- **API**: `www.teqmates.com/api`

## 📋 Prerequisites

- Vultr VPS (Ubuntu 22.04 LTS, 2+ CPU cores, 4GB+ RAM)
- Domain name: `teqmates.com` pointed to your server IP
- GitHub repository for your code

## 🎯 Option 1: Automated Deployment (Recommended)

### Step 1: Setup GitHub Repository

```bash
# 1. Create a new repository on GitHub named "resort-management-system"
# 2. Clone and push your code

cd Resort_first
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/resort-management-system.git
git push -u origin main
```

### Step 2: Server Initial Setup

```bash
# Connect to your Vultr server
ssh root@your-server-ip

# Update system and install dependencies
apt update && apt upgrade -y
apt install -y nginx postgresql postgresql-contrib python3-pip nodejs npm git certbot python3-certbot-nginx curl htop

# Create application user
useradd -m -s /bin/bash appuser
usermod -aG sudo appuser
```

### Step 3: Run Automated Deployment

```bash
# Switch to app user
su - appuser

# Clone the repository
git clone https://github.com/yourusername/resort-management-system.git /tmp/resort-deploy
cd /tmp/resort-deploy/Resort_first

# Update the repository URL in deploy script
sed -i 's|https://github.com/yourusername/resort-management-system.git|https://github.com/YOURUSERNAME/resort-management-system.git|' deployment/deploy.sh

# Run deployment script
sudo ./deployment/deploy.sh production
```

### Step 4: Configure Domain DNS

Point your domain to your server IP:
- **A Record**: `teqmates.com` → `your-server-ip`
- **A Record**: `www.teqmates.com` → `your-server-ip`

---

## 🛠️ Option 2: Manual Step-by-Step Deployment

### Step 1: Server Setup

```bash
# Connect to server
ssh root@your-server-ip

# Install system dependencies
apt update && apt upgrade -y
apt install -y nginx postgresql postgresql-contrib python3-pip python3-venv nodejs npm git certbot python3-certbot-nginx

# Create application user
useradd -m -s /bin/bash appuser
usermod -aG sudo appuser
su - appuser
```

### Step 2: Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE resort_db;
CREATE USER resort_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE resort_db TO resort_user;
\q
```

### Step 3: Clone and Setup Application

```bash
# Clone repository
sudo mkdir -p /var/www/teqmates.com
sudo chown appuser:appuser /var/www/teqmates.com
cd /var/www/teqmates.com
git clone https://github.com/yourusername/resort-management-system.git .
```

### Step 4: Backend Setup

```bash
cd Resort_first/ResortApp

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
nano .env  # Edit with your configuration
```

**Environment Configuration (.env):**
```env
DATABASE_URL=postgresql://resort_user:your_secure_password_here@localhost:5432/resort_db
SECRET_KEY=your-super-secret-jwt-key-change-this-now
CORS_ORIGINS=https://teqmates.com,https://www.teqmates.com
ENVIRONMENT=production
DEBUG=False
HOST=0.0.0.0
PORT=8000
```

```bash
# Run database migrations
alembic upgrade head
```

### Step 5: Frontend Setup

```bash
# Build admin dashboard
cd /var/www/teqmates.com/Resort_first/dasboard
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

### Step 6: System Service Setup

```bash
# Copy service file
sudo cp /var/www/teqmates.com/Resort_first/deployment/resort-api.service /etc/systemd/system/

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable resort-api
sudo systemctl start resort-api

# Check status
sudo systemctl status resort-api
```

### Step 7: Nginx Configuration

```bash
# Copy nginx configuration
sudo cp /var/www/teqmates.com/Resort_first/deployment/nginx.conf /etc/nginx/sites-available/teqmates.com

# Enable site
sudo ln -s /etc/nginx/sites-available/teqmates.com /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

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

### Step 9: Set Permissions

```bash
# Create directories and set permissions
sudo mkdir -p /var/www/teqmates.com/{uploads,logs}
sudo chown -R www-data:www-data /var/www/teqmates.com
sudo chmod -R 755 /var/www/teqmates.com
sudo chmod -R 775 /var/www/teqmates.com/{uploads,logs}
```

---

## 🔧 Configuration Updates for Subpaths

### Update React Router for Dashboard

Edit `dasboard/src/App.js`:
```javascript
// Add basename to Router
<Router basename="/dashboard">
  <Routes>
    {/* Your existing routes */}
  </Routes>
</Router>
```

### Update React Router for User Frontend

Edit `userend/userend/src/App.js`:
```javascript
// Add basename to Router if using React Router
<Router basename="/userend">
  <Routes>
    {/* Your existing routes */}
  </Routes>
</Router>
```

### Update API Base URLs

**Dashboard API calls** (`dasboard/src/utils/api.js` or similar):
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://www.teqmates.com/api' 
  : 'http://localhost:8000';
```

**User Frontend API calls**:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://www.teqmates.com/api' 
  : 'http://localhost:8000';
```

---

## 🎯 Build Configuration for Subpaths

### Dashboard Build Configuration

Create/update `dasboard/package.json`:
```json
{
  "homepage": "/dashboard",
  "scripts": {
    "build": "react-scripts build"
  }
}
```

### User Frontend Build Configuration

Create/update `userend/userend/package.json`:
```json
{
  "homepage": "/userend",
  "scripts": {
    "build": "react-scripts build"
  }
}
```

---

## ✅ Verification Steps

### 1. Check Services Status
```bash
sudo systemctl status resort-api
sudo systemctl status nginx
sudo systemctl status postgresql
```

### 2. Check Port Listening
```bash
netstat -tuln | grep -E ':80|:443|:8000'
```

### 3. Test Endpoints
```bash
# Test API health
curl https://www.teqmates.com/api/health

# Test main pages
curl -I https://www.teqmates.com
curl -I https://www.teqmates.com/dashboard
curl -I https://www.teqmates.com/userend
```

### 4. Check Logs
```bash
# API logs
sudo journalctl -u resort-api -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log

# Access logs
sudo tail -f /var/log/nginx/access.log
```

---

## 🐛 Troubleshooting

### Common Issues and Solutions

**1. 502 Bad Gateway**
```bash
# Check if API service is running
sudo systemctl status resort-api
sudo systemctl restart resort-api
```

**2. Database Connection Error**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql
# Check database credentials in .env file
```

**3. Static Files Not Loading**
```bash
# Check file permissions
ls -la /var/www/teqmates.com/
sudo chown -R www-data:www-data /var/www/teqmates.com/
```

**4. CORS Errors**
- Update CORS_ORIGINS in `.env` file
- Restart API service

**5. React Router 404 Errors**
- Ensure `try_files` directive in nginx.conf
- Check React Router basename configuration

---

## 📊 Monitoring Commands

```bash
# System resources
htop
df -h

# Service logs
sudo journalctl -u resort-api --since "1 hour ago"
sudo journalctl -u nginx --since "1 hour ago"

# Database performance
sudo -u postgres psql resort_db -c "SELECT * FROM pg_stat_activity;"

# Nginx status
sudo systemctl status nginx
```

---

## 🔄 Updates and Maintenance

### Deploy Updates
```bash
cd /var/www/teqmates.com
sudo git pull origin main
sudo systemctl restart resort-api
sudo systemctl reload nginx
```

### Database Backup
```bash
sudo -u postgres pg_dump resort_db > backup_$(date +%Y%m%d).sql
```

### Log Rotation
```bash
# Setup logrotate for application logs
sudo nano /etc/logrotate.d/resort-api
```

---

## 🆘 Support

If you encounter issues:

1. **Check logs** using the monitoring commands above
2. **Verify configuration** files match the examples
3. **Test individual components** (database, API, nginx)
4. **Review firewall settings** if using UFW
5. **Check DNS propagation** using `nslookup teqmates.com`

**Need help?** Create an issue in your GitHub repository with:
- Error messages from logs
- Configuration files (without sensitive data)
- Steps taken to reproduce the issue

---

**🎉 Congratulations!** Your Resort Management System should now be live at:
- **Landing**: https://www.teqmates.com
- **Dashboard**: https://www.teqmates.com/dashboard  
- **User Portal**: https://www.teqmates.com/userend
- **API Docs**: https://www.teqmates.com/api/docs