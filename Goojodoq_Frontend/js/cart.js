// =============================================
// CART PAGE JAVASCRIPT
// =============================================

let cartData = null;
let selectedItems = new Set(); // Store selected item IDs

// Load cart when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
});

// Load cart from API
async function loadCart() {
    try {
        // Check if user is logged in
        if (!currentUser) {
            showNotification('Vui lòng đăng nhập để xem giỏ hàng!', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        console.log('🛒 Loading cart for user:', currentUser.id_nguoidung);

        const response = await fetch(`${API_BASE_URL}/cart/${currentUser.id_nguoidung}`);
        if (!response.ok) {
            throw new Error('Failed to fetch cart');
        }

        cartData = await response.json();
        console.log('📦 Cart data:', cartData);

        displayCart();

    } catch (error) {
        console.error('❌ Error loading cart:', error);
        document.getElementById('loadingCart').style.display = 'none';
        showNotification('Không thể tải giỏ hàng. Vui lòng thử lại!', 'error');
    }
}

// Display cart items
function displayCart() {
    const loadingCart = document.getElementById('loadingCart');
    const emptyCart = document.getElementById('emptyCart');
    const cartContent = document.getElementById('cartContent');
    const cartItems = document.getElementById('cartItems');

    loadingCart.style.display = 'none';

    if (!cartData.items || cartData.items.length === 0) {
        emptyCart.style.display = 'block';
        cartContent.style.display = 'none';
        return;
    }

    emptyCart.style.display = 'none';
    cartContent.style.display = 'flex';

    // Display cart items
    cartItems.innerHTML = cartData.items.map(item => {
        let imageUrl = item.image || '/images/products/default.jpg';
        if (imageUrl.startsWith('/images')) {
            imageUrl = `http://localhost:3000${imageUrl}`;
        }

        const itemTotal = item.soluong * parseFloat(item.gia_donvi);
        const isSelected = selectedItems.has(item.id_chitiet);

        return `
            <div class="cart-item ${isSelected ? 'selected' : ''}" data-item-id="${item.id_chitiet}">
                <div class="d-flex align-items-center">
                    <input type="checkbox" 
                           class="cart-checkbox" 
                           data-item-id="${item.id_chitiet}"
                           ${isSelected ? 'checked' : ''}
                           onchange="toggleItemSelection(${item.id_chitiet})">
                    
                    <img src="${imageUrl}" 
                         alt="${item.product_name}" 
                         class="cart-item-image"
                         onerror="this.src='images/products/default.jpg'">
                    
                    <div class="cart-item-info">
                        <h5 class="cart-item-title">${item.product_name}</h5>
                        <p class="text-muted mb-2">SKU: ${item.sku}</p>
                        <p class="cart-item-price">${formatPrice(item.gia_donvi)}</p>
                        ${item.stock < 10 ? `<p class="text-danger small mb-0">Chỉ còn ${item.stock} sản phẩm</p>` : ''}
                    </div>

                    <div class="d-flex flex-column align-items-end gap-3">
                        <div class="quantity-control">
                            <button class="quantity-btn" onclick="updateQuantity(${item.id_chitiet}, ${item.soluong - 1})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" 
                                   class="quantity-input" 
                                   value="${item.soluong}" 
                                   min="1" 
                                   max="${item.stock}"
                                   onchange="updateQuantity(${item.id_chitiet}, this.value)">
                            <button class="quantity-btn" onclick="updateQuantity(${item.id_chitiet}, ${item.soluong + 1})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        
                        <div class="d-flex align-items-center gap-3">
                            <strong class="text-primary">${formatPrice(itemTotal)}</strong>
                            <button class="btn-remove" onclick="removeItem(${item.id_chitiet})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Update total count
    document.getElementById('totalCount').textContent = cartData.items.length;

    // Update summary
    updateSummary();
    updateSelectionUI();
}

// Toggle item selection
function toggleItemSelection(itemId) {
    if (selectedItems.has(itemId)) {
        selectedItems.delete(itemId);
    } else {
        selectedItems.add(itemId);
    }
    
    // Update UI
    const itemElement = document.querySelector(`.cart-item[data-item-id="${itemId}"]`);
    if (itemElement) {
        if (selectedItems.has(itemId)) {
            itemElement.classList.add('selected');
        } else {
            itemElement.classList.remove('selected');
        }
    }
    
    updateSummary();
    updateSelectionUI();
}

// Toggle select all
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const isChecked = selectAllCheckbox.checked;
    
    if (isChecked) {
        // Select all items
        cartData.items.forEach(item => {
            selectedItems.add(item.id_chitiet);
        });
    } else {
        // Deselect all items
        selectedItems.clear();
    }
    
    // Update all checkboxes
    document.querySelectorAll('.cart-checkbox').forEach(checkbox => {
        checkbox.checked = isChecked;
    });
    
    // Update all item styles
    document.querySelectorAll('.cart-item').forEach(item => {
        if (isChecked) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
    
    updateSummary();
    updateSelectionUI();
}

// Update selection UI
function updateSelectionUI() {
    const selectedCount = selectedItems.size;
    const totalCount = cartData.items.length;
    
    document.getElementById('selectedCount').textContent = selectedCount;
    
    // Update select all checkbox
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    selectAllCheckbox.checked = selectedCount === totalCount && totalCount > 0;
    selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < totalCount;
}

// Update cart summary
function updateSummary() {
    // Calculate total for selected items only
    let subtotal = 0;
    let selectedCount = 0;
    
    if (cartData && cartData.items) {
        cartData.items.forEach(item => {
            if (selectedItems.has(item.id_chitiet)) {
                subtotal += item.soluong * parseFloat(item.gia_donvi);
                selectedCount++;
            }
        });
    }
    
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;

    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('selectedItemsCount').textContent = selectedCount;
    document.getElementById('shipping').textContent = shipping === 0 ? 'Miễn phí' : formatPrice(shipping);
    document.getElementById('total').textContent = formatPrice(total);
    document.getElementById('checkoutCount').textContent = selectedCount;
    
    // Enable/disable checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (selectedCount === 0) {
        checkoutBtn.disabled = true;
        checkoutBtn.classList.add('disabled');
    } else {
        checkoutBtn.disabled = false;
        checkoutBtn.classList.remove('disabled');
    }
}

// Update quantity
async function updateQuantity(itemId, newQuantity) {
    try {
        newQuantity = parseInt(newQuantity);

        if (newQuantity < 1) {
            if (confirm('Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?')) {
                await removeItem(itemId);
            }
            return;
        }

        // Find item to check stock
        const item = cartData.items.find(i => i.id_chitiet === itemId);
        if (item && newQuantity > item.stock) {
            showNotification(`Chỉ còn ${item.stock} sản phẩm trong kho!`, 'warning');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/cart/item/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity: newQuantity })
        });

        if (!response.ok) {
            throw new Error('Failed to update quantity');
        }

        // Reload cart
        await loadCart();
        showNotification('Đã cập nhật số lượng!', 'success');

    } catch (error) {
        console.error('Error updating quantity:', error);
        showNotification('Không thể cập nhật số lượng!', 'error');
    }
}

// Remove item from cart
async function removeItem(itemId) {
    try {
        if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
            return;
        }

        const response = await fetch(`${API_BASE_URL}/cart/item/${itemId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to remove item');
        }

        // Reload cart
        await loadCart();
        
        // Update cart count in header
        updateCartCount();
        
        showNotification('Đã xóa sản phẩm khỏi giỏ hàng!', 'success');

    } catch (error) {
        console.error('Error removing item:', error);
        showNotification('Không thể xóa sản phẩm!', 'error');
    }
}

// Clear entire cart
async function clearCart() {
    try {
        if (!confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
            return;
        }

        const response = await fetch(`${API_BASE_URL}/cart/clear/${currentUser.id_nguoidung}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to clear cart');
        }

        // Reload cart
        await loadCart();
        
        // Update cart count in header
        updateCartCount();
        
        showNotification('Đã xóa toàn bộ giỏ hàng!', 'success');

    } catch (error) {
        console.error('Error clearing cart:', error);
        showNotification('Không thể xóa giỏ hàng!', 'error');
    }
}

// Checkout
async function checkout() {
    if (!cartData || !cartData.items || cartData.items.length === 0) {
        showNotification('Giỏ hàng trống!', 'warning');
        return;
    }

    // Check if any items are selected
    if (selectedItems.size === 0) {
        showNotification('Vui lòng chọn ít nhất một sản phẩm để thanh toán!', 'warning');
        return;
    }

    try {
        // Check if user has complete address
        const response = await fetch(`${API_BASE_URL}/profile/${currentUser.id_nguoidung}/check-address`);
        if (!response.ok) {
            throw new Error('Failed to check address');
        }

        const result = await response.json();
        
        if (!result.hasAddress) {
            // Show modal or alert
            if (confirm('Bạn chưa hoàn thiện thông tin nhận hàng!\n\nVui lòng cập nhật đầy đủ thông tin (tên người nhận, số điện thoại, địa chỉ chi tiết, thành phố, quận/huyện) để có thể thanh toán.\n\nBạn có muốn đến trang thông tin cá nhân để cập nhật không?')) {
                window.location.href = 'profile.html';
            }
            return;
        }

        // Save selected items to sessionStorage
        const selectedItemsData = cartData.items.filter(item => selectedItems.has(item.id_chitiet));
        sessionStorage.setItem('selectedCartItems', JSON.stringify(selectedItemsData));

        // If address is complete, proceed to checkout page
        window.location.href = 'checkout.html';

    } catch (error) {
        console.error('Error during checkout:', error);
        showNotification('Không thể xử lý thanh toán. Vui lòng thử lại!', 'error');
    }
}
