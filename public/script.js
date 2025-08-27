// Global variables
let priceList = [];
let currentEditId = null;
let orders = [];
let selectedOrderItems = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentDate();
    loadPriceList();
    loadOrders();
    checkWhatsAppStatus();
    populateItemSelect();
    
    // Set up periodic checks
    setInterval(checkWhatsAppStatus, 5000);
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
        const response = await fetch('https://siritraders.com/api/prices');
        priceList = await response.json();
        displayPriceList();
        updateStats();
    } catch (error) {
        console.error('Error loading price list:', error);
        showAlert('Error loading price list', 'danger');
    }
}

// Display price list in table
function displayPriceList() {
    const tableBody = document.getElementById('priceListTable');
    tableBody.innerHTML = '';

    priceList.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${item.item}</strong></td>
            <td><span class="price-badge">₹${item.price}</span></td>
            <td><span class="category-badge">${item.category}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editItem(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById('itemCount').textContent = priceList.length;
}

// Update statistics
function updateStats() {
    const totalItems = priceList.length;
    const totalValue = priceList.reduce((sum, item) => sum + item.price, 0);
    
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('totalValue').textContent = `₹${totalValue.toFixed(2)}`;

    // Category breakdown
    const categoryStats = document.getElementById('categoryStats');
    const categories = {};
    
    priceList.forEach(item => {
        categories[item.category] = (categories[item.category] || 0) + 1;
    });

    categoryStats.innerHTML = '<h6>By Category:</h6>';
    Object.entries(categories).forEach(([category, count]) => {
        categoryStats.innerHTML += `
            <div class="d-flex justify-content-between mb-1">
                <small>${category}</small>
                <small class="text-muted">${count}</small>
            </div>
        `;
    });
}

// Add new item
async function addItem() {
    const itemName = document.getElementById('itemName').value;
    const itemPrice = parseFloat(document.getElementById('itemPrice').value);
    const itemCategory = document.getElementById('itemCategory').value;

    if (!itemName || !itemPrice || !itemCategory) {
        showAlert('Please fill all fields', 'warning');
        return;
    }

    try {
        const response = await fetch('https://siritraders.com/api/prices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                item: itemName,
                price: itemPrice,
                category: itemCategory
            })
        });

        if (response.ok) {
            await loadPriceList();
            document.getElementById('addItemForm').reset();
            bootstrap.Modal.getInstance(document.getElementById('addItemModal')).hide();
            showAlert('Item added successfully!', 'success');
        } else {
            showAlert('Error adding item', 'danger');
        }
    } catch (error) {
        console.error('Error adding item:', error);
        showAlert('Error adding item', 'danger');
    }
}

// Edit item
function editItem(id) {
    const item = priceList.find(item => item.id === id);
    if (item) {
        currentEditId = id;
        document.getElementById('editItemId').value = id;
        document.getElementById('editItemName').value = item.item;
        document.getElementById('editItemPrice').value = item.price;
        document.getElementById('editItemCategory').value = item.category;
        
        const editModal = new bootstrap.Modal(document.getElementById('editItemModal'));
        editModal.show();
    }
}

// Update item
async function updateItem() {
    const id = currentEditId;
    const itemName = document.getElementById('editItemName').value;
    const itemPrice = parseFloat(document.getElementById('editItemPrice').value);
    const itemCategory = document.getElementById('editItemCategory').value;

    if (!itemName || !itemPrice || !itemCategory) {
        showAlert('Please fill all fields', 'warning');
        return;
    }

    try {
        const response = await fetch(`/api/prices/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                item: itemName,
                price: itemPrice,
                category: itemCategory
            })
        });

        if (response.ok) {
            await loadPriceList();
            bootstrap.Modal.getInstance(document.getElementById('editItemModal')).hide();
            showAlert('Item updated successfully!', 'success');
        } else {
            showAlert('Error updating item', 'danger');
        }
    } catch (error) {
        console.error('Error updating item:', error);
        showAlert('Error updating item', 'danger');
    }
}

// Delete item
async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }

    try {
        const response = await fetch(`/api/prices/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadPriceList();
            showAlert('Item deleted successfully!', 'success');
        } else {
            showAlert('Error deleting item', 'danger');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        showAlert('Error deleting item', 'danger');
    }
}

// Handle Excel file upload
document.getElementById('uploadForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData();
    const fileInput = document.getElementById('excelFile');
    
    if (fileInput.files.length === 0) {
        showAlert('Please select a file', 'warning');
        return;
    }
    
    formData.append('file', fileInput.files[0]);

    try {
        const response = await fetch('https://siritraders.com/api/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            await loadPriceList();
            fileInput.value = '';
            showAlert('Price list updated from Excel file!', 'success');
        } else {
            showAlert('Error uploading file', 'danger');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        showAlert('Error uploading file', 'danger');
    }
});

// Check WhatsApp connection status
async function checkWhatsAppStatus() {
    try {
        const response = await fetch('https://siritraders.com/api/whatsapp/qr');
        const data = await response.json();
        
        const qrSection = document.getElementById('qrSection');
        const connectionStatus = document.getElementById('connectionStatus');
        const sendSection = document.getElementById('sendSection');
        const manualSection = document.getElementById('manualSection');
        
        // Always show manual section for better compatibility
        qrSection.style.display = 'none';
        connectionStatus.style.display = 'none';
        sendSection.style.display = 'none';
        manualSection.style.display = 'block';
        
    } catch (error) {
        console.error('Error checking WhatsApp status:', error);
        // Show manual section on error
        document.getElementById('qrSection').style.display = 'none';
        document.getElementById('connectionStatus').style.display = 'none';
        document.getElementById('sendSection').style.display = 'none';
        document.getElementById('manualSection').style.display = 'block';
    }
}

// Send price list via WhatsApp
async function sendPriceList() {
    const phoneNumber = document.getElementById('phoneNumber').value;
    
    if (!phoneNumber) {
        showAlert('Please enter a phone number', 'warning');
        return;
    }

    if (priceList.length === 0) {
        showAlert('No items in price list to send', 'warning');
        return;
    }

    try {
        const response = await fetch('https://siritraders.com/api/whatsapp/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phoneNumber })
        });

        if (response.ok) {
            showAlert('Price list sent successfully!', 'success');
            document.getElementById('phoneNumber').value = '';
        } else {
            const error = await response.json();
            showAlert(error.error || 'Error sending message', 'danger');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showAlert('Error sending message', 'danger');
    }
}

// Copy price list to clipboard
async function copyPriceList() {
    if (priceList.length === 0) {
        showAlert('No items in price list to copy', 'warning');
        return;
    }

    try {
        // Create formatted price list message
        const today = new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        let message = `🏪 *SIRI TRADERS - Wholesale Kirana & Groceries*\n`;
        message += `📅 *Price List - ${today}*\n\n`;
        message += `🆕 *Fresh Stock Available*\n`;
        message += `💰 *Best Prices Compared to DMart*\n`;
        message += `🎯 *Bulk Order Discounts*\n\n`;
        
        // Group items by category
        const groupedItems = priceList.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {});
        
        Object.keys(groupedItems).forEach(category => {
            message += `📦 *${category.toUpperCase()}*\n`;
            groupedItems[category].forEach(item => {
                message += `• ${item.item}: ₹${item.price}\n`;
            });
            message += '\n';
        });
        
        message += `🚚 *Delivery Information:*\n`;
        message += `• Free delivery within 3km for orders above ₹1000\n`;
        message += `• Free delivery within 1km for orders above ₹500\n`;
        message += `• ₹50 delivery fee for other orders\n\n`;
        message += `📞 *Contact:* +91-9963321819\n`;
        message += `🌐 *Order Online:* https://siritraders.com/orders\n`;
        message += `🆕 *Fresh Stock Available*\n`;
        message += `💰 *Bulk Order Discounts*`;
        
        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(message);
            showAlert('Price list copied to clipboard!', 'success');
        } else {
            // Fallback method for older browsers or non-secure contexts
            fallbackCopyTextToClipboard(message);
        }
    } catch (error) {
        console.error('Error copying price list:', error);
        showAlert('Error copying price list', 'danger');
    }
}

// Copy order instructions to clipboard
async function copyOrderInstructions() {
    try {
        // Create order instructions message
        let instructions = `📋 *SIRI TRADERS - How to Place Orders*\n\n`;
        instructions += `🛒 *Order Process:*\n`;
        instructions += `1. Visit: https://siritraders.com/orders\n`;
        instructions += `2. Select items and quantities\n`;
        instructions += `3. Fill customer details\n`;
        instructions += `4. Click "Place Order"\n`;
        instructions += `5. Share location when prompted\n\n`;
        instructions += `🚚 *Delivery Information:*\n`;
        instructions += `• Free delivery within 3km for orders above ₹1000\n`;
        instructions += `• Free delivery within 1km for orders above ₹500\n`;
        instructions += `• ₹50 delivery fee for other orders\n\n`;
        instructions += `📞 *Contact:* +91-9963321819\n`;
        instructions += `🏪 *SIRI TRADERS - Wholesale Kirana & Groceries*\n`;
        instructions += `🆕 *Fresh Stock Available*\n`;
        instructions += `💰 *Bulk Order Discounts*`;
        
        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(instructions);
            showAlert('Order instructions copied to clipboard!', 'success');
        } else {
            // Fallback method for older browsers or non-secure contexts
            fallbackCopyTextToClipboard(instructions);
        }
    } catch (error) {
        console.error('Error copying order instructions:', error);
        showAlert('Error copying order instructions', 'danger');
    }
}

// Load orders
async function loadOrders() {
    try {
        const response = await fetch('https://siritraders.com/api/orders');
        orders = await response.json();
        displayOrders();
    } catch (error) {
        console.error('Error loading orders:', error);
        showAlert('Error loading orders', 'danger');
    }
}

// Display orders in table
function displayOrders() {
    const tableBody = document.getElementById('ordersTable');
    tableBody.innerHTML = '';

    orders.forEach(order => {
        const row = document.createElement('tr');
        const statusBadge = getStatusBadge(order.status);
        const itemsText = order.items.length > 0 ? 
            `${order.items.length} items` : 'No items';
        
        row.innerHTML = `
            <td><strong>#${order.id}</strong></td>
            <td>
                <div><strong>${order.customerName}</strong></div>
                <small class="text-muted">${order.customerPhone}</small>
            </td>
            <td>${itemsText}</td>
            <td><span class="price-badge">₹${order.totalAmount}</span></td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewOrder(${order.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-success me-1" onclick="updateOrderStatus(${order.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteOrder(${order.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Get status badge
function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="badge bg-warning">Pending</span>',
        'confirmed': '<span class="badge bg-info">Confirmed</span>',
        'preparing': '<span class="badge bg-primary">Preparing</span>',
        'delivered': '<span class="badge bg-success">Delivered</span>',
        'cancelled': '<span class="badge bg-danger">Cancelled</span>'
    };
    return badges[status] || '<span class="badge bg-secondary">Unknown</span>';
}

// Populate item select dropdown
function populateItemSelect() {
    const select = document.getElementById('itemSelect');
    select.innerHTML = '<option value="">Select Item</option>';
    
    priceList.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.item} - ₹${item.price}`;
        select.appendChild(option);
    });
}

// Add item to order
function addOrderItem() {
    const itemId = document.getElementById('itemSelect').value;
    const quantity = parseInt(document.getElementById('itemQuantity').value) || 1;
    
    if (!itemId) {
        showAlert('Please select an item', 'warning');
        return;
    }
    
    const item = priceList.find(i => i.id == itemId);
    if (item) {
        const orderItem = {
            id: item.id,
            name: item.item,
            price: item.price,
            quantity: quantity,
            total: item.price * quantity
        };
        
        selectedOrderItems.push(orderItem);
        updateSelectedItemsDisplay();
        updateOrderTotal();
        
        // Reset form
        document.getElementById('itemSelect').value = '';
        document.getElementById('itemQuantity').value = '1';
    }
}

// Update selected items display
function updateSelectedItemsDisplay() {
    const container = document.getElementById('selectedItems');
    container.innerHTML = '';
    
    selectedOrderItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'alert alert-light d-flex justify-content-between align-items-center';
        itemDiv.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                <small>₹${item.price} × ${item.quantity} = ₹${item.total}</small>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeOrderItem(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(itemDiv);
    });
}

// Remove item from order
function removeOrderItem(index) {
    selectedOrderItems.splice(index, 1);
    updateSelectedItemsDisplay();
    updateOrderTotal();
}

// Update order total
function updateOrderTotal() {
    const total = selectedOrderItems.reduce((sum, item) => sum + item.total, 0);
    document.getElementById('orderTotal').textContent = total.toFixed(2);
}

// Save order
async function saveOrder() {
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const deliveryAddress = document.getElementById('deliveryAddress').value;
    const notes = document.getElementById('orderNotes').value;
    
    if (!customerName || !customerPhone) {
        showAlert('Please fill customer name and phone', 'warning');
        return;
    }
    
    if (selectedOrderItems.length === 0) {
        showAlert('Please add at least one item', 'warning');
        return;
    }
    
    const totalAmount = selectedOrderItems.reduce((sum, item) => sum + item.total, 0);
    
    try {
        const response = await fetch('https://siritraders.com/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customerName,
                customerPhone,
                items: selectedOrderItems,
                totalAmount,
                deliveryAddress,
                notes
            })
        });
        
        if (response.ok) {
            await loadOrders();
            resetOrderForm();
            bootstrap.Modal.getInstance(document.getElementById('addOrderModal')).hide();
            showAlert('Order saved successfully!', 'success');
        } else {
            showAlert('Error saving order', 'danger');
        }
    } catch (error) {
        console.error('Error saving order:', error);
        showAlert('Error saving order', 'danger');
    }
}

// Reset order form
function resetOrderForm() {
    document.getElementById('addOrderForm').reset();
    selectedOrderItems = [];
    updateSelectedItemsDisplay();
    updateOrderTotal();
}

// View order details
function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        const modal = document.getElementById('viewOrderModal');
        const body = document.getElementById('orderDetails');
        
        body.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Customer Information</h6>
                    <p><strong>Name:</strong> ${order.customerName}</p>
                    <p><strong>Phone:</strong> ${order.customerPhone}</p>
                    <p><strong>Address:</strong> ${order.deliveryAddress || 'Not provided'}</p>
                    ${order.location ? `
                        <p><strong>Location:</strong> 
                            <a href="https://www.google.com/maps?q=${order.location.latitude},${order.location.longitude}" 
                               target="_blank" class="btn btn-sm btn-outline-primary">
                                <i class="fas fa-map-marker-alt"></i> View on Map
                            </a>
                        </p>
                    ` : ''}
                </div>
                <div class="col-md-6">
                    <h6>Order Information</h6>
                    <p><strong>Order #:</strong> ${order.id}</p>
                    <p><strong>Status:</strong> ${getStatusBadge(order.status)}</p>
                    <p><strong>Total:</strong> ₹${order.totalAmount}</p>
                    <p><strong>Created:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                </div>
            </div>
            <hr>
            <h6>Items</h6>
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>₹${item.price}</td>
                                <td>${item.quantity}</td>
                                <td>₹${item.total}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ${order.notes ? `<hr><h6>Notes</h6><p>${order.notes}</p>` : ''}
        `;
        
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    }
}

// Update order status
async function updateOrderStatus(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const statuses = ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'];
    const currentIndex = statuses.indexOf(order.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    try {
        const response = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: nextStatus })
        });
        
        if (response.ok) {
            await loadOrders();
            showAlert(`Order status updated to ${nextStatus}`, 'success');
        } else {
            showAlert('Error updating order status', 'danger');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showAlert('Error updating order status', 'danger');
    }
}

// Delete order
async function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadOrders();
            showAlert('Order deleted successfully!', 'success');
        } else {
            showAlert('Error deleting order', 'danger');
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        showAlert('Error deleting order', 'danger');
    }
}

// Copy latest order notification
async function copyLatestOrder() {
    try {
        const response = await fetch('/latest_order.txt');
        if (response.ok) {
            const orderMessage = await response.text();
            
            // Try modern clipboard API first
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(orderMessage);
                showAlert('Latest order notification copied to clipboard!', 'success');
            } else {
                // Fallback method
                fallbackCopyTextToClipboard(orderMessage);
            }
        } else {
            showAlert('No recent orders found', 'warning');
        }
    } catch (error) {
        console.error('Error copying latest order:', error);
        showAlert('Error copying order notification', 'danger');
    }
}

// Open WhatsApp notification link
async function openWhatsAppNotification() {
    try {
        const response = await fetch('/whatsapp_notification_link.txt');
        if (response.ok) {
            const whatsappLink = await response.text();
            window.open(whatsappLink, '_blank');
            showAlert('WhatsApp notification link opened!', 'success');
        } else {
            showAlert('No recent orders found', 'warning');
        }
    } catch (error) {
        console.error('Error opening WhatsApp notification:', error);
        showAlert('Error opening WhatsApp notification', 'danger');
    }
}

// Fallback copy function for older browsers
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showAlert('Text copied to clipboard!', 'success');
        } else {
            showAlert('Copy failed. Please select and copy manually.', 'warning');
            // Show the text in a modal for manual copying
            showTextForManualCopy(text);
        }
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        showAlert('Copy failed. Please select and copy manually.', 'warning');
        // Show the text in a modal for manual copying
        showTextForManualCopy(text);
    }
    
    document.body.removeChild(textArea);
}

// Show text in modal for manual copying
function showTextForManualCopy(text) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'copyModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Copy Text Manually</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>Please select and copy the text below:</p>
                    <textarea class="form-control" rows="10" readonly>${text}</textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    // Remove modal from DOM after it's hidden
    modal.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
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