# Dashboard Login Guide

## 🚀 Quick Start

### 1. Start the Backend Server (Required First!)

The backend API must be running for authentication to work.

**Terminal 1 - Start Backend:**
```bash
cd C:\Resort\latest\Resort_first\ResortApp
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### 2. Start the Dashboard (Already Running!)

The dashboard should already be running on:
```
http://localhost:3000/admin
```

### 3. Login Credentials

**If Admin User Exists:**
Use the credentials that were created during setup.

**If No Admin User Exists Yet:**

You need to create an admin user via the API:

```bash
# Open a new terminal
curl -X POST "http://localhost:8000/api/users/setup-admin" \
     -H "Content-Type: application/json" \
     -d "{
       \"name\": \"Admin User\",
       \"email\": \"admin@teqmates.com\",
       \"password\": \"admin123\",
       \"phone\": \"+1234567890\"
     }"
```

Or use PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/users/setup-admin" `
     -Method POST `
     -ContentType "application/json" `
     -Body '{
       "name": "Admin User",
       "email": "admin@teqmates.com",
       "password": "admin123",
       "phone": "+1234567890"
     }'
```

### 4. Login to Dashboard

1. Go to: `http://localhost:3000/admin`
2. Enter credentials:
   - **Email:** admin@teqmates.com
   - **Password:** admin123
3. Click "Sign In"
4. You should be redirected to the dashboard!

---

## ✅ Test Credentials

**Email:** `admin@teqmates.com`  
**Password:** `admin123`

---

## 🐛 Troubleshooting

### "Login failed" Error

**Cause 1: Backend Not Running**
- Solution: Start the backend on port 8000 (see Step 1 above)

**Cause 2: No Admin User Created**
- Solution: Create admin user via API (see Step 3 above)

**Cause 3: Wrong Credentials**
- Solution: Use the correct email and password

**Cause 4: Database Not Connected**
- Solution: Make sure PostgreSQL is running and configured

### Check if Backend is Running

```bash
# PowerShell
Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing

# Should return: {"status": "healthy"}
```

### Check Database Connection

```bash
cd ResortApp
python -c "from app.database import engine; engine.connect()"
```

---

## 📋 Complete Testing Workflow

### Terminal 1: Backend Server
```bash
cd C:\Resort\latest\Resort_first\ResortApp
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2: Dashboard (Already Running)
```bash
cd C:\Resort\latest\Resort_first\dasboard
npm start
# Should be at http://localhost:3000/admin
```

### Create Admin User (If Needed)
```powershell
# One-time setup to create admin user
Invoke-RestMethod -Uri "http://localhost:8000/api/users/setup-admin" `
     -Method POST `
     -ContentType "application/json" `
     -Body '{"name": "Admin User", "email": "admin@teqmates.com", "password": "admin123", "phone": "+1234567890"}'
```

### Login
1. Open: `http://localhost:3000/admin`
2. Email: `admin@teqmates.com`
3. Password: `admin123`
4. Click "Sign In"

---

## 🎯 What to Test After Login

1. ✅ **Dashboard Overview** - Stats and charts
2. ✅ **Rooms Management** - Add, edit, delete rooms
3. ✅ **Bookings** - Create and manage bookings
4. ✅ **Employees** - Manage staff
5. ✅ **Food Management** - Categories, items, orders
6. ✅ **Payments** - Process payments
7. ✅ **Reports** - Generate reports

See `DASHBOARD_TESTING_GUIDE.md` for complete testing checklist.

---

## 🔧 Quick Commands Reference

### Check Backend Status
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing
```

### Check Backend Logs
```bash
# Look at terminal where backend is running
```

### Restart Backend
```bash
# Press Ctrl+C to stop
# Then run: python -m uvicorn main:app --reload
```

### Restart Dashboard
```bash
# Press Ctrl+C to stop
# Then run: npm start
```

---

## 📞 Still Having Issues?

1. **Backend not running?**
   - Go to `ResortApp` directory
   - Run: `python -m uvicorn main:app --reload`

2. **Can't create admin user?**
   - Check if database is running
   - Check if tables exist
   - Check backend logs for errors

3. **Login still fails?**
   - Open browser console (F12)
   - Check Network tab for API call
   - Look for error messages

---

## ✅ Success Indicators

When everything works:
- ✅ Backend shows "Application startup complete"
- ✅ Dashboard shows login page
- ✅ Login button works
- ✅ You're redirected to dashboard
- ✅ No console errors
- ✅ Token stored in localStorage

---

**Ready to Test!** 🎉

Follow the steps above and you should be able to login and test all dashboard functionality.

