# 🌐 Domain Setup Guide - SIRI TRADERS

## Domain Configuration

### Primary Domain: `https://siritraders.in`
### Alternative Domain: `https://siritraders.com`

## 📱 App URLs Structure

### Main URLs:
- **Home/Admin Panel**: `https://siritraders.in`
- **Customer Orders**: `https://siritraders.in/orders`
- **API Endpoints**: `https://siritraders.in/api/*`

### URL Structure:
```
https://siritraders.in/          → Admin Dashboard
https://siritraders.in/orders    → Customer Order Page
https://siritraders.in/api/prices → Price List API
https://siritraders.in/api/orders → Orders API
```

## 🔧 Domain Setup Steps

### Step 1: Purchase Domain
1. **GoDaddy**: https://godaddy.com
2. **Namecheap**: https://namecheap.com
3. **Google Domains**: https://domains.google

### Step 2: DNS Configuration
Add these DNS records:

```
Type: A
Name: @
Value: [Your hosting IP]

Type: CNAME
Name: www
Value: siritraders.in
```

### Step 3: SSL Certificate
- Most hosting providers offer free SSL
- Enable HTTPS for security

## 🚀 Deployment with Custom Domain

### Railway Deployment:
1. Deploy to Railway
2. Go to "Settings" → "Custom Domains"
3. Add: `siritraders.in`
4. Update DNS records with Railway's IP

### Environment Variables:
```
BASE_URL=https://siritraders.in
PORT=3000
```

## 📱 WhatsApp Integration URLs

### Order Notifications:
- **Shop Owner**: 9963321819
- **Order URL**: `https://siritraders.in/orders`
- **Admin Panel**: `https://siritraders.in`

### Price List Sharing:
- **Direct Link**: `https://siritraders.in/orders`
- **WhatsApp Share**: Pre-filled with domain URL

## 🔄 URL Updates Made

### Server.js:
- ✅ Base URL: `https://siritraders.in`
- ✅ Order page: `/orders`
- ✅ Console logs updated

### Order.js:
- ✅ WhatsApp integration with new domain
- ✅ Order notifications with correct URLs

### Admin Panel:
- ✅ All links updated to new domain
- ✅ Price list sharing with correct URLs

## 📊 Benefits of Custom Domain

### Professional Branding:
- ✅ `https://siritraders.in` looks professional
- ✅ Easy to remember and share
- ✅ Builds customer trust

### SEO Benefits:
- ✅ Better search engine ranking
- ✅ Local business visibility
- ✅ Mobile-friendly URLs

### Business Growth:
- ✅ Scalable for multiple locations
- ✅ Easy to add subdomains later
- ✅ Professional email addresses

## 🆘 Support

### Domain Issues:
- Contact your domain registrar
- Check DNS propagation (24-48 hours)
- Verify SSL certificate

### Hosting Issues:
- Railway support: https://railway.app/support
- Check deployment logs
- Verify environment variables

---
**Your SIRI TRADERS app will be live at https://siritraders.in! 🚀** 