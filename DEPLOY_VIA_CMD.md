# ✅ Keep Using CMD - It's Working!

## Why Cursor Terminal Doesn't Work:
- **Cursor uses PowerShell** which handles SSH password prompts differently
- **CMD uses native SSH** which handles interactive password better
- Your CMD connection is working perfectly! ✅

## Continue in Your CMD Window

You're logged in as: `root@techmates`

Run these commands in your CMD window:

---

## COMMAND 1: Fix Browserslist Conflict
```bash
rm /var/www/resort/Resort_first/dasboard/.browserslistrc
```

---

## COMMAND 2: Pull Latest Changes (Landing Page + Dashboard)
```bash
cd /var/www/resort/Resort_first && git pull origin main
```

---

## COMMAND 3: Rebuild Dashboard
```bash
cd /var/www/resort/Resort_first/dasboard && npm run build
```

---

## COMMAND 4: Restart Services
```bash
cd /var/www/resort/Resort_first && sudo systemctl restart resort.service && sudo systemctl restart nginx
```

---

## COMMAND 5: Verify Services
```bash
sudo systemctl status resort.service
```

Press **q** to quit

---

## ✅ What's Being Deployed:

1. **Landing Page Fixes:**
   - Hidden "Our Process" button
   - Enhanced Request Call Back modal (gradient design)
   - Fixed callback/contact forms (Gmail integration)
   - Fixed spelling "Serices" → "Services"

2. **Dashboard Fix:**
   - Fixed API baseURL (now includes `/api`)

---

## After Deployment:

Visit: **https://www.teqmates.com**

Test the landing page to see the changes live!


