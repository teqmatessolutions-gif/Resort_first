# How to Run the Resort Management System

## 🚀 Quick Start (Local Development - Windows)

### Prerequisites
- Python 3.11+ installed
- Node.js 16+ and npm installed
- PostgreSQL database running (or configure SQLite for development)

### Step 1: Setup Backend (FastAPI)

```powershell
# Navigate to backend directory
cd ResortApp

# Create virtual environment
python -m venv env

# Activate virtual environment
.\env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy .env.example to .env and configure database
# Edit .env file with your database credentials

# Run database migrations (if using Alembic)
alembic upgrade head

# Start the backend server
python main.py
# OR
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run on: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### Step 2: Setup Frontend Dashboard (React)

Open a new terminal window:

```powershell
# Navigate to dashboard directory
cd dasboard

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm start
```

Dashboard will run on: `http://localhost:3000/admin`

### Step 3: Setup Landing Page (Static HTML)

The landing page is served by the FastAPI backend at `/` route.
Just ensure the `landingpage` folder is in the project root.

---

## 🌐 Running on Server (Linux)

### Step 1: Connect to Server

```bash
ssh root@139.84.211.200
# OR use your web console
```

### Step 2: Navigate to Project

```bash
cd /var/www/resort/Resort_first
```

### Step 3: Pull Latest Changes

```bash
git pull origin main
```

### Step 4: Setup/Start Backend

```bash
cd ResortApp

# Activate virtual environment (if using venv)
source env/bin/activate
# OR if using system venv
source /var/www/resort/venv/bin/activate

# Install/update dependencies (if needed)
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Check if backend is already running
ps aux | grep uvicorn
ps aux | grep gunicorn

# If using systemd service (check service name)
sudo systemctl list-units | grep resort
sudo systemctl list-units | grep uvicorn

# Restart backend (try these commands based on your setup)
sudo systemctl restart resort  # if service exists
# OR
sudo systemctl restart resort-backend
# OR if running with supervisor
sudo supervisorctl restart resort
sudo supervisorctl restart all
# OR start manually
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 &
# OR with gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 &
```

### Step 5: Build and Deploy Dashboard

```bash
cd ../dasboard

# Install dependencies with legacy peer deps to fix TypeScript conflict
npm install --legacy-peer-deps

# Build production version
npm run build

# Copy build files to nginx directory (adjust path based on your setup)
sudo cp -r build/* /var/www/resort/dashboard/
# OR if served by FastAPI
# The build is automatically served if dasboard/build exists

# Restart nginx (if using nginx)
sudo systemctl restart nginx
```

### Step 6: Verify Services

```bash
# Check backend health
curl http://localhost:8000/health
curl http://localhost:8000/api/health

# Check if services are running
sudo systemctl status resort
sudo systemctl status nginx

# Check running processes
ps aux | grep uvicorn
ps aux | grep gunicorn
ps aux | grep node
```

---

## 🔧 Troubleshooting

### Backend Issues

**Problem:** Module not found
```bash
# Ensure virtual environment is activated
source env/bin/activate  # Linux
.\env\Scripts\activate   # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

**Problem:** Database connection error
```bash
# Check .env file has correct database credentials
# Ensure PostgreSQL is running
sudo systemctl status postgresql  # Linux
```

**Problem:** Port 8000 already in use
```bash
# Find process using port 8000
lsof -i :8000  # Linux
netstat -ano | findstr :8000  # Windows

# Kill the process or use different port
uvicorn app.main:app --port 8001
```

### Frontend Issues

**Problem:** npm install fails with TypeScript conflict
```bash
# Use legacy peer deps flag
npm install --legacy-peer-deps
```

**Problem:** Build fails
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

**Problem:** Can't connect to API
```bash
# Check backend is running
curl http://localhost:8000/health

# Update API base URL in dasboard/src/services/api.js
# For production: "https://www.teqmates.com/api"
# For local: "http://localhost:8000/api"
```

---

## 📝 Environment Variables

Create a `.env` file in `ResortApp/` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/resort_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## 🎯 Access Points

Once running:

- **Landing Page:** http://localhost:8000/ (or www.teqmates.com)
- **Admin Dashboard:** http://localhost:8000/admin (or www.teqmates.com/admin)
- **API Documentation:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health
- **API Base:** http://localhost:8000/api

---

## ✅ Verification Checklist

- [ ] Backend is running (check port 8000)
- [ ] Database is connected
- [ ] Frontend is built and accessible
- [ ] API endpoints are responding
- [ ] Can login to admin dashboard
- [ ] Landing page loads correctly

