# Update Existing Deployment - Step by Step

## You have an existing deployment, so we'll update it instead of cloning fresh.

## Step 1: Navigate to Existing Project

```bash
cd /var/www/resort/Resort_first
```

## Step 2: Pull Latest Changes

```bash
git pull origin main
```

If you get authentication errors, you might need to configure git or use a token.

## Step 3: Update Backend Dependencies

```bash
cd ResortApp
source venv/bin/activate
pip install -r requirements_production.txt
```

## Step 4: Rebuild Frontend Applications

```bash
# Rebuild Dashboard
cd ../../dasboard
npm install
npm run build

# Rebuild Userend
cd ../userend/userend
npm install
npm run build
```

## Step 5: Restart Services

```bash
sudo systemctl restart resort.service
sudo systemctl restart nginx
```

## Step 6: Verify Deployment

```bash
# Check service status
sudo systemctl status resort.service

# Check logs
sudo journalctl -u resort.service -n 50
```

## Step 7: Configure Email (if not already done)

```bash
sudo systemctl edit resort.service
```

Add email configuration and restart:
```bash
sudo systemctl daemon-reload
sudo systemctl restart resort.service
```

