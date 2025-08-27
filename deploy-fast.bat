@echo off
echo ========================================
echo   SIRI TRADERS - Fast Deployment
echo   FREE DOMAIN: siri-traders.vercel.app
echo ========================================

echo.
echo [1/4] Creating clean deployment folder...
if exist "deploy-package" rmdir /s /q "deploy-package"
mkdir deploy-package

echo [2/4] Copying essential files...
copy "package.json" "deploy-package\"
copy "server.js" "deploy-package\"
copy "security.js" "deploy-package\"
copy "vercel.json" "deploy-package\"
copy ".gitignore" "deploy-package\"

echo [3/4] Copying public folder...
xcopy "public" "deploy-package\public\" /E /I /Y

echo [4/4] Creating deployment ZIP...
powershell Compress-Archive -Path "deploy-package\*" -DestinationPath "siri-traders-deploy.zip" -Force
echo ✅ Fast deployment package created: siri-traders-deploy.zip

echo.
echo 🚀 DEPLOYMENT READY!
echo.
echo 🌐 STEP 1: Go to https://vercel.com
echo 🌐 STEP 2: Sign up/Login with GitHub
echo 🌐 STEP 3: Click "New Project"
echo 🌐 STEP 4: Choose "Upload Template"
echo 🌐 STEP 5: Upload: siri-traders-deploy.zip
echo 🌐 STEP 6: Click "Deploy"
echo.
echo 📱 Your app will be live at:
echo    https://siri-traders.vercel.app
echo    https://siri-traders.vercel.app/orders
echo.
echo 🎯 Ready to deploy! Upload siri-traders-deploy.zip to Vercel
echo.
pause 