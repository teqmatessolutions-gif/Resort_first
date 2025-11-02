# 🚀 Deploy 500 Error Fixes to Production - IMMEDIATE

## Quick Deployment Steps

### Option 1: Using Deployment Script (Recommended)

**On the server (via SSH):**

```bash
cd /var/www/resort/Resort_first
chmod +x deploy_fix_500.sh
./deploy_fix_500.sh
```

### Option 2: Manual Deployment

**Step 1: Connect to Server**
```bash
ssh root@139.84.211.200
```

**Step 2: Navigate to Project Directory**
```bash
cd /var/www/resort/Resort_first
```

**Step 3: Pull Latest Changes**
```bash
git pull origin main
```

**If you encounter conflicts:**
```bash
git reset --hard HEAD
git pull origin main
```

**Step 4: Restart Backend Service**
```bash
sudo systemctl restart resort.service
```

**Step 5: Verify Service is Running**
```bash
sudo systemctl status resort.service
```

**Step 6: Check Logs**
```bash
sudo journalctl -u resort.service -n 50 --no-pager
```

## What's Being Deployed

✅ Simplified SQLAlchemy filter queries (removed `and_()` usage)  
✅ Comprehensive error handling with try-except blocks  
✅ Race condition handling in user creation  
✅ Database rollback on errors  
✅ Detailed error logging with traceback  
✅ Improved email/mobile normalization  
✅ Fixed return value issues  

## Verification

After deployment, test by:

1. **Try creating a booking** via https://www.teqmates.com/resort/
2. **Check if 500 error is resolved**
3. **Monitor logs** for any errors:
   ```bash
   sudo journalctl -u resort.service -f
   ```

## Troubleshooting

### If service won't start:
```bash
# Check for Python syntax errors
cd /var/www/resort/Resort_first/ResortApp
python3 -m py_compile app/api/booking.py
python3 -m py_compile app/curd/packages.py

# Check backend logs
sudo journalctl -u resort.service -n 100 --no-pager | grep -i error
```

### If 500 error persists:
```bash
# Get detailed error from logs
sudo journalctl -u resort.service -n 200 --no-pager | grep -A 20 "Error in"
```

---

**Ready to deploy!** Run the commands above on your server.
