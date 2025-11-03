# Quick Deploy Billing Filters - Manual Commands

Since the deployment script isn't on the server yet, use these manual commands:

## Step 1: Pull Latest Changes
```bash
cd /var/www/resort/Resort_first
git pull origin main
```

## Step 2: Build Frontend
```bash
cd dasboard
npm install --legacy-peer-deps
npm run build
sudo cp -r build/* /var/www/resort/admin/
```

## Step 3: Restart Backend
```bash
cd ../ResortApp
sudo systemctl restart resort.service
```

## Step 4: Verify
```bash
# Check service status
sudo systemctl status resort.service

# Check logs
sudo journalctl -u resort.service -n 50 --no-pager

# Test endpoint
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/bill/checkouts?skip=0&limit=20
```

## All-in-One Command
```bash
cd /var/www/resort/Resort_first && \
git pull origin main && \
cd dasboard && \
npm install --legacy-peer-deps && \
npm run build && \
sudo cp -r build/* /var/www/resort/admin/ && \
cd ../ResortApp && \
sudo systemctl restart resort.service && \
echo "✅ Deployment complete!" && \
sudo systemctl status resort.service
```

