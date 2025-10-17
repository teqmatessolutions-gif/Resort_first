# 🏨 Resort Management System

A comprehensive full-stack Resort Management System built with FastAPI, React, and PostgreSQL. This system provides complete management capabilities for resort operations including room bookings, package management, food services, employee management, and financial tracking.

## 🌐 Live Demo
- **Landing Page**: [https://www.teqmates.com](https://www.teqmates.com)
- **Admin Dashboard**: [https://www.teqmates.com/dashboard](https://www.teqmates.com/dashboard)
- **User Portal**: [https://www.teqmates.com/userend](https://www.teqmates.com/userend)

## 🚀 Features

### 🏠 **Core Management**
- **Room Management**: Create, update, and manage room inventory with pricing and availability
- **Booking System**: Complete reservation management with check-in/check-out functionality
- **Package Management**: Holiday packages with customizable pricing and inclusions
- **Guest Management**: Comprehensive guest profiles with booking history

### 🍽️ **Restaurant & Services**
- **Food Management**: Menu categories, items, and pricing
- **Room Service**: In-room dining order management
- **Service Booking**: Spa, activities, and additional services
- **Inventory Tracking**: Food and service inventory management

### 👥 **User & Staff Management**
- **Role-Based Access Control**: Admin, Manager, Staff, and Guest roles
- **Employee Management**: Staff profiles, attendance, and performance tracking
- **User Authentication**: Secure JWT-based authentication system
- **Permission Management**: Granular permission control

### 💰 **Financial Management**
- **Billing System**: Automated invoice generation
- **Payment Processing**: Multiple payment gateway integration
- **Expense Tracking**: Operational expense management
- **Financial Reporting**: Revenue, profit, and analytics dashboards

### 📊 **Analytics & Reporting**
- **Dashboard Analytics**: Real-time business metrics
- **Comprehensive Reports**: PDF and Excel export capabilities
- **Revenue Tracking**: Daily, monthly, and yearly revenue reports
- **Occupancy Analytics**: Room utilization and booking trends

## 🛠️ Technology Stack

### **Backend**
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT tokens
- **File Storage**: Local file system with image optimization
- **API Documentation**: Swagger/OpenAPI

### **Frontend**
- **Admin Dashboard**: React 18 with Tailwind CSS
- **User Interface**: React with modern UI components
- **Charts & Analytics**: Chart.js, Recharts
- **PDF Generation**: jsPDF with auto-table
- **State Management**: React Hooks

### **Landing Page**
- **Framework**: Static HTML5/CSS3/JavaScript
- **Template**: FlexStart Bootstrap template
- **Animations**: CSS animations with bubble effects
- **Responsive**: Mobile-first design

## 📁 Project Structure

```
Resort_first/
├── ResortApp/                 # FastAPI Backend
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── models/           # Database models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── curd/             # Database operations
│   │   └── utils/            # Utility functions
│   ├── alembic/              # Database migrations
│   ├── uploads/              # File storage
│   └── main.py               # Application entry point
├── dasboard/                 # Admin React Dashboard
│   ├── src/
│   │   ├── pages/           # React pages
│   │   ├── components/      # Reusable components
│   │   └── utils/           # Helper functions
│   └── public/              # Static assets
├── userend/                  # User React Application
│   └── userend/
│       ├── src/
│       └── public/
├── landingpage/              # Static Landing Page
│   ├── assets/              # Images, CSS, JS
│   └── index.html           # Main landing page
└── deployment/              # Deployment configurations
```

## 🔧 Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 13+
- Git

### 1. Clone Repository
```bash
git clone https://github.com/teqmatessolutions-gif/Resort_first.git
cd Resort_first
```

### 2. Backend Setup
```bash
cd ResortApp

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your database and configuration details

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn main:app --reload --port 8000
```

### 3. Admin Dashboard Setup
```bash
cd dasboard

# Install dependencies
npm install

# Start development server
npm start
# Dashboard will be available at http://localhost:3000
```

### 4. User Frontend Setup
```bash
cd userend/userend

# Install dependencies
npm install

# Start development server
npm start
# User portal will be available at http://localhost:3001
```

## 🌐 Deployment on Vultr

### Step-by-Step Deployment Guide

#### 1. **Create Vultr VPS**
```bash
# Recommended specs:
# - Ubuntu 22.04 LTS
# - 2 CPU cores
# - 4GB RAM
# - 80GB SSD
# - Location: Choose nearest to your users
```

#### 2. **Initial Server Setup**
```bash
# Connect to your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install required software
apt install -y nginx postgresql postgresql-contrib python3-pip nodejs npm git certbot python3-certbot-nginx

# Create application user
useradd -m -s /bin/bash appuser
usermod -aG sudo appuser
```

#### 3. **Setup Database**
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE resort_db;
CREATE USER resort_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE resort_db TO resort_user;
\q
```

#### 4. **Deploy Application**
```bash
# Switch to app user
su - appuser

# Clone repository
cd /var/www
sudo git clone https://github.com/teqmatessolutions-gif/Resort_first.git teqmates.com
sudo chown -R appuser:appuser teqmates.com
cd teqmates.com

# Setup backend
cd ResortApp
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env  # Update with production values

# Run migrations
alembic upgrade head

# Build frontend applications
cd ../dasboard
npm install
npm run build

cd ../userend/userend
npm install
npm run build
```

#### 5. **Configure Nginx**
```bash
# Copy nginx configuration
sudo cp /var/www/teqmates.com/deployment/nginx.conf /etc/nginx/sites-available/teqmates.com

# Enable site
sudo ln -s /etc/nginx/sites-available/teqmates.com /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

#### 6. **Setup SSL Certificate**
```bash
# Get SSL certificate
sudo certbot --nginx -d teqmates.com -d www.teqmates.com

# Test auto-renewal
sudo certbot renew --dry-run
```

#### 7. **Setup System Service**
```bash
# Copy service file
sudo cp /var/www/teqmates.com/deployment/resort-api.service /etc/systemd/system/

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable resort-api
sudo systemctl start resort-api

# Check status
sudo systemctl status resort-api
```

#### 8. **Setup File Permissions**
```bash
# Create necessary directories
sudo mkdir -p /var/www/teqmates.com/uploads
sudo mkdir -p /var/www/teqmates.com/logs

# Set permissions
sudo chown -R www-data:www-data /var/www/teqmates.com
sudo chmod -R 755 /var/www/teqmates.com
sudo chmod -R 775 /var/www/teqmates.com/uploads
sudo chmod -R 775 /var/www/teqmates.com/logs
```

### 🔧 **Production Environment Variables**
Create `/var/www/teqmates.com/ResortApp/.env`:
```env
DATABASE_URL=postgresql://resort_user:your_secure_password@localhost:5432/resort_db
SECRET_KEY=your-super-secret-jwt-key-change-this
CORS_ORIGINS=["https://teqmates.com", "https://www.teqmates.com"]
ENVIRONMENT=production
DEBUG=False
```

## 📡 API Documentation

Once deployed, API documentation is available at:
- **Swagger UI**: `https://www.teqmates.com/api/docs`
- **ReDoc**: `https://www.teqmates.com/api/redoc`

### Key API Endpoints
```
POST /api/auth/login          # User authentication
GET  /api/rooms              # List available rooms
POST /api/bookings           # Create booking
GET  /api/packages           # List packages
POST /api/food-orders        # Create food order
GET  /api/dashboard/stats    # Dashboard analytics
```

## 🔐 Security Features

- **JWT Authentication** with secure token handling
- **Role-Based Access Control** (RBAC)
- **Input Validation** with Pydantic schemas
- **SQL Injection Protection** via SQLAlchemy ORM
- **HTTPS Enforcement** with SSL certificates
- **CORS Protection** for cross-origin requests
- **Rate Limiting** on API endpoints
- **Secure Headers** via Nginx configuration

## 🧪 Testing

```bash
# Backend tests
cd ResortApp
python -m pytest tests/

# Frontend tests
cd dasboard
npm test

cd ../userend/userend
npm test
```

## 📊 Monitoring & Logs

### Log Files Location:
- **Nginx Logs**: `/var/log/nginx/`
- **Application Logs**: `/var/www/teqmates.com/logs/`
- **System Logs**: `/var/log/syslog`

### Monitoring Commands:
```bash
# Check API service status
sudo systemctl status resort-api

# View API logs
sudo journalctl -u resort-api -f

# Monitor nginx logs
sudo tail -f /var/log/nginx/error.log

# Check system resources
htop
df -h
```

## 🚀 Performance Optimization

- **Database Indexing** on frequently queried fields
- **Static File Caching** via Nginx
- **Gzip Compression** for web assets
- **CDN Ready** for static asset delivery
- **Database Connection Pooling**
- **API Response Caching**

## 🔄 Backup & Maintenance

### Database Backup:
```bash
# Create backup
sudo -u postgres pg_dump resort_db > backup_$(date +%Y%m%d).sql

# Restore from backup
sudo -u postgres psql resort_db < backup_20241201.sql
```

### Application Updates:
```bash
# Pull latest changes
cd /var/www/teqmates.com
sudo git pull origin main

# Restart services
sudo systemctl restart resort-api
sudo systemctl reload nginx
```

## 🤝 Contributing

1. Fork the repository at https://github.com/teqmatessolutions-gif/Resort_first
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

- **Email**: support@teqmates.com
- **Website**: [https://www.teqmates.com](https://www.teqmates.com)
- **Documentation**: [API Docs](https://www.teqmates.com/api/docs)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FastAPI** for the excellent Python web framework
- **React** for the powerful frontend library
- **Bootstrap** for the responsive UI components
- **PostgreSQL** for robust database management
- **Vultr** for reliable cloud hosting

---

**Made with ❤️ by TeqMates Team**