# Fix GitHub Push Permission Issue

## Problem
Your account `basilabraham44` doesn't have push permission to `teqmatessolutions-gif/Resort_first`

## Solutions:

### Solution 1: Get Added to Repository (Recommended)
Ask the repository owner to:
1. Add your GitHub username `basilabraham44` as collaborator
2. Go to: https://github.com/teqmatessolutions-gif/Resort_first/settings/collaboration
3. Add your account with "Write" permission

### Solution 2: Use Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Generate new token (Classic)
3. Check permissions: `repo`
4. Copy the token
5. Use it to push:

```powershell
git push https://YOUR_TOKEN@github.com/teqmatessolutions-gif/Resort_first.git main
```

### Solution 3: Switch to SSH Remote (If You Have SSH Key on GitHub)
```powershell
git remote set-url origin git@github.com:teqmatessolutions-gif/Resort_first.git
git push origin main
```

---

## FASTEST SOLUTION: Manually Deploy Files

Since you're already connected to the server, just edit files directly!

### On Server (CMD window), run:

```bash
# Edit landing page CSS to hide button
nano /var/www/resort/Resort_first/landingpage/assets/css/main.css
```

Find line ~919 with `.hero .btn-watch-video {` and add:
```
display: none;
```

Save: Ctrl+X, Y, Enter

Then restart:
```bash
sudo systemctl restart nginx
```

### OR Use Git but copy specific files from local:

Since you have server access via CMD, you can use `scp` from a new CMD window with your password `4bE!beciK#deo-_w`

