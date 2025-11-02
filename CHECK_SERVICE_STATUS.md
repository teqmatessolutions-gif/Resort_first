# Troubleshooting Service Failure

## The resort.service is failing to start. Check logs:

```bash
# Check detailed logs
sudo journalctl -u resort.service -n 50 --no-pager

# Or follow logs in real-time
sudo journalctl -u resort.service -f
```

## Common Issues and Fixes:

### 1. Python Module Import Error
If you see "ModuleNotFoundError" or import errors:
```bash
cd /var/www/resort/Resort_first/ResortApp
source venv/bin/activate
pip install -r requirements_production.txt
```

### 2. Database Connection Error
If database connection fails, check:
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database credentials in .env
cat /var/www/resort/Resort_first/ResortApp/.env | grep DATABASE
```

### 3. Port Already in Use
If port 8000 is already in use:
```bash
# Check what's using port 8000
sudo lsof -i :8000

# Or check gunicorn socket
ls -la /run/gunicorn.sock
```

### 4. Permission Issues
```bash
# Fix permissions
sudo chown -R www-data:www-data /var/www/resort
sudo chmod -R 755 /var/www/resort
```

### 5. Missing Email Module
If email module is missing, it should install with requirements_production.txt, but check:
```bash
cd /var/www/resort/Resort_first/ResortApp
source venv/bin/activate
python -c "from app.utils.email import send_email; print('Email module OK')"
```

## Quick Diagnostic Commands:

```bash
# 1. Check if Python environment works
cd /var/www/resort/Resort_first/ResortApp
source venv/bin/activate
python -c "from app.main import app; print('App imports OK')"

# 2. Test gunicorn manually
gunicorn app.main:app --workers 1 --bind 127.0.0.1:8000

# 3. Check systemd service file
cat /etc/systemd/system/resort.service
```

