@echo off
echo ========================================
echo    SIRI TRADERS - Vercel Deployment
echo    FREE DOMAIN: siri-traders.vercel.app
echo ========================================
echo.

echo [1/5] Checking Git status...
if not exist ".git" (
    echo Initializing Git repository...
    git init
    echo ✅ Git initialized
) else (
    echo ✅ Git repository exists
)

echo.
echo [2/5] Adding files to Git...
git add .
echo ✅ Files added

echo.
echo [3/5] Creating commit...
git commit -m "SIRI TRADERS - Ready for Vercel deployment with free domain"
echo ✅ Commit created

echo.
echo [4/5] Installing Vercel CLI...
npm install -g vercel
echo ✅ Vercel CLI installed

echo.
echo [5/5] Deploying to Vercel...
echo.
echo ========================================
echo    DEPLOYMENT STEPS:
echo ========================================
echo.
echo 1. Vercel will ask for your email
echo 2. Choose "Y" to link to existing project or "N" for new
echo 3. Project name: siri-traders
echo 4. Choose "Y" to override settings
echo 5. Wait for deployment...
echo.
echo ========================================
echo    YOUR FREE DOMAIN WILL BE:
echo    https://siri-traders.vercel.app
echo ========================================
echo.
pause

vercel --prod 