# Landing Page Deployment Script
# This script will upload the modified landing page files to the server

Write-Host "=== Landing Page Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Server information
$server = "root@139.84.211.200"
$remotePath = "/var/www/resort/Resort_first/landingpage"

# Files to deploy
$files = @(
    "landingpage/assets/css/main.css",
    "landingpage/index.html",
    "landingpage/service-details.html"
)

Write-Host "Files to deploy:" -ForegroundColor Yellow
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (NOT FOUND)" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Copying files to server..." -ForegroundColor Yellow
Write-Host "You will be prompted for the server password." -ForegroundColor Yellow
Write-Host ""

# Copy files one by one
foreach ($file in $files) {
    $relativePath = $file -replace "landingpage/", ""
    $remoteFile = "$remotePath/$relativePath"
    
    Write-Host "Uploading: $file" -ForegroundColor Cyan
    
    # Create remote directory if needed
    $remoteDir = Split-Path $relativePath -Parent
    if ($remoteDir) {
        ssh $server "mkdir -p $remotePath/assets/css" 2>&1 | Out-Null
    }
    
    # Copy file
    scp $file "$server`:$remoteFile"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Uploaded successfully" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Upload failed" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Cyan
Write-Host "Files should now be live on www.teqmates.com" -ForegroundColor Green

