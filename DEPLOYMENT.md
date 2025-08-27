# 🚀 Deployment Guide - SIRI TRADERS Kirana App

## Free Hosting Options

### Option 1: Railway (Recommended) - FREE
- **URL**: https://railway.app
- **Free Tier**: $5 credit monthly
- **Features**: Automatic deployments, custom domains, SSL

### Option 2: Render - FREE
- **URL**: https://render.com
- **Free Tier**: 750 hours/month
- **Features**: Easy deployment, automatic SSL

### Option 3: Vercel - FREE
- **URL**: https://vercel.com
- **Free Tier**: Generous limits
- **Features**: Fast deployments, edge functions

## 🚀 Quick Deploy to Railway

### Step 1: Prepare Your Code
```bash
# Make sure you're in the project directory
cd C:\Users\NAVEEN\kirana-price-app

# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit - SIRI TRADERS Kirana App"
```

### Step 2: Deploy to Railway
1. **Visit**: https://railway.app
2. **Sign up** with GitHub account
3. **Click**: "New Project"
4. **Select**: "Deploy from GitHub repo"
5. **Choose**: Your repository
6. **Wait**: For automatic deployment (2-3 minutes)

### Step 3: Get Your Live URL
- Railway will provide a URL like: `https://your-app-name.railway.app`
- Your app will be live at this URL!

## 🔧 Environment Variables (Optional)
Add these in Railway dashboard if needed:
- `PORT`: 3000 (auto-set by Railway)
- `BASE_URL`: https://siritraders.in (or your custom domain)

## 📱 Update WhatsApp Links
After deployment, update the shop owner's WhatsApp number in:
- `public/order.js` (line with `shopOwnerNumber`)
- `server.js` (in `sendWhatsAppNotification` function)

## 🌐 Custom Domain Setup
1. **Purchase Domain**: Buy `siritraders.in` or `siritraders.com`
2. **In Railway dashboard**, go to "Settings"
3. **Click "Custom Domains"**
4. **Add your domain**: `siritraders.in`
5. **Update DNS records** with Railway's IP address
6. **Wait 24-48 hours** for DNS propagation

### Domain Benefits:
- ✅ Professional branding: `https://siritraders.in`
- ✅ Easy to remember and share
- ✅ Better customer trust
- ✅ SEO benefits for local business

## 📊 Monitor Your App
- **Logs**: View real-time logs in Railway dashboard
- **Metrics**: Monitor performance and usage
- **Uptime**: 99.9% uptime guaranteed

## 🔄 Automatic Updates
- Every time you push to GitHub, Railway automatically redeploys
- No manual intervention needed

## 💰 Cost
- **FREE** for small to medium usage
- $5 credit monthly on Railway
- More than enough for a Kirana shop app

## 🆘 Support
- Railway has excellent documentation
- 24/7 support available
- Community forums for help

---
**Your SIRI TRADERS app will be live and accessible worldwide! 🌍** 