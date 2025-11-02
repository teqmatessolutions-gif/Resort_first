# Fix Server Deployment Issues

## Issue 1: npm install TypeScript Conflict

The server has TypeScript 5.9.3 but react-scripts@5.0.1 requires TypeScript ^3.2.1 || ^4

**Solution:** Use `--legacy-peer-deps` flag

```bash
cd dasboard
npm install --legacy-peer-deps
npm run build
```

## Issue 2: Backend Service Not Found

The service names might be different. Check what services are running:

```bash
# Check if backend is running via uvicorn directly
ps aux | grep uvicorn

# Check systemd services
sudo systemctl list-units | grep resort
sudo systemctl list-units | grep uvicorn
sudo systemctl list-units | grep fastapi

# Check supervisor processes
sudo supervisorctl status
```

## Complete Deployment Commands

```bash
# 1. Navigate to project
cd /var/www/resort/Resort_first

# 2. Pull latest changes (already done)
git pull origin main

# 3. Restart backend (try different approaches)
# Option A: If using systemd with different name
sudo systemctl restart uvicorn
sudo systemctl restart fastapi
sudo systemctl restart gunicorn

# Option B: If running directly via uvicorn
# Find the process and restart it
pkill -f uvicorn
cd ResortApp
source env/bin/activate  # or venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 &

# Option C: If using supervisor with different name
sudo supervisorctl restart all
sudo supervisorctl restart uvicorn
sudo supervisorctl restart fastapi

# 4. Install dashboard dependencies with legacy peer deps
cd ../dasboard
npm install --legacy-peer-deps

# 5. Build dashboard
npm run build

# 6. Copy build files to nginx directory
sudo cp -r build/* /var/www/resort/dashboard/

# OR restart dashboard service if using systemd
sudo systemctl restart nginx
```

## Verify Deployment

```bash
# Check backend is running
curl http://localhost:8000/api/health  # or your health endpoint

# Check if build was successful
ls -la dasboard/build/

# Check nginx is serving dashboard
curl http://localhost/dashboard/
```

