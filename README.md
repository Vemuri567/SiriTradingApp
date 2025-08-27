# 🛒 Kirana Shop Price List App

A modern web application for managing and sharing daily price lists via WhatsApp. Perfect for small grocery stores and kirana shops.

## ✨ Features

- 📱 **WhatsApp Integration**: Send price lists directly to customers via WhatsApp
- 📊 **Price Management**: Add, edit, and delete items with categories
- 📈 **Statistics**: View total items, value, and category breakdown
- 📁 **Excel Import**: Upload price lists from Excel files
- 🎨 **Modern UI**: Beautiful, responsive design
- 📅 **Date Tracking**: Automatic date display for daily price lists

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Chrome browser (for WhatsApp Web integration)

### Installation

1. **Clone or download the project**
   ```bash
   cd kirana-price-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📱 WhatsApp Setup

1. **Connect WhatsApp**:
   - Click on the WhatsApp section in the app
   - Scan the QR code with your phone
   - Open WhatsApp → Settings → Linked Devices → Link a Device

2. **Send Price List**:
   - Enter the customer's phone number (with country code)
   - Click "Send Price List"
   - The formatted price list will be sent via WhatsApp

## 📊 Excel Import Format

Create an Excel file with these columns:
- **Item**: Product name
- **Price**: Price in rupees
- **Category**: Product category

Example:
| Item | Price | Category |
|------|-------|----------|
| Rice (1kg) | 45 | Grains |
| Sugar (1kg) | 42 | Essentials |

## 🎯 Usage Guide

### Adding Items
1. Click "Add Item" button
2. Fill in item name, price, and category
3. Click "Add Item" to save

### Editing Items
1. Click the edit icon (✏️) next to any item
2. Modify the details
3. Click "Update Item" to save changes

### Deleting Items
1. Click the delete icon (🗑️) next to any item
2. Confirm deletion

### Sending via WhatsApp
1. Ensure WhatsApp is connected (QR code scanned)
2. Enter customer's phone number with country code
3. Click "Send Price List"
4. The formatted message will be sent automatically

## 🏗️ Project Structure

```
kirana-price-app/
├── public/
│   ├── index.html      # Main interface
│   └── script.js       # Frontend JavaScript
├── uploads/            # Excel file uploads
├── server.js           # Express server
├── package.json        # Dependencies
└── README.md          # This file
```

## 🔧 Configuration

### Customizing Shop Details
Edit the WhatsApp message template in `server.js`:
```javascript
message += `\n🏪 *Your Kirana Shop*\n📞 Contact: +91-XXXXXXXXXX\n📍 Location: Your Address`;
```

### Adding Categories
Edit the category options in `public/index.html`:
```html
<option value="Your Category">Your Category</option>
```

## 🚀 Deployment Options

### Free Hosting Services

1. **Render** (Recommended)
   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`

2. **Railway**
   - Connect your GitHub repository
   - Automatic deployment

3. **Heroku** (Free tier discontinued)
   - Use paid plans or alternatives

4. **Vercel**
   - Good for static sites but requires serverless functions

### Environment Variables
For production, set these environment variables:
- `PORT`: Server port (default: 3000)

## 🔒 Security Notes

- WhatsApp Web session is stored locally
- No sensitive data is transmitted to external services
- All data is stored in memory (resets on server restart)

## 🐛 Troubleshooting

### WhatsApp Connection Issues
- Ensure Chrome browser is installed
- Check internet connection
- Try refreshing the QR code
- Restart the application if needed

### Excel Upload Issues
- Ensure file format is .xlsx or .xls
- Check column names match: Item, Price, Category
- Verify file is not corrupted

### Port Already in Use
- Change the port in `server.js` or set `PORT` environment variable
- Kill existing processes using the port

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Ensure all dependencies are installed

## 📄 License

MIT License - Feel free to modify and use for your business needs.

---

**Made with ❤️ for Kirana Shop Owners** 