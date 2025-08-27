const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');
const multer = require('multer');
const XLSX = require('xlsx');

// Security module
const {
    encryptData,
    decryptData,
    maskPhoneNumber,
    anonymizeLocation,
    sanitizeCustomerData,
    formatSecureOrderData,
    validateAndSanitizeInput,
    checkRateLimit,
    securityHeaders,
    checkPrivacyConsent
} = require('./security');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || 'https://siritraders.in';

// Security middleware
app.use(securityHeaders);

// Rate limiting middleware
app.use((req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    if (!checkRateLimit(clientIP)) {
        return res.status(429).json({
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.'
        });
    }
    next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// File upload configuration
const upload = multer({ dest: 'uploads/' });

// Sample price list data (you can replace this with your actual data)
let priceList = [
    { id: 1, item: 'Rice (1kg)', price: 45, category: 'Grains' },
    { id: 2, item: 'Wheat Flour (1kg)', price: 35, category: 'Grains' },
    { id: 3, item: 'Sugar (1kg)', price: 42, category: 'Essentials' },
    { id: 4, item: 'Cooking Oil (1L)', price: 120, category: 'Essentials' },
    { id: 5, item: 'Milk (1L)', price: 60, category: 'Dairy' },
    { id: 6, item: 'Bread (400g)', price: 25, category: 'Bakery' },
    { id: 7, item: 'Eggs (12 pieces)', price: 80, category: 'Dairy' },
    { id: 8, item: 'Potato (1kg)', price: 30, category: 'Vegetables' },
    { id: 9, item: 'Onion (1kg)', price: 25, category: 'Vegetables' },
    { id: 10, item: 'Tomato (1kg)', price: 40, category: 'Vegetables' }
];

// Orders management
let orders = [];
let orderCounter = 1;

// WhatsApp client setup
let whatsappClient = null;
let qrCodeData = null;

// Initialize WhatsApp client (disabled for Windows compatibility)
function initializeWhatsApp() {
    console.log('WhatsApp Web integration disabled for better compatibility');
    console.log('Use the "Copy Price List" feature to share via WhatsApp manually');
    
    // Set status to show manual section
    whatsappClient = null;
    qrCodeData = null;
}

// API Routes

// Get current price list
app.get('/api/prices', (req, res) => {
    res.json(priceList);
});

// Add new item
app.post('/api/prices', (req, res) => {
    const { item, price, category } = req.body;
    const newItem = {
        id: priceList.length + 1,
        item,
        price: parseFloat(price),
        category
    };
    priceList.push(newItem);
    res.json(newItem);
});

// Update item
app.put('/api/prices/:id', (req, res) => {
    const { id } = req.params;
    const { item, price, category } = req.body;
    const index = priceList.findIndex(item => item.id == id);
    
    if (index !== -1) {
        priceList[index] = { ...priceList[index], item, price: parseFloat(price), category };
        res.json(priceList[index]);
    } else {
        res.status(404).json({ error: 'Item not found' });
    }
});

// Delete item
app.delete('/api/prices/:id', (req, res) => {
    const { id } = req.params;
    const index = priceList.findIndex(item => item.id == id);
    
    if (index !== -1) {
        const deletedItem = priceList.splice(index, 1)[0];
        res.json(deletedItem);
    } else {
        res.status(404).json({ error: 'Item not found' });
    }
});

// Upload Excel file
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Clear existing data and add new data
        priceList = data.map((row, index) => ({
            id: index + 1,
            item: row.Item || row.item || row['Item Name'] || '',
            price: parseFloat(row.Price || row.price || 0),
            category: row.Category || row.category || 'General'
        }));

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({ message: 'Price list updated successfully', count: priceList.length });
    } catch (error) {
        console.error('Error processing Excel file:', error);
        res.status(500).json({ error: 'Error processing file' });
    }
});

// Get WhatsApp QR code
app.get('/api/whatsapp/qr', (req, res) => {
    // Always return manual mode for better compatibility
    res.json({ status: 'manual' });
});

// Send price list via WhatsApp
app.post('/api/whatsapp/send', async (req, res) => {
    const { phoneNumber } = req.body;
    
    if (!whatsappClient || !whatsappClient.info) {
        return res.status(400).json({ error: 'WhatsApp not connected' });
    }

    try {
        const formattedNumber = phoneNumber.replace(/\D/g, '');
        const chatId = `${formattedNumber}@c.us`;
        
        // Format price list for WhatsApp
        const today = new Date().toLocaleDateString('en-IN');
        let message = `🛒 *KIRANA SHOP PRICE LIST*\n📅 *Date: ${today}*\n\n`;
        
        // Group by category
        const groupedItems = priceList.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {});

        Object.keys(groupedItems).forEach(category => {
            message += `*${category.toUpperCase()}*\n`;
            groupedItems[category].forEach(item => {
                message += `• ${item.item}: ₹${item.price}\n`;
            });
            message += '\n';
        });

        message += `\n🏪 *Your Kirana Shop*\n📞 Contact: +91-XXXXXXXXXX\n📍 Location: Your Address\n\n` +
            `📋 *TO PLACE ORDER:*\n` +
            `Send: "ORDER" to get order format`;

        await whatsappClient.sendMessage(chatId, message);
        res.json({ message: 'Price list sent successfully' });
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Get formatted price list for manual sharing
app.get('/api/prices/formatted', (req, res) => {
    const today = new Date().toLocaleDateString('en-IN');
    let message = `🏪 *SIRI TRADERS*\n` +
        `*Wholesale Kirana & Groceries*\n` +
        `*Best Prices Compared to DMart*\n\n` +
        `🛒 *DAILY PRICE LIST*\n📅 *Date: ${today}*\n\n`;
    
    // Group by category
    const groupedItems = priceList.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {});

    Object.keys(groupedItems).forEach(category => {
        message += `*${category.toUpperCase()}*\n`;
        groupedItems[category].forEach(item => {
            message += `• ${item.item}: ₹${item.price}\n`;
        });
        message += '\n';
    });

    message += `\n🏪 *SIRI TRADERS*\n` +
        `📞 Contact: +91-XXXXXXXXXX\n` +
        `📍 Location: Your Address\n\n` +
        `🆕 *FRESH STOCK AVAILABLE*\n` +
        `💰 *BULK ORDER DISCOUNTS*\n\n` +
        `🚚 *FREE HOME DELIVERY*\n` +
        `✅ Orders above ₹1000: Free delivery within 3km\n` +
        `✅ Orders above ₹500: Free delivery within 1km\n` +
        `💰 Other orders: ₹50 delivery fee\n\n` +
        `📋 *TO PLACE ORDER:*\n` +
        `🌐 Click: ${BASE_URL}/orders\n` +
        `📱 Or send: "ORDER" for manual format`;
    
    res.json({ message: message });
});

// Order Management APIs

// Get all orders
app.get('/api/orders', (req, res) => {
    res.json(orders);
});

// Create new order with security
app.post('/api/orders', checkPrivacyConsent, (req, res) => {
    // Validate and sanitize input
    const sanitizedInput = validateAndSanitizeInput(req.body, 'order');
    if (!sanitizedInput) {
        return res.status(400).json({
            error: 'Invalid input data',
            message: 'Please check your order data'
        });
    }

    const { customerName, customerPhone, items, subtotal, deliveryFee, totalAmount, deliveryAddress, notes, location, deliveryInfo } = req.body;
    
    // Sanitize customer data for privacy
    const sanitizedCustomer = sanitizeCustomerData({
        name: customerName,
        phone: customerPhone,
        address: deliveryAddress,
        location: location
    });
    
    const newOrder = {
        id: orderCounter++,
        customerName: sanitizedCustomer.name,
        customerPhone: sanitizedCustomer.phone,
        items: items || [],
        subtotal: parseFloat(subtotal) || 0,
        deliveryFee: parseFloat(deliveryFee) || 0,
        totalAmount: parseFloat(totalAmount) || 0,
        deliveryAddress: sanitizedCustomer.address,
        notes: sanitizedInput.notes || '',
        location: sanitizedCustomer.location,
        deliveryInfo: deliveryInfo || null,
        status: 'pending', // pending, confirmed, preparing, delivered, cancelled
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        secure: true
    };
    
    orders.push(newOrder);
    
    // Send WhatsApp notification to shop owner
    sendOrderNotification(newOrder);
    
    res.json(newOrder);
});

// Update order status
app.put('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = orders.find(o => o.id == id);
    if (order) {
        order.status = status;
        order.updatedAt = new Date().toISOString();
        res.json(order);
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

// Delete order
app.delete('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    const index = orders.findIndex(o => o.id == id);
    
    if (index !== -1) {
        const deletedOrder = orders.splice(index, 1)[0];
        res.json(deletedOrder);
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

// Get order instructions for customers
app.get('/api/order-instructions', (req, res) => {
    const instructions = `🏪 *SIRI TRADERS*\n` +
        `*Wholesale Kirana & Groceries*\n\n` +
        `📋 *HOW TO PLACE ORDER*\n\n` +
        `Send your order in this format:\n\n` +
        `*ORDER*\n` +
        `Name: Your Name\n` +
        `Phone: Your Phone\n` +
        `Address: Your Address\n\n` +
        `*ITEMS:*\n` +
        `2 Rice (1kg)\n` +
        `1 Sugar (1kg)\n` +
        `3 Milk (1L)\n\n` +
        `Notes: Any special instructions\n\n` +
        `🚚 *FREE HOME DELIVERY*\n` +
        `✅ Orders above ₹1000: Free delivery within 3km\n` +
        `✅ Orders above ₹500: Free delivery within 1km\n` +
        `💰 Other orders: ₹50 delivery fee\n\n` +
        `📞 *Contact:* +91-XXXXXXXXXX\n` +
        `🏪 *SIRI TRADERS*\n` +
        `🆕 *Fresh Stock Available*\n` +
        `💰 *Bulk Order Discounts*`;
    
    res.json({ instructions });
});

// Send secure order notification to shop owner
async function sendOrderNotification(order) {
    try {
        // Format secure order message for WhatsApp
        const today = new Date().toLocaleDateString('en-IN');
        const secureOrderData = formatSecureOrderData(order);
        
        let message = `🆕 *NEW ORDER RECEIVED!* 🔒\n\n` +
            `📅 *Date:* ${today}\n` +
            `🆔 *Order #:* ${order.id}\n\n` +
            `👤 *Customer Details (Privacy Protected):*\n` +
            `• Name: ${secureOrderData.customer.name}\n` +
            `• Phone: ${secureOrderData.customer.phone}\n` +
            `• Address: ${secureOrderData.customer.address}\n\n`;
        
        if (secureOrderData.customer.location) {
            const location = secureOrderData.customer.location;
            message += `📍 *Approximate Location:* https://www.google.com/maps?q=${location.latitude},${location.longitude}\n`;
            message += `🔒 *Privacy Note:* Location precision reduced for customer privacy\n\n`;
        }
        
        message += `🛒 *Items:*\n`;
        order.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            message += `• ${item.name}: ${item.quantity} × ₹${item.price} = ₹${itemTotal}\n`;
        });
        
        // Add delivery information
        if (order.deliveryInfo) {
            message += `\n🚚 *Delivery Information:*\n`;
            if (order.deliveryInfo.isFreeDelivery) {
                message += `✅ *FREE HOME DELIVERY*\n`;
                message += `📏 Distance: ${order.deliveryInfo.distance ? order.deliveryInfo.distance.toFixed(1) + 'km' : 'Unknown'}\n`;
                message += `📋 ${order.deliveryInfo.deliveryDetails}\n`;
            } else {
                message += `💰 Delivery Fee: ₹${order.deliveryFee || 50}\n`;
                if (order.deliveryInfo.distance) {
                    message += `📏 Distance: ${order.deliveryInfo.distance.toFixed(1)}km\n`;
                }
            }
        }
        
        message += `\n💰 *Subtotal:* ₹${order.subtotal || order.totalAmount}\n`;
        if (order.deliveryFee > 0) {
            message += `🚚 *Delivery Fee:* ₹${order.deliveryFee}\n`;
        }
        message += `💰 *Total Amount:* ₹${order.totalAmount}\n`;
        
        if (order.notes) {
            message += `📝 *Notes:* ${order.notes}\n`;
        }
        
        message += `\n🏪 *SIRI TRADERS*\n` +
            `*Wholesale Kirana & Groceries*\n` +
            `📞 *Contact:* +91-XXXXXXXXXX\n` +
            `🆕 *Fresh Stock Available*\n` +
            `💰 *Bulk Order Discounts*`;
        
        // Save message to file for easy copying
        const fs = require('fs');
        fs.writeFileSync('latest_order.txt', message);
        
        // Try to send automatic notification to your number
        await sendWhatsAppNotification(message);
        
        console.log('📱 Order Notification Message:');
        console.log(message);
        console.log('\n📋 Copy this message and send it to your WhatsApp manually!');
        console.log('💾 Order message saved to "latest_order.txt" file');
        
    } catch (error) {
        console.error('Error sending order notification:', error);
    }
}

// Send WhatsApp notification to shop owner
async function sendWhatsAppNotification(message) {
    try {
        // Your phone number for notifications
        const shopOwnerNumber = '9963321819';
        
        if (whatsappClient && whatsappClient.info) {
            // If WhatsApp Web is connected, send directly
            const chatId = `${shopOwnerNumber}@c.us`;
            await whatsappClient.sendMessage(chatId, message);
            console.log('✅ WhatsApp notification sent automatically!');
        } else {
            // Create WhatsApp share link for manual sending
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${shopOwnerNumber}?text=${encodedMessage}`;
            
            console.log('📱 WhatsApp Share Link:');
            console.log(whatsappUrl);
            console.log('\n🔗 Click the link above to send notification automatically!');
            
            // Also save the link to a file
            const fs = require('fs');
            fs.writeFileSync('whatsapp_notification_link.txt', whatsappUrl);
            console.log('💾 WhatsApp link saved to "whatsapp_notification_link.txt"');
        }
    } catch (error) {
        console.error('Error sending WhatsApp notification:', error);
    }
}

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the customer order page
app.get('/orders', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'order.html'));
});

// Redirect old /order to /orders for backward compatibility
app.get('/order', (req, res) => {
    res.redirect('/orders');
});

// Serve latest order notification file
app.get('/latest_order.txt', (req, res) => {
    const fs = require('fs');
    const filePath = path.join(__dirname, 'latest_order.txt');
    
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('No recent orders found');
    }
});

// Serve WhatsApp notification link file
app.get('/whatsapp_notification_link.txt', (req, res) => {
    const fs = require('fs');
    const filePath = path.join(__dirname, 'whatsapp_notification_link.txt');
    
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('No recent orders found');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`🌐 SIRI TRADERS App is live at: ${BASE_URL}`);
    console.log(`📱 Customer Orders: ${BASE_URL}/orders`);
    console.log(`⚙️ Admin Panel: ${BASE_URL}`);
    
    // Initialize WhatsApp client
    initializeWhatsApp();
}); 