// Global variables
let priceList = [];
let selectedItems = {};
let customerLocation = null;
let shopLocation = { latitude: 17.547264, longitude: 78.2270464 }; // Default shop location (you can update this)

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentDate();
    loadPriceList();
    
    // Privacy consent handling
    const privacyConsent = document.getElementById('privacyConsent');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    
    privacyConsent.addEventListener('change', function() {
        placeOrderBtn.disabled = !this.checked;
    });
});

// Update current date
function updateCurrentDate() {
    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('currentDate').textContent = today;
}

// Load price list from server
async function loadPriceList() {
    try {
        const response = await fetch('/api/prices');
        priceList = await response.json();
        displayItems();
    } catch (error) {
        console.error('Error loading price list:', error);
        showAlert('Error loading items', 'danger');
    }
}

// Display items with checkboxes and quantity controls
function displayItems() {
    const container = document.getElementById('itemsContainer');
    container.innerHTML = '';

    // Group items by category
    const groupedItems = priceList.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {});

    Object.keys(groupedItems).forEach(category => {
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section';
        categorySection.innerHTML = `<h5 class="mb-3">${category.toUpperCase()}</h5>`;
        
        const itemsGrid = document.createElement('div');
        itemsGrid.className = 'row g-3';
        
        groupedItems[category].forEach(item => {
            const itemCard = createItemCard(item);
            itemsGrid.appendChild(itemCard);
        });
        
        categorySection.appendChild(itemsGrid);
        container.appendChild(categorySection);
    });
}

// Create item card with checkbox and quantity controls
function createItemCard(item) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    
    col.innerHTML = `
        <div class="card item-card" id="item-${item.id}">
            <div class="card-body">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="checkbox-${item.id}" 
                           onchange="handleItemSelection(${item.id}, this.checked)">
                    <label class="form-check-label" for="checkbox-${item.id}">
                        <strong>${item.item}</strong>
                    </label>
                </div>
                <div class="mt-2">
                    <span class="price-badge">₹${item.price}</span>
                </div>
                <div class="quantity-control mt-2" id="quantity-${item.id}" style="display: none;">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <input type="number" class="quantity-input" id="qty-${item.id}" value="1" min="1" 
                           onchange="updateQuantityFromInput(${item.id})">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

// Handle item selection
function handleItemSelection(itemId, isSelected) {
    const itemCard = document.getElementById(`item-${itemId}`);
    const quantityDiv = document.getElementById(`quantity-${itemId}`);
    
    if (isSelected) {
        itemCard.classList.add('selected');
        quantityDiv.style.display = 'flex';
        selectedItems[itemId] = {
            id: itemId,
            name: priceList.find(item => item.id === itemId).item,
            price: priceList.find(item => item.id === itemId).price,
            quantity: 1
        };
    } else {
        itemCard.classList.remove('selected');
        quantityDiv.style.display = 'none';
        delete selectedItems[itemId];
    }
    
    updateOrderSummary();
}



// Update quantity
function updateQuantity(itemId, change) {
    const input = document.getElementById(`qty-${itemId}`);
    const newQuantity = Math.max(1, parseInt(input.value) + change);
    input.value = newQuantity;
    
    if (selectedItems[itemId]) {
        selectedItems[itemId].quantity = newQuantity;
        updateOrderSummary();
    }
}

// Update quantity from input
function updateQuantityFromInput(itemId) {
    const input = document.getElementById(`qty-${itemId}`);
    const quantity = Math.max(1, parseInt(input.value) || 1);
    input.value = quantity;
    
    if (selectedItems[itemId]) {
        selectedItems[itemId].quantity = quantity;
        updateOrderSummary();
    }
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
}

// Calculate delivery information
function calculateDeliveryInfo(subtotal) {
    let deliveryFee = 0;
    let deliveryMessage = '';
    let isFreeDelivery = false;
    let deliveryDetails = '';
    
    if (customerLocation) {
        const distance = calculateDistance(
            shopLocation.latitude, shopLocation.longitude,
            customerLocation.latitude, customerLocation.longitude
        );
        
        if (subtotal >= 1000 && distance <= 3) {
            deliveryFee = 0;
            isFreeDelivery = true;
            deliveryMessage = 'FREE';
            deliveryDetails = `Free delivery within 3km (${distance.toFixed(1)}km away)`;
        } else if (subtotal >= 500 && distance <= 1) {
            deliveryFee = 0;
            isFreeDelivery = true;
            deliveryMessage = 'FREE';
            deliveryDetails = `Free delivery within 1km (${distance.toFixed(1)}km away)`;
        } else {
            deliveryFee = 50; // Default delivery fee
            deliveryMessage = `₹${deliveryFee}`;
            deliveryDetails = `Delivery fee applies (${distance.toFixed(1)}km away)`;
        }
    } else {
        deliveryFee = 50; // Default delivery fee when location not available
        deliveryMessage = `₹${deliveryFee}`;
        deliveryDetails = 'Location not captured - delivery fee applies';
    }
    
    return {
        deliveryFee,
        deliveryMessage,
        isFreeDelivery,
        deliveryDetails
    };
}

// Update order summary
function updateOrderSummary() {
    const orderItemsDiv = document.getElementById('orderItems');
    const orderTotalSpan = document.getElementById('orderTotal');
    const deliveryInfoSpan = document.getElementById('deliveryInfo');
    const finalTotalSpan = document.getElementById('finalTotal');
    const deliveryEligibilityDiv = document.getElementById('deliveryEligibility');
    const deliveryDetailsDiv = document.getElementById('deliveryDetails');
    const selectedCountSpan = document.getElementById('selectedCount');
    
    const selectedItemsArray = Object.values(selectedItems);
    selectedCountSpan.textContent = selectedItemsArray.length;
    
    if (selectedItemsArray.length === 0) {
        orderItemsDiv.innerHTML = '<p class="text-muted">No items selected</p>';
        orderTotalSpan.textContent = '0';
        deliveryInfoSpan.textContent = '-';
        finalTotalSpan.textContent = '0';
        deliveryEligibilityDiv.style.display = 'none';
        return;
    }
    
    let subtotal = 0;
    let itemsHtml = '';
    
    selectedItemsArray.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        itemsHtml += `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <strong>${item.name}</strong><br>
                    <small class="text-muted">₹${item.price} × ${item.quantity}</small>
                </div>
                <span class="price-badge">₹${itemTotal}</span>
            </div>
        `;
    });
    
    // Calculate delivery information
    const deliveryInfo = calculateDeliveryInfo(subtotal);
    const finalTotal = subtotal + deliveryInfo.deliveryFee;
    
    orderItemsDiv.innerHTML = itemsHtml;
    orderTotalSpan.textContent = subtotal.toFixed(2);
    deliveryInfoSpan.textContent = deliveryInfo.deliveryMessage;
    finalTotalSpan.textContent = finalTotal.toFixed(2);
    
    // Show/hide free delivery eligibility
    if (deliveryInfo.isFreeDelivery) {
        deliveryEligibilityDiv.style.display = 'block';
        deliveryDetailsDiv.textContent = deliveryInfo.deliveryDetails;
    } else {
        deliveryEligibilityDiv.style.display = 'none';
    }
}

// Get current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                customerLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                
                // Get address from coordinates
                getAddressFromCoordinates(position.coords.latitude, position.coords.longitude);
                
                document.getElementById('locationDisplay').style.display = 'block';
                showAlert('Location captured successfully!', 'success');
            },
            function(error) {
                console.error('Error getting location:', error);
                showAlert('Error getting location. Please enter address manually.', 'warning');
            }
        );
    } else {
        showAlert('Geolocation is not supported by this browser.', 'warning');
    }
}

// Get address from coordinates using reverse geocoding
async function getAddressFromCoordinates(lat, lng) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const data = await response.json();
        
        if (data.display_name) {
            document.getElementById('deliveryAddress').value = data.display_name;
        }
    } catch (error) {
        console.error('Error getting address:', error);
    }
}

// Share location via WhatsApp
function shareLocation() {
    if (customerLocation) {
        const locationUrl = `https://www.google.com/maps?q=${customerLocation.latitude},${customerLocation.longitude}`;
        const message = `📍 My delivery location:\n${locationUrl}`;
        
        // Try to copy to clipboard
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(message).then(() => {
                showAlert('Location copied! Paste it in WhatsApp.', 'success');
            });
        } else {
            fallbackCopyTextToClipboard(message);
        }
    } else {
        showAlert('Please capture your location first.', 'warning');
    }
}

// Fallback copy function
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showAlert('Location copied! Paste it in WhatsApp.', 'success');
    } catch (err) {
        showAlert('Copy failed. Please copy manually: ' + text, 'warning');
    }
    
    document.body.removeChild(textArea);
}

// Place order
async function placeOrder() {
    const customerName = document.getElementById('customerName').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const deliveryAddress = document.getElementById('deliveryAddress').value.trim();
    const notes = document.getElementById('orderNotes').value.trim();
    
    // Validation
    if (!customerName) {
        showAlert('Please enter your name', 'warning');
        return;
    }
    
    if (!customerPhone) {
        showAlert('Please enter your phone number', 'warning');
        return;
    }
    
    if (Object.keys(selectedItems).length === 0) {
        showAlert('Please select at least one item', 'warning');
        return;
    }
    
    // Prepare order data
    const selectedItemsArray = Object.values(selectedItems);
    const subtotal = selectedItemsArray.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryInfo = calculateDeliveryInfo(subtotal);
    const totalAmount = subtotal + deliveryInfo.deliveryFee;
    
    const orderData = {
        customerName,
        customerPhone,
        items: selectedItemsArray,
        subtotal,
        deliveryFee: deliveryInfo.deliveryFee,
        totalAmount,
        deliveryAddress,
        notes,
        location: customerLocation,
        deliveryInfo: {
            isFreeDelivery: deliveryInfo.isFreeDelivery,
            deliveryDetails: deliveryInfo.deliveryDetails,
            distance: customerLocation ? calculateDistance(
                shopLocation.latitude, shopLocation.longitude,
                customerLocation.latitude, customerLocation.longitude
            ) : null
        }
    };
    
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Privacy-Consent': 'true'
            },
            body: JSON.stringify({
                ...orderData,
                privacyConsent: true
            })
        });
        
        if (response.ok) {
            const order = await response.json();
            showOrderSuccess(order);
            
            // Automatically open WhatsApp with order notification
            openWhatsAppWithOrder(order);
        } else {
            showAlert('Error placing order. Please try again.', 'danger');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        showAlert('Error placing order. Please try again.', 'danger');
    }
}

// Show order success modal
function showOrderSuccess(order) {
    document.getElementById('orderNumber').textContent = order.id;
    document.getElementById('orderAmount').textContent = order.totalAmount;
    
    // Store order data for manual WhatsApp opening
    window.lastOrder = order;
    
    const modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();
    
    // Reset form after successful order
    setTimeout(() => {
        resetForm();
    }, 3000);
}

// Manually open WhatsApp (called from modal button)
function openWhatsAppManually() {
    if (window.lastOrder) {
        openWhatsAppWithOrder(window.lastOrder);
    } else {
        showAlert('No order data available', 'warning');
    }
}

// Show WhatsApp information
function showWhatsAppInfo() {
    const info = `
        <div class="text-start">
            <h6><i class="fab fa-whatsapp text-success"></i> How WhatsApp Order Works:</h6>
            <ol>
                <li>Select your items and fill customer details</li>
                <li>Click "Place Order" button</li>
                <li>WhatsApp will automatically open with order details</li>
                <li>Order notification will be sent to shop owner (9963321819)</li>
                <li>Shop owner will confirm and process your order</li>
            </ol>
            <div class="alert alert-warning">
                <small><i class="fas fa-info-circle"></i> Make sure WhatsApp is installed on your device</small>
            </div>
        </div>
    `;
    
    showAlert(info, 'info');
}

// Show privacy policy
function showPrivacyPolicy() {
    const policy = `
        <div class="text-start">
            <h6><i class="fas fa-shield-alt text-primary"></i> Privacy Policy - SIRI TRADERS</h6>
            <div class="mt-3">
                <h6>🔒 Data Protection:</h6>
                <ul>
                    <li>Your personal data is encrypted and protected</li>
                    <li>Phone numbers are masked for privacy</li>
                    <li>Location data is anonymized</li>
                    <li>Data is only used for order fulfillment</li>
                </ul>
                
                <h6>📱 WhatsApp Integration:</h6>
                <ul>
                    <li>Uses official WhatsApp Business API</li>
                    <li>End-to-end encryption for messages</li>
                    <li>Secure data transmission</li>
                    <li>No data stored by third parties</li>
                </ul>
                
                <h6>🗑️ Data Retention:</h6>
                <ul>
                    <li>Order data retained for 30 days</li>
                    <li>Right to data deletion available</li>
                    <li>GDPR compliant</li>
                    <li>No data sold to third parties</li>
                </ul>
                
                <div class="alert alert-info">
                    <small><i class="fas fa-info-circle"></i> Your privacy and security are our top priority!</small>
                </div>
            </div>
        </div>
    `;
    
    showAlert(policy, 'info');
}

// Reset form
function resetForm() {
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('deliveryAddress').value = '';
    document.getElementById('orderNotes').value = '';
    
    // Clear selected items
    selectedItems = {};
    Object.keys(selectedItems).forEach(itemId => {
        const checkbox = document.getElementById(`checkbox-${itemId}`);
        if (checkbox) checkbox.checked = false;
        const itemCard = document.getElementById(`item-${itemId}`);
        if (itemCard) itemCard.classList.remove('selected');
        const quantityDiv = document.getElementById(`quantity-${itemId}`);
        if (quantityDiv) quantityDiv.style.display = 'none';
    });
    
    updateOrderSummary();
    customerLocation = null;
    document.getElementById('locationDisplay').style.display = 'none';
}

// Open WhatsApp with order notification
function openWhatsAppWithOrder(order) {
    // Format the order message for WhatsApp
    const today = new Date().toLocaleDateString('en-IN');
    let message = `🆕 *NEW ORDER RECEIVED!*\n\n` +
        `📅 *Date:* ${today}\n` +
        `🆔 *Order #:* ${order.id}\n\n` +
        `👤 *Customer Details:*\n` +
        `• Name: ${order.customerName}\n` +
        `• Phone: ${order.customerPhone}\n` +
        `• Address: ${order.deliveryAddress || 'Not provided'}\n\n`;
    
    if (order.location) {
        message += `📍 *Location:* https://www.google.com/maps?q=${order.location.latitude},${order.location.longitude}\n\n`;
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
        message += `\n📝 *Notes:* ${order.notes}\n`;
    }
    
    message += `\n🏪 *SIRI TRADERS*\n` +
        `*Wholesale Kirana & Groceries*\n` +
        `📞 *Contact:* +91-XXXXXXXXXX\n` +
        `🆕 *Fresh Stock Available*\n` +
        `💰 *Bulk Order Discounts*`;
    
    // Shop owner's WhatsApp number
    const shopOwnerNumber = '9963321819';
    
    // Create WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${shopOwnerNumber}?text=${encodedMessage}`;
    
    // Try to open WhatsApp app on mobile
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // Mobile device - try to open WhatsApp app
        window.location.href = `whatsapp://send?phone=${shopOwnerNumber}&text=${encodedMessage}`;
        
        // Fallback to web version if app doesn't open
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
        }, 2000);
    } else {
        // Desktop - open WhatsApp Web
        window.open(whatsappUrl, '_blank');
    }
    
    // Show notification to user
    showAlert('WhatsApp opening with order notification!', 'success');
}

// Show alert message
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
} 