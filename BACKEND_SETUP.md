# Backend Setup - Quick Fix

## 🐛 Current Issue

The backend is failing because SQLite doesn't support PostgreSQL's ARRAY type. I've fixed this in the code.

## ✅ What Was Fixed

1. Changed `permissions` column from `ARRAY(String)` to `Text`
2. Updated role creation/update to store permissions as JSON strings
3. This makes it compatible with both SQLite and PostgreSQL

## 🚀 Solution

### Option 1: Quick Restart (Recommended)

**Stop the current backend:**
- Find the terminal running the backend
- Press `Ctrl+C` to stop it

**Restart it:**
```bash
cd C:\Resort\latest\Resort_first\ResortApp
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The database will be automatically recreated with the correct schema.

### Option 2: Manual Database Reset

If the backend won't stop:

1. **Close all Python processes:**
   ```powershell
   Stop-Process -Name python -Force
   ```

2. **Delete the database:**
   ```powershell
   cd C:\Resort\latest\Resort_first\ResortApp
   Remove-Item resort.db -ErrorAction SilentlyContinue
   ```

3. **Start backend:**
   ```bash
   python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

## 📋 Next Steps After Backend Starts

### 1. Verify Backend is Running

Check: http://localhost:8000/docs

You should see the API documentation.

### 2. Create Admin User

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/users/setup-admin" `
     -Method POST `
     -ContentType "application/json" `
     -Body '{"name": "Admin User", "email": "admin@teqmates.com", "password": "admin123", "phone": "+1234567890"}'
```

### 3. Login to Dashboard

- URL: http://localhost:3000/admin
- Email: admin@teqmates.com
- Password: admin123

## 🎯 Quick Commands

**Start Backend:**
```bash
cd C:\Resort\latest\Resort_first\ResortApp
python -m uvicorn main:app --reload
```

**Check if Running:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing
```

**Create Admin:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/users/setup-admin" -Method POST -ContentType "application/json" -Body '{"name": "Admin", "email": "admin@teqmates.com", "password": "admin123", "phone": "+1234567890"}'
```

## ✅ What Should Work Now

1. ✅ Backend starts without errors
2. ✅ Database creates with correct schema
3. ✅ Admin user can be created
4. ✅ Dashboard login works
5. ✅ All dashboard features accessible

---

**Just restart the backend and everything should work!** 🎉

