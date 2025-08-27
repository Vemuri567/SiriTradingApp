@echo off
echo ========================================
echo   SIRI TRADERS - Simple Deployment
echo   FREE DOMAIN: siri-traders.vercel.app
echo ========================================

echo.
echo [1/3] Creating deployment package...
powershell Compress-Archive -Path ".\*" -DestinationPath "siri-traders-app.zip" -Force
echo ✅ Deployment package created: siri-traders-app.zip

echo.
echo [2/3] Deployment Instructions:
echo.
echo 🌐 STEP 1: Go to https://vercel.com
echo 🌐 STEP 2: Sign up/Login with GitHub
echo 🌐 STEP 3: Click "New Project"
echo 🌐 STEP 4: Choose "Upload Template"
echo 🌐 STEP 5: Upload: siri-traders-app.zip
echo 🌐 STEP 6: Configure settings:
echo    - Framework: Node.js
echo    - Build Command: npm install
echo    - Output Directory: public
echo 🌐 STEP 7: Click "Deploy"
echo.
echo [3/3] Your app will be live at:
echo    https://siri-traders.vercel.app
echo    https://siri-traders.vercel.app/orders
echo.
echo 🎯 Ready to deploy! Upload siri-traders-app.zip to Vercel
echo.
pause 