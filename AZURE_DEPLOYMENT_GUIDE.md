# 🚀 SIRI TRADERS - Azure Deployment Guide

## 🌐 **Domain:** https://siritraders.com

## 📋 **Prerequisites:**
- Azure Account
- Domain: siritraders.com (pointed to Azure)
- Azure App Service Plan

## 🎯 **Deployment Steps:**

### **Step 1: Create Azure App Service**
1. **Go to Azure Portal:** https://portal.azure.com
2. **Create Resource** → **Web App**
3. **Configure:**
   - **Name:** siri-traders-app
   - **Runtime Stack:** Node.js 18 LTS
   - **Operating System:** Windows
   - **Region:** Choose nearest to your customers
   - **App Service Plan:** Create new (Basic B1 or higher)

### **Step 2: Deploy Application**
1. **Go to your App Service**
2. **Deployment Center** → **Local Git/FTPS credentials**
3. **Set up deployment credentials**
4. **Deployment Center** → **External** → **Git**
5. **Copy the Git URL**

### **Step 3: Deploy from Local Git**
```bash
# In your local project directory
git remote add azure <your-azure-git-url>
git push azure main
```

### **Step 4: Configure Environment Variables**
1. **App Service** → **Configuration** → **Application settings**
2. **Add these variables:**
   ```
   BASE_URL=https://siritraders.com
   NODE_ENV=production
   PORT=8080
   ```

### **Step 5: Configure Custom Domain**
1. **App Service** → **Custom domains**
2. **Add custom domain:** siritraders.com
3. **Add subdomain:** www.siritraders.com
4. **Configure DNS records** (provided by Azure)

### **Step 6: Enable HTTPS**
1. **App Service** → **TLS/SSL settings**
2. **Bind SSL certificate** (Azure provides free certificate)
3. **Force HTTPS redirect**

## 📱 **App Features (All Working):**
✅ **Price List Management** - Add, edit, delete items
✅ **Customer Order Placement** - Full order system with location
✅ **WhatsApp Integration** - Automatic order notifications to 9963321819
✅ **Copy Price List** - Formatted price list for sharing
✅ **Copy Order Instructions** - Step-by-step order guide
✅ **Admin Panel** - Manage orders and prices
✅ **Delivery Calculation** - Free delivery for orders above ₹500/₹1000
✅ **Security Features** - Data protection and privacy

## 🌐 **App URLs (After Deployment):**
- **Main App:** https://siritraders.com
- **Customer Orders:** https://siritraders.com/orders
- **Admin Panel:** https://siritraders.com/admin
- **Test API:** https://siritraders.com/test

## 🔧 **DNS Configuration:**
Add these DNS records to your domain provider:
```
Type: CNAME
Name: www
Value: siri-traders-app.azurewebsites.net

Type: A
Name: @
Value: [Azure App Service IP]
```

## 📊 **WhatsApp Integration:**
- **Shop Owner Number:** +91-9963321819
- **Order Notifications:** Automatic WhatsApp messages
- **Price List Sharing:** Copy to clipboard feature
- **Order Instructions:** Step-by-step guide

## 💰 **Delivery Policy:**
- **Free delivery within 3km** for orders above ₹1000
- **Free delivery within 1km** for orders above ₹500
- **₹50 delivery fee** for other orders

## 🔒 **Security Features:**
- **HTTPS enforced**
- **Data encryption**
- **Input sanitization**
- **Rate limiting**
- **Privacy protection**

## 📞 **Support:**
- **Contact:** +91-9963321819
- **Email:** support@siritraders.com
- **Business Hours:** 6 AM - 10 PM

## 🎉 **Your SIRI TRADERS app will be live at https://siritraders.com!**

---

**🏪 SIRI TRADERS - Wholesale Kirana & Groceries**
**🆕 Fresh Stock Available**
**💰 Best Prices Compared to DMart**
**🎯 Bulk Order Discounts** 