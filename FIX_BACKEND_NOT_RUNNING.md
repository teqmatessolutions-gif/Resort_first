# Fix Backend Service Not Running

## Current Status
- Git pull successful ✅
- `resort.service` exists and is loaded
- Backend process not running (uvicorn not found)
- Port 8000 not accessible

## Steps to Fix

### 1. Check Service Status
```bash
sudo systemctl status resort.service
```

### 2. Check if Service is Enabled
```bash
sudo systemctl is-enabled resort.service
```

### 3. Start/Restart the Service
```bash
# Start the service
sudo systemctl start resort.service

# OR restart if already running
sudo systemctl restart resort.service

# Check status again
sudo systemctl status resort.service
```

### 4. Check Service Logs for Errors
```bash
sudo journalctl -u resort.service -n 50 --no-pager
```

### 5. Check Service Configuration
```bash
cat /etc/systemd/system/resort.service
# OR
cat /lib/systemd/system/resort.service
```

### 6. If Service Fails, Check the Actual Process
```bash
# Check if Python/FastAPI is running
ps aux | grep python
ps aux | grep fastapi
ps aux | grep uvicorn
ps aux | grep gunicorn

# Check which ports are in use
netstat -tulpn | grep 8000
# OR
ss -tulpn | grep 8000
```

### 7. Manual Start (for testing)
```bash
cd /var/www/resort/Resort_first/ResortApp

# Check if virtualenv exists
ls -la env/

# Activate virtualenv and check if dependencies are installed
source env/bin/activate
pip list | grep fastapi
pip list | grep uvicorn

# Try manual start to see errors
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 8. Fix Common Issues

#### If virtualenv path is wrong in service file:
```bash
# Edit service file
sudo nano /etc/systemd/system/resort.service

# Update ExecStart path to correct virtualenv location
# Example:
# ExecStart=/var/www/resort/Resort_first/ResortApp/env/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
# WorkingDirectory=/var/www/resort/Resort_first/ResortApp

# Reload systemd and restart
sudo systemctl daemon-reload
sudo systemctl restart resort.service
```

#### If dependencies are missing:
```bash
cd /var/www/resort/Resort_first/ResortApp
source env/bin/activate
pip install -r requirements.txt
```

#### If port is already in use:
```bash
# Find what's using port 8000
lsof -i :8000
# OR
fuser 8000/tcp
# Kill the process if needed
kill -9 <PID>
```

### 9. Verify Backend is Running
```bash
# Check service status
sudo systemctl status resort.service

# Check process
ps aux | grep uvicorn

# Test API
curl http://localhost:8000/api/bill/active-rooms
curl http://localhost:8000/docs
```

## Quick Fix Commands (Run in Order)

```bash
# 1. Check status
sudo systemctl status resort.service

# 2. Start service
sudo systemctl start resort.service

# 3. Enable to start on boot
sudo systemctl enable resort.service

# 4. Check if running
ps aux | grep uvicorn

# 5. Test API
curl http://localhost:8000/api/bill/active-rooms

# 6. Check logs if errors
sudo journalctl -u resort.service -f
```

