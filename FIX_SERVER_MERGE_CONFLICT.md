# Fix Server Merge Conflict for Landing Page Deployment

## Problem:
Server has local changes to `landingpage/assets/css/main.css` and `landingpage/index.html` that conflict with remote changes.

## Solution Options:

### Option 1: Stash Local Changes (Recommended if you want to keep them)
```bash
cd /var/www/resort/Resort_first
git stash
git pull origin main
git stash pop  # This will reapply your local changes (may have conflicts)
```

### Option 2: Discard Local Changes and Use Remote Version (Recommended)
```bash
cd /var/www/resort/Resort_first
git reset --hard HEAD
git pull origin main
```

### Option 3: Force Pull (Overwrites local changes)
```bash
cd /var/www/resort/Resort_first
git fetch origin
git reset --hard origin/main
```

## Complete Deployment Command (Option 2 - Recommended):

```bash
cd /var/www/resort/Resort_first && git reset --hard HEAD && git pull origin main && sudo chown -R www-data:www-data landingpage/ && sudo chmod -R 755 landingpage/ && sudo systemctl restart nginx && echo "✅ Landing page deployed successfully!"
```

## Complete Deployment Command (Option 3 - Force):

```bash
cd /var/www/resort/Resort_first && git fetch origin && git reset --hard origin/main && sudo chown -R www-data:www-data landingpage/ && sudo chmod -R 755 landingpage/ && sudo systemctl restart nginx && echo "✅ Landing page deployed successfully!"
```

## Step-by-Step (Recommended):

```bash
# 1. Navigate to project directory
cd /var/www/resort/Resort_first

# 2. Check what local changes exist
git status

# 3. Discard local changes (use remote version)
git reset --hard HEAD

# 4. Pull latest changes from GitHub
git pull origin main

# 5. Verify files are updated
ls -la landingpage/index.html
ls -la landingpage/assets/css/main.css

# 6. Set correct permissions
sudo chown -R www-data:www-data landingpage/
sudo chmod -R 755 landingpage/

# 7. Restart nginx
sudo systemctl restart nginx

# 8. Verify deployment
sudo systemctl status nginx
```

