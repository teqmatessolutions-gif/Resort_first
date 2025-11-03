# SSH Key Setup for Server Deployment

## Your SSH Public Key:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPccRhaBasKz2lANal1PVX6yrAJwjQ8W9870Uc9bPU2L resort-deployment-key
```

## Option 1: Manual Setup via SSH (Requires one-time password)

Run this command and enter the server password when prompted:
```powershell
type "$env:USERPROFILE\.ssh\id_ed25519.pub" | ssh root@139.84.211.200 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"
```

## Option 2: Copy via WinSCP/FileZilla

1. Connect to server using WinSCP/FileZilla:
   - Host: 139.84.211.200
   - Username: root
   - Protocol: SFTP

2. Navigate to `/root/.ssh/` directory
3. Open `authorized_keys` file (create if doesn't exist)
4. Append the public key shown above
5. Set permissions: 600 for authorized_keys, 700 for .ssh directory

## Option 3: Manual Server Access

If you have direct access to the server:
```bash
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPccRhaBasKz2lANal1PVX6yrAJwjQ8W9870Uc9bPU2L resort-deployment-key" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

## After Setup: Test Connection

Run this to test if password-less login works:
```powershell
ssh -i "$env:USERPROFILE\.ssh\id_ed25519" root@139.84.211.200 "echo 'SSH key authentication working!'"
```

If successful, you can now deploy files without entering password!

