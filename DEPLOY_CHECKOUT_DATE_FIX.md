# Deploy Checkout Date Logic Fix

## Changes Deployed
- Updated checkout date calculation logic
- Late checkout: uses actual checkout date (today) if later than booking checkout date
- Early checkout: uses booking checkout date if earlier than actual checkout
- Charges calculated based on effective checkout date

## Deployment Steps

### Option 1: SSH Access (if available)
```bash
ssh root@139.84.211.200
cd /var/www/resort/Resort_first
git pull origin main
cd ResortApp
sudo systemctl restart resort-backend
# OR check service name first:
sudo systemctl list-units | grep -E "resort|uvicorn|fastapi|gunicorn"
# Then restart the correct service
```

### Option 2: Web Console (Vultr/Server Provider)
1. Log into your server hosting control panel
2. Access Web Console/Terminal
3. Run the following commands:

```bash
cd /var/www/resort/Resort_first
git pull origin main
cd ResortApp
sudo systemctl restart resort-backend
```

### Option 3: Find and Restart Backend Service
```bash
# Find the correct service name
sudo systemctl list-units | grep -E "resort|uvicorn|fastapi|gunicorn"

# Common service names:
# - resort-backend.service
# - resort.service
# - uvicorn-resort.service
# - gunicorn-resort.service

# Restart the service (replace with actual name)
sudo systemctl restart <service-name>

# OR if using supervisor:
sudo supervisorctl restart resort
```

### Option 4: One-liner Command
```bash
cd /var/www/resort/Resort_first && git pull origin main && cd ResortApp && sudo systemctl restart resort-backend || sudo supervisorctl restart resort || echo "Please restart backend service manually"
```

## Verification Steps

1. **Check Backend Status:**
```bash
sudo systemctl status resort-backend
# OR
sudo systemctl status resort
# OR
ps aux | grep uvicorn
ps aux | grep gunicorn
```

2. **Test the API:**
```bash
curl http://localhost:8000/api/bill/active-rooms
# Should return active rooms list
```

3. **Check Logs (if any errors):**
```bash
sudo journalctl -u resort-backend -n 50 --no-pager
# OR
tail -f /var/log/resort/backend.log
```

## Expected Behavior After Deployment

✅ **Late Checkout**: If guest checks out after the booking checkout date, they are charged for the actual stay period (including extra days)

✅ **Early Checkout**: If guest checks out before the booking checkout date, they are still charged for the full booking period

✅ **Bill Summary**: Shows the effective checkout date used for calculation

## Troubleshooting

### If Backend Doesn't Restart:
1. Check service name: `sudo systemctl list-units | grep resort`
2. Check if service exists: `sudo systemctl status <service-name>`
3. Check Python process: `ps aux | grep python`
4. Kill and restart manually if needed:
   ```bash
   pkill -f "uvicorn app.main"
   cd /var/www/resort/Resort_first/ResortApp
   source env/bin/activate  # if using virtualenv
   nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 &
   ```

### If Changes Don't Appear:
1. Verify git pull succeeded: `git log -1`
2. Verify file changes: `git diff HEAD~1 ResortApp/app/api/checkout.py`
3. Clear Python cache: `find ResortApp -name "*.pyc" -delete`
4. Restart service again

## Notes
- Frontend (dashboard) doesn't need rebuilding for this change
- This is a backend-only change
- No database migrations required
- Changes take effect immediately after service restart

