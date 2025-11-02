# Deploy Latest Changes to Production Server

## Quick Deployment Commands

Execute these commands on your server (139.84.211.200) via SSH or Web Console:

### Step 1: Connect to Server
```bash
ssh root@139.84.211.200
# OR use Vultr Web Console
```

### Step 2: Navigate to Project
```bash
cd /var/www/resort/Resort_first
```

### Step 3: Pull Latest Changes
```bash
git pull origin main
```

### Step 4: Restart Backend Service
```bash
# Find your backend service name
sudo systemctl list-units | grep -E "resort|uvicorn|fastapi|gunicorn"

# Restart backend (try these commands based on your setup)
sudo systemctl restart resort
# OR
sudo systemctl restart resort-backend
# OR
sudo systemctl restart uvicorn
# OR if using supervisor
sudo supervisorctl restart resort
sudo supervisorctl restart all

# Verify backend is running
ps aux | grep uvicorn
ps aux | grep gunicorn
curl http://localhost:8000/health
```

### Step 5: Build and Deploy Frontend Dashboard
```bash
cd dasboard

# Install dependencies with legacy peer deps (fixes TypeScript conflict)
npm install --legacy-peer-deps

# Build production version
npm run build

# Copy build files (adjust path based on your setup)
# If served by FastAPI, build files are already in place
# If served by nginx, copy to nginx directory
sudo cp -r build/* /var/www/resort/dashboard/
sudo systemctl restart nginx
```

### Step 6: Verify Deployment
```bash
# Check backend health
curl http://localhost:8000/health
curl http://localhost:8000/api/bill/active-rooms

# Check if services are running
sudo systemctl status resort
sudo systemctl status nginx

# Check recent logs
sudo journalctl -u resort -n 50 --no-pager
```

## Complete One-Liner (if all commands work)

```bash
cd /var/www/resort/Resort_first && \
git pull origin main && \
cd ResortApp && \
sudo systemctl restart resort && \
cd ../dasboard && \
npm install --legacy-peer-deps && \
npm run build && \
sudo cp -r build/* /var/www/resort/dashboard/ && \
sudo systemctl restart nginx && \
echo "✅ Deployment complete!"
```

## Troubleshooting

### If npm install fails:
```bash
cd dasboard
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

### If backend won't restart:
```bash
# Find the actual process
ps aux | grep uvicorn
ps aux | grep gunicorn

# Kill and restart manually
pkill -f uvicorn
cd ResortApp
source env/bin/activate  # or /var/www/resort/venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 &
```

### If git pull fails:
```bash
# Check for conflicts
git status
git stash
git pull origin main
git stash pop  # if needed
```

## What Was Deployed

1. ✅ **Room Number Fix** - Proper null checks for room numbers in checkout
2. ✅ **Single/Multiple Room Checkout** - Both options now available
3. ✅ **Enhanced Error Handling** - Better error handling for room number extraction
4. ✅ **Documentation** - Deployment and run guides

## Testing After Deployment

1. Go to Billing page: https://www.teqmates.com/admin/billing
2. Check if room numbers appear in dropdown
3. Verify single room checkout option works
4. Verify multiple room checkout option works
5. Test bill generation for both modes

