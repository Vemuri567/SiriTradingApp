@echo off
echo ========================================
echo   SIRI TRADERS - Azure Deployment Package
echo   DOMAIN: https://siritraders.com
echo ========================================

echo.
echo [1/5] Creating clean deployment folder...
if exist "azure-deploy" rmdir /s /q "azure-deploy"
mkdir azure-deploy

echo [2/5] Copying essential files...
copy "package.json" "azure-deploy\"
copy "server.js" "azure-deploy\"
copy "web.config" "azure-deploy\"
copy "AZURE_DEPLOYMENT_GUIDE.md" "azure-deploy\"

echo [3/5] Copying public folder...
xcopy "public" "azure-deploy\public\" /E /I /Y

echo [4/5] Creating deployment ZIP...
powershell Compress-Archive -Path "azure-deploy\*" -DestinationPath "siri-traders-azure-deploy.zip" -Force
echo ✅ Azure deployment package created: siri-traders-azure-deploy.zip

echo.
echo 🚀 AZURE DEPLOYMENT READY!
echo.
echo 📋 NEXT STEPS:
echo 1. Go to Azure Portal: https://portal.azure.com
echo 2. Create App Service (Node.js 18 LTS)
echo 3. Upload: siri-traders-azure-deploy.zip
echo 4. Configure custom domain: siritraders.com
echo 5. Set environment variables
echo.
echo 📖 Read: AZURE_DEPLOYMENT_GUIDE.md for detailed steps
echo.
echo 🌐 Your app will be live at: https://siritraders.com
echo.
pause 