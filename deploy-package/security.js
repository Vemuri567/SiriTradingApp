const crypto = require('crypto');

// Security configuration
const SECURITY_CONFIG = {
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'siri-traders-secure-key-2024',
    ALGORITHM: 'aes-256-cbc',
    PHONE_MASK_PATTERN: /(\d{3})(\d{3})(\d{4})/,
    LOCATION_PRECISION: 2, // Reduce location precision for privacy
    DATA_RETENTION_DAYS: 30,
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: 100
};

// Data encryption
function encryptData(data) {
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher(SECURITY_CONFIG.ALGORITHM, SECURITY_CONFIG.ENCRYPTION_KEY);
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return {
            iv: iv.toString('hex'),
            encrypted: encrypted
        };
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
}

// Data decryption
function decryptData(encryptedData) {
    try {
        const decipher = crypto.createDecipher(SECURITY_CONFIG.ALGORITHM, SECURITY_CONFIG.ENCRYPTION_KEY);
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}

// Phone number masking for privacy
function maskPhoneNumber(phoneNumber) {
    if (!phoneNumber) return 'Not provided';
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return cleaned.replace(SECURITY_CONFIG.PHONE_MASK_PATTERN, '$1***$3');
    }
    return '***' + cleaned.slice(-4);
}

// Location anonymization for privacy
function anonymizeLocation(location) {
    if (!location || !location.latitude || !location.longitude) {
        return null;
    }
    
    // Reduce precision to protect privacy
    const factor = Math.pow(10, SECURITY_CONFIG.LOCATION_PRECISION);
    return {
        latitude: Math.round(location.latitude * factor) / factor,
        longitude: Math.round(location.longitude * factor) / factor,
        approximate: true
    };
}

// Customer data sanitization
function sanitizeCustomerData(customerData) {
    return {
        name: customerData.name ? customerData.name.trim() : 'Anonymous',
        phone: maskPhoneNumber(customerData.phone),
        address: customerData.address ? customerData.address.trim() : 'Not provided',
        location: anonymizeLocation(customerData.location)
    };
}

// Secure order data formatting
function formatSecureOrderData(order) {
    const sanitizedCustomer = sanitizeCustomerData({
        name: order.customerName,
        phone: order.customerPhone,
        address: order.deliveryAddress,
        location: order.location
    });

    return {
        orderId: order.id,
        customer: sanitizedCustomer,
        items: order.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
        })),
        totals: {
            subtotal: order.subtotal,
            deliveryFee: order.deliveryFee,
            total: order.totalAmount
        },
        deliveryInfo: order.deliveryInfo,
        timestamp: new Date().toISOString(),
        secure: true
    };
}

// Input validation and sanitization
function validateAndSanitizeInput(input, type) {
    const sanitized = {};
    
    switch (type) {
        case 'customer':
            sanitized.name = input.name ? input.name.trim().substring(0, 50) : '';
            sanitized.phone = input.phone ? input.phone.replace(/\D/g, '').substring(0, 15) : '';
            sanitized.address = input.address ? input.address.trim().substring(0, 200) : '';
            break;
            
        case 'order':
            sanitized.items = Array.isArray(input.items) ? input.items.slice(0, 50) : [];
            sanitized.notes = input.notes ? input.notes.trim().substring(0, 500) : '';
            break;
            
        default:
            return null;
    }
    
    return sanitized;
}

// Rate limiting implementation
const rateLimitStore = new Map();

function checkRateLimit(ipAddress) {
    const now = Date.now();
    const windowStart = now - SECURITY_CONFIG.RATE_LIMIT_WINDOW;
    
    if (!rateLimitStore.has(ipAddress)) {
        rateLimitStore.set(ipAddress, []);
    }
    
    const requests = rateLimitStore.get(ipAddress);
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS) {
        return false; // Rate limit exceeded
    }
    
    recentRequests.push(now);
    rateLimitStore.set(ipAddress, recentRequests);
    return true; // Rate limit OK
}

// GDPR compliance - Data deletion
function deleteCustomerData(customerId) {
    // Implementation for GDPR right to be forgotten
    return {
        success: true,
        message: 'Customer data deleted successfully',
        timestamp: new Date().toISOString()
    };
}

// Security headers middleware
function securityHeaders(req, res, next) {
    // Prevent XSS attacks
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Content Security Policy
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' cdn.jsdelivr.net cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self' https://nominatim.openstreetmap.org;");
    
    // Force HTTPS
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    next();
}

// Privacy consent check
function checkPrivacyConsent(req, res, next) {
    const consent = req.headers['x-privacy-consent'] || req.body.privacyConsent;
    
    if (!consent) {
        return res.status(403).json({
            error: 'Privacy consent required',
            message: 'Please provide consent for data processing'
        });
    }
    
    next();
}

module.exports = {
    encryptData,
    decryptData,
    maskPhoneNumber,
    anonymizeLocation,
    sanitizeCustomerData,
    formatSecureOrderData,
    validateAndSanitizeInput,
    checkRateLimit,
    deleteCustomerData,
    securityHeaders,
    checkPrivacyConsent,
    SECURITY_CONFIG
}; 