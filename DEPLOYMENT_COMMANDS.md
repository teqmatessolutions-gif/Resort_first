# Production Deployment Commands - Complete Sequence

## Step 1: Update Python Dependencies (Backend)

```bash
cd /var/www/resort/Resort_first/ResortApp
source venv/bin/activate
git pull origin main
pip install -r requirements_production.txt
```

## Step 2: Build Dashboard Frontend

```bash
cd /var/www/resort/Resort_first/dasboard
npm install --legacy-peer-deps
npm run build
```

## Step 3: Build Userend Frontend

```bash
cd /var/www/resort/Resort_first/userend/userend
npm install
npm run build
```

## Step 4: Restart Services

```bash
cd /var/www/resort/Resort_first/ResortApp
sudo systemctl restart resort.service
sudo systemctl restart nginx
```

## Step 5: Verify Deployment

```bash
# Check service status
sudo systemctl status resort.service

# Check logs
sudo journalctl -u resort.service -n 50

# Test URLs
# - https://www.teqmates.com
# - https://www.teqmates.com/admin
# - https://www.teqmates.com/resort
```

## Quick One-Liner (After git pull)

```bash
cd /var/www/resort/Resort_first && \
cd ResortApp && source venv/bin/activate && pip install -r requirements_production.txt && \
cd ../dasboard && npm install --legacy-peer-deps && npm run build && \
cd ../userend/userend && npm install && npm run build && \
cd ../../ResortApp && sudo systemctl restart resort.service && sudo systemctl restart nginx
```

