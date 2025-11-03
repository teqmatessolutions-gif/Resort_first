@echo off
echo === Landing Page Deployment ===
echo.

REM Download PuTTY plink.exe first: https://www.putty.org/
echo Make sure plink.exe is in your PATH or in this directory
echo.

REM Deploy landing page files using PuTTY
plink.exe -ssh root@139.84.211.200 -pw "4bE!beciK#deo-_w" "mkdir -p /var/www/resort/Resort_first/landingpage/assets/css"

pscp.exe -scp root@139.84.211.200 -pw "4bE!beciK#deo-_w" landingpage/index.html /var/www/resort/Resort_first/landingpage/
pscp.exe -scp root@139.84.211.200 -pw "4bE!beciK#deo-_w" landingpage/service-details.html /var/www/resort/Resort_first/landingpage/
pscp.exe -scp root@139.84.211.200 -pw "4bE!beciK#deo-_w" landingpage/assets/css/main.css /var/www/resort/Resort_first/landingpage/assets/css/

echo.
echo Deployment complete!
echo.

pause



