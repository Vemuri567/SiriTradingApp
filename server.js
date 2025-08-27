const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || 'https://siri-traders.vercel.app';

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
    { id: 8, item: 'Potato (1kg)', price: 30, category: 'Vegetables' },
    { id: 9, item: 'Onion (1kg)', price: 25, category: 'Vegetables' },
    { id: 10, item: 'Tomato (1kg)', price: 40, category: 'Vegetables' }
];

// Orders management
let orders = [];
let orderCounter = 1;

// API Routes

// Test route for debugging
app.get('/test', (req, res) => {
    res.json({ 
        message: 'SIRI TRADERS API is working!', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

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
    
    const itemIndex = priceList.findIndex(item => item.id == id);
    if (itemIndex !== -1) {
        priceList[itemIndex] = { id: parseInt(id), item, price: parseFloat(price), category };
        res.json(priceList[itemIndex]);
    } else {
        res.status(404).json({ error: 'Item not found' });
    }
});

// Delete item
app.delete('/api/prices/:id', (req, res) => {
    const { id } = req.params;
    const itemIndex = priceList.findIndex(item => item.id == id);
    
    if (itemIndex !== -1) {
        const deletedItem = priceList.splice(itemIndex, 1)[0];
        res.json(deletedItem);
    } else {
        res.status(404).json({ error: 'Item not found' });
    }
});

// Get all orders
app.get('/api/orders', (req, res) => {
    res.json(orders);
});

// Create new order
app.post('/api/orders', (req, res) => {
    try {
        const { customerName, customerPhone, customerAddress, items, totalAmount, deliveryFee, finalTotal } = req.body;
        
        const newOrder = {
            id: orderCounter++,
            customerName,
            customerPhone,
            customerAddress,
            items,
            totalAmount,
            deliveryFee,
            finalTotal,
            status: 'Pending',
            orderDate: new Date().toISOString()
        };
        
        orders.push(newOrder);
        
        // Create WhatsApp message
        const message = createOrderMessage(newOrder);
        
        res.json({
            success: true,
            order: newOrder,
            message: message,
            whatsappUrl: `https://wa.me/9963321819?text=${encodeURIComponent(message)}`
        });
        
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Update order status
app.put('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const orderIndex = orders.findIndex(order => order.id == id);
    if (orderIndex !== -1) {
        orders[orderIndex].status = status;
        res.json(orders[orderIndex]);
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

// Delete order
app.delete('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    const orderIndex = orders.findIndex(order => order.id == id);
    
    if (orderIndex !== -1) {
        const deletedOrder = orders.splice(orderIndex, 1)[0];
        res.json(deletedOrder);
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

// Create order message for WhatsApp
function createOrderMessage(order) {
    const itemsList = order.items.map(item => 
        `• ${item.item}: ${item.quantity} × ₹${item.price} = ₹${item.quantity * item.price}`
    ).join('\n');
    
    return `🆕 *NEW ORDER RECEIVED!*
📅 *Date:* ${new Date(order.orderDate).toLocaleDateString()}
🆔 *Order #:* ${order.id}

👤 *Customer Details:*
• Name: ${order.customerName}
• Phone: ${order.customerPhone}
• Address: ${order.customerAddress || 'Not provided'}

🛒 *Items:*
${itemsList}

🚚 *Delivery Information:*
💰 Delivery Fee: ₹${order.deliveryFee}

💰 *Subtotal:* ₹${order.totalAmount}
🚚 *Delivery Fee:* ₹${order.deliveryFee}
💰 *Total Amount:* ₹${order.finalTotal}

🏪 *SIRI TRADERS*
*Wholesale Kirana & Groceries*
📞 *Contact:* +91-9963321819
🆕 *Fresh Stock Available*
💰 *Bulk Order Discounts*`;
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

// Start server (only if not in Vercel environment)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`🌐 SIRI TRADERS App is live at: ${BASE_URL}`);
        console.log(`📱 Customer Orders: ${BASE_URL}/orders`);
        console.log(`⚙️ Admin Panel: ${BASE_URL}`);
    });
} else {
    // For Vercel serverless environment
    console.log(`🌐 SIRI TRADERS App deployed to Vercel`);
    console.log(`📱 Customer Orders: ${BASE_URL}/orders`);
    console.log(`⚙️ Admin Panel: ${BASE_URL}`);
}

// Export for Vercel
module.exports = app; 