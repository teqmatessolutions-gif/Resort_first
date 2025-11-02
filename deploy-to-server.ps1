# Landing Page & Dashboard Deployment Script
# Run this script to deploy all changes to the production server

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerPassword
)

$ErrorActionPreference = "Stop"

Write-Host "=== Resort Management System Deployment ===" -ForegroundColor Cyan
Write-Host "Server: 139.84.211.200" -ForegroundColor Yellow
Write-Host ""

# Set server details
$server = "root@139.84.211.200"
$password = $ServerPassword

# Files to deploy
$files = @(
    @{ local = "landingpage/index.html"; remote = "/var/www/resort/Resort_first/landingpage/" }
    @{ local = "landingpage/service-details.html"; remote = "/var/www/resort/Resort_first/landingpage/" }
    @{ local = "landingpage/assets/css/main.css"; remote = "/var/www/resort/Resort_first/landingpage/assets/css/" }
    @{ local = "dasboard/src/services/api.js"; remote = "/var/www/resort/Resort_first/dasboard/src/services/" }
)

Write-Host "Files to deploy:" -ForegroundColor Yellow
foreach ($file in $files) {
    if (Test-Path $file.local) {
        Write-Host "  ✓ $($file.local)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $($file.local) (NOT FOUND)" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Deploying files..." -ForegroundColor Yellow

# Use sshpass equivalent for Windows
foreach ($file in $files) {
    Write-Host "Uploading: $($file.local)" -ForegroundColor Cyan
    
    try {
        # Upload file using scp
        echo $password | plink -batch -pw "$password" -ssh $server "cat > $($file.remote)$(Split-Path $file.local -Leaf)" < $file.local
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Uploaded successfully" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Upload failed" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ✗ Error: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Building dashboard..." -ForegroundColor Yellow

# Rebuild dashboard
ssh -o StrictHostKeyChecking=no root@139.84.211.200 "cd /var/www/resort/Resort_first/dasboard && npm run build"

Write-Host ""
Write-Host "Restarting services..." -ForegroundColor Yellow

# Restart services
ssh -o StrictHostKeyChecking=no root@139.84.211.200 "sudo systemctl restart resort.service && sudo systemctl restart nginx"

Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Visit: https://www.teqmates.com" -ForegroundColor Cyan



