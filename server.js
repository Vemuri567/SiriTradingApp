const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Sample price list data
let priceList = [
    { id: 1, item: 'Rice (1kg)', price: 45, category: 'Grains' },
    { id: 2, item: 'Wheat Flour (1kg)', price: 35, category: 'Grains' },
    { id: 3, item: 'Sugar (1kg)', price: 42, category: 'Essentials' },
    { id: 4, item: 'Cooking Oil (1L)', price: 120, category: 'Essentials' },
    { id: 5, item: 'Milk (1L)', price: 60, category: 'Dairy' },
    { id: 6, item: 'Bread (400g)', price: 25, category: 'Bakery' },
    { id: 7, item: 'Eggs (12 pieces)', price: 80, category: 'Dairy' },
    { id: 8, item: 'Tomatoes (1kg)', price: 40, category: 'Vegetables' },
    { id: 9, item: 'Onions (1kg)', price: 30, category: 'Vegetables' },
    { id: 10, item: 'Potatoes (1kg)', price: 35, category: 'Vegetables' }
];

// Sample orders data
let orders = [];

// Test route for debugging
app.get('/test', (req, res) => {
    res.json({ 
        message: 'SIRI TRADERS API is working!', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        baseUrl: BASE_URL
    });
});

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the order page
app.get('/orders', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'order.html'));
});

// Serve the admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API Routes
app.get('/api/prices', (req, res) => {
    res.json(priceList);
});

app.post('/api/prices', (req, res) => {
    const { item, price, category } = req.body;
    const newItem = {
        id: priceList.length + 1,
        item,
        price: parseFloat(price),
        category
    };
    priceList.push(newItem);
    res.json({ success: true, item: newItem });
});

app.put('/api/prices/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { item, price, category } = req.body;
    const index = priceList.findIndex(item => item.id === id);
    if (index !== -1) {
        priceList[index] = { id, item, price: parseFloat(price), category };
        res.json({ success: true, item: priceList[index] });
    } else {
        res.status(404).json({ error: 'Item not found' });
    }
});

app.delete('/api/prices/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = priceList.findIndex(item => item.id === id);
    if (index !== -1) {
        priceList.splice(index, 1);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Item not found' });
    }
});

app.get('/api/orders', (req, res) => {
    res.json(orders);
});

app.post('/api/orders', (req, res) => {
    const { customerName, customerPhone, customerAddress, items, totalAmount, location } = req.body;
    
    const newOrder = {
        id: orders.length + 1,
        customerName,
        customerPhone,
        customerAddress: customerAddress || 'Not provided',
        items,
        totalAmount,
        location,
        status: 'Pending',
        orderDate: new Date().toISOString(),
        deliveryFee: calculateDeliveryFee(totalAmount),
        subtotal: totalAmount,
        finalTotal: totalAmount + calculateDeliveryFee(totalAmount)
    };
    
    orders.push(newOrder);
    
    // Send WhatsApp notification
    sendOrderNotification(newOrder);
    
    res.json({ success: true, order: newOrder });
});

app.put('/api/orders/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const order = orders.find(order => order.id === id);
    if (order) {
        order.status = status;
        res.json({ success: true, order });
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

app.delete('/api/orders/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = orders.findIndex(order => order.id === id);
    if (index !== -1) {
        orders.splice(index, 1);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

// Helper functions
function calculateDeliveryFee(amount) {
    if (amount >= 1000) {
        return 0; // Free delivery within 3km
    } else if (amount >= 500) {
        return 0; // Free delivery within 1km
    } else {
        return 50; // ₹50 delivery fee
    }
}

function sendOrderNotification(order) {
    const orderDate = new Date().toLocaleDateString('en-IN');
    const itemsList = order.items.map(item => 
        `• ${item.name}: ${item.quantity} × ₹${item.price} = ₹${item.quantity * item.price}`
    ).join('\n');
    
    const deliveryInfo = order.deliveryFee > 0 ? 
        `🚚 *Delivery Information:*\n💰 Delivery Fee: ₹${order.deliveryFee}\n\n💰 *Subtotal:* ₹${order.subtotal}\n🚚 *Delivery Fee:* ₹${order.deliveryFee}\n💰 *Total Amount:* ₹${order.finalTotal}` :
        `🚚 *Delivery Information:*\n✅ Free Delivery\n\n💰 *Total Amount:* ₹${order.finalTotal}`;
    
    const message = `🆕 *NEW ORDER RECEIVED!*
📅 *Date:* ${orderDate}
🆔 *Order #:* ${order.id}

👤 *Customer Details:*
• Name: ${order.customerName}
• Phone: ${order.customerPhone}
• Address: ${order.customerAddress}

${order.location ? `📍 *Location:* ${order.location}\n` : ''}
🛒 *Items:*
${itemsList}

${deliveryInfo}

🏪 *SIRI TRADERS*
*Wholesale Kirana & Groceries*
📞 *Contact:* +91-XXXXXXXXXX
🆕 *Fresh Stock Available*
💰 *Bulk Order Discounts*`;

    // Create WhatsApp share link
    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/9963321819?text=${encodedMessage}`;
    
    console.log('📱 WhatsApp Share Link:');
    console.log(whatsappLink);
    console.log('🔗 Click the link above to send notification automatically!');
    
    // Save to file for easy access
    const fs = require('fs');
    fs.writeFileSync('whatsapp_notification_link.txt', whatsappLink);
    console.log('💾 WhatsApp link saved to "whatsapp_notification_link.txt"');
    
    console.log('\n📱 Order Notification Message:');
    console.log(message);
    console.log('\n📋 Copy this message and send it to your WhatsApp manually!');
    
    // Save order message to file
    fs.writeFileSync('latest_order.txt', message);
    console.log('💾 Order message saved to "latest_order.txt" file');
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`🌐 SIRI TRADERS App is live at: ${BASE_URL}`);
    console.log(`📱 Customer Orders: ${BASE_URL}/orders`);
    console.log(`⚙️ Admin Panel: ${BASE_URL}/admin`);
    console.log(`🧪 Test API: ${BASE_URL}/test`);
    console.log('\n📋 WhatsApp integration disabled for better compatibility');
    console.log('Use the "Copy Price List" feature to share via WhatsApp manually');
});

module.exports = app; 