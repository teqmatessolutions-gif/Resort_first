# Deploy Userend Currency Formatting Changes to Server

## Changes to Deploy:
- Added currency formatting utility with Indian Rupee symbol and comma separators
- Updated all price displays in userend to use formatted currency
- Amounts now display as "₹10,000" instead of "₹10000"

## Server Deployment Steps:

### Step 1: SSH into Server
```bash
ssh root@139.84.211.200
```

### Step 2: Navigate to Project Directory
```bash
cd /var/www/resort/Resort_first
```

### Step 3: Pull Latest Changes from GitHub
```bash
git reset --hard HEAD
git pull origin main
```

### Step 4: Navigate to Userend Directory
```bash
cd userend/userend
```

### Step 5: Install Dependencies (if needed)
```bash
npm install
```

### Step 6: Build Userend Frontend
```bash
npm run build
```

### Step 7: Verify Build Files
```bash
ls -la build/
ls -la build/index.html
ls -la build/static/
```

### Step 8: Restart Backend Service
```bash
cd /var/www/resort/Resort_first/ResortApp
sudo systemctl restart resort.service
```

### Step 9: Verify Backend is Running
```bash
sudo systemctl status resort.service
curl http://localhost:8000/resort
```

## Quick Deployment Command (All in One):
```bash
cd /var/www/resort/Resort_first && \
git reset --hard HEAD && \
git pull origin main && \
cd userend/userend && \
npm install && \
npm run build && \
cd ../../ResortApp && \
sudo systemctl restart resort.service && \
echo "✅ Userend currency formatting deployed successfully!"
```

## Files Modified:
- `userend/userend/src/utils/currency.js` - New currency formatting utility
- `userend/userend/src/App.js` - Updated all price displays to use formatCurrency()

## Verification Checklist:
- [ ] Userend build completes successfully
- [ ] Visit `https://www.teqmates.com/resort`
- [ ] Check package prices display with commas (e.g., ₹10,000)
- [ ] Check room prices display with commas (e.g., ₹1,000)
- [ ] All amounts are formatted with Indian Rupee symbol and comma separators

## Troubleshooting:

### If npm install fails:
```bash
# Try with legacy peer deps
npm install --legacy-peer-deps
```

### If build fails:
```bash
# Check for errors in build output
npm run build 2>&1 | tee build.log

# Check if all dependencies are installed
npm list --depth=0
```

### If backend doesn't serve userend:
```bash
# Check if userend build directory exists
ls -la /var/www/resort/Resort_first/userend/userend/build/

# Check backend logs
sudo journalctl -u resort.service -n 50 --no-pager
```

### Verify userend route in backend:
```bash
# The backend should serve userend at /resort route
# Check main.py to verify userend route configuration
cat ResortApp/main.py | grep -A 5 "resort"
```

