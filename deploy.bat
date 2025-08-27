@echo off
echo ========================================
echo    SIRI TRADERS - Deployment Setup
echo ========================================
echo.

echo [1/4] Initializing Git repository...
git init
echo ✅ Git initialized

echo.
echo [2/4] Adding files to Git...
git add .
echo ✅ Files added

echo.
echo [3/4] Creating initial commit...
git commit -m "Initial commit - SIRI TRADERS Kirana App with custom domain"
echo ✅ Commit created

echo.
echo [4/4] Setup complete!
echo.
echo ========================================
echo    NEXT STEPS:
echo ========================================
echo.
echo 1. Create GitHub repository
echo 2. Push code to GitHub:
echo    git remote add origin YOUR_GITHUB_REPO_URL
echo    git push -u origin main
echo.
echo 3. Deploy to Railway:
echo    - Visit: https://railway.app
echo    - Connect GitHub repository
echo    - Deploy automatically
echo.
echo 4. Set custom domain:
echo    - Buy domain: siritraders.in
echo    - Add in Railway settings
echo    - Update DNS records
echo.
echo ========================================
echo    Your app will be live at:
echo    https://siritraders.in
echo    https://siritraders.in/orders
echo ========================================
echo.
pause 