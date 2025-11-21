// =============================================
// CART PAGE JAVASCRIPT
// =============================================

const API_BASE_URL = 'http://localhost:3000/api';

// Global variables
let cart = [];
let isUpdating = false;

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    displayCart();
    loadRelatedProducts();
    
    // Update user display and cart count
    if (typeof updateUserDisplay === 'function') {
        updateUserDisplay();
    }
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
});

// =============================================
// CART MANAGEMENT
// =============================================
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    cart = savedCart ? JSON.parse(savedCart) : [];
    console.log('📦 Loaded cart:', cart);
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count in header
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
    
    console.log('💾 Saved cart:', cart);
}

function displayCart() {
    const cartContent = document.getElementById('cartContent');
    
    if (cart.length === 0) {
        displayEmptyCart();
        return;
    }
    
    let html = `
        <div class="col-lg-8">
            <div class="cart-table">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th class="text-center">Đơn giá</th>
                            <th class="text-center">Số lượng</th>
                            <th class="text-center">Thành tiền</th>
                            <th class="text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        
        html += `
            <tr class="cart-item" data-index="${index}">
                <td>
                    <div class="product-info">
                        <div class="product-image">
                            <img src="${item.image}" alt="${item.name}" onerror="this.src='images/products/default.jpg'">
                        </div>
                        <div class="product-details">
                            <h6>${item.name}</h6>
                            <div class="product-price">${formatPrice(item.price)}</div>
                        </div>
                    </div>
                </td>
                <td class="text-center">
                    <strong>${formatPrice(item.price)}</strong>
                </td>
                <td class="text-center">
                    <div class="quantity-controls">
                        <button class="btn-quantity" onclick="decreaseQuantity(${index})" ${item.quantity <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="quantity-input" value="${item.quantity}" 
                               min="1" max="99" onchange="updateQuantity(${index}, this.value)">
                        <button class="btn-quantity" onclick="increaseQuantity(${index})" ${item.quantity >= 99 ? 'disabled' : ''}>
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </td>
                <td class="text-center">
                    <div class="subtotal">${formatPrice(subtotal)}</div>
                </td>
                <td class="text-center">
                    <button class="btn-remove" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash me-1"></i>Xóa
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
            
            <!-- Cart Actions -->
            <div class="cart-actions">
                <div class="row">
                    <div class="col-md-6">
                        <a href="shop.html" class="btn-continue-shopping">
                            <i class="fas fa-arrow-left"></i>
                            Tiếp tục mua sắm
                        </a>
                    </div>
                    <div class="col-md-6 text-end">
                        <button class="btn-clear-cart" onclick="clearCart()">
                            <i class="fas fa-trash me-2"></i>
                            Xóa tất cả
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-lg-4">
            ${generateCartSummary()}
        </div>
    `;
    
    cartContent.innerHTML = html;
}

function displayEmptyCart() {
    const cartContent = document.getElementById('cartContent');
    
    cartContent.innerHTML = `
        <div class="col-12">
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Giỏ hàng của bạn đang trống</h3>
                <p>Hãy thêm một số sản phẩm vào giỏ hàng để tiếp tục mua sắm.</p>
                <a href="shop.html" class="btn btn-primary btn-lg">
                    <i class="fas fa-shopping-bag me-2"></i>
                    Bắt đầu mua sắm
                </a>
            </div>
        </div>
    `;
    
    // Hide related products when cart is empty
    document.getElementById('relatedProductsSection').style.display = 'none';
}

function generateCartSummary() {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping(subtotal);
    const discount = calculateDiscount(subtotal);
    const total = subtotal + shipping - discount;
    
    return `
        <div class="cart-summary">
            <h4>
                <i class="fas fa-calculator me-2"></i>
                Tổng đơn hàng
            </h4>
            
            <div class="summary-row">
                <span class="summary-label">Tạm tính:</span>
                <span class="summary-value">${formatPrice(subtotal)}</span>
            </div>
            
            <div class="summary-row">
                <span class="summary-label">Phí vận chuyển:</span>
                <span class="summary-value">${shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}</span>
            </div>
            
            ${discount > 0 ? `
                <div class="summary-row">
                    <span class="summary-label">Giảm giá:</span>
                    <span class="summary-value text-success">-${formatPrice(discount)}</span>
                </div>
            ` : ''}
            
            <div class="summary-row total">
                <span class="summary-label">Tổng cộng:</span>
                <span class="summary-value total">${formatPrice(total)}</span>
            </div>
            
            <!-- Coupon Section -->
            <div class="coupon-section">
                <h6><i class="fas fa-ticket-alt me-2"></i>Mã giảm giá</h6>
                <div class="coupon-input">
                    <input type="text" id="couponCode" placeholder="Nhập mã giảm giá" class="form-control">
                    <button class="btn-apply-coupon" onclick="applyCoupon()">
                        <i class="fas fa-check me-1"></i>Áp dụng
                    </button>
                </div>
            </div>
            
            <button class="btn-checkout" onclick="proceedToCheckout()" ${cart.length === 0 ? 'disabled' : ''}>
                <i class="fas fa-credit-card me-2"></i>
                Tiến hành thanh toán
            </button>
        </div>
    `;
}

// =============================================
// QUANTITY MANAGEMENT
// =============================================
function increaseQuantity(index) {
    if (isUpdating) return;
    
    if (cart[index].quantity < 99) {
        cart[index].quantity++;
        saveCart();
        displayCart();
        
        showNotification('Đã cập nhật số lượng!', 'success');
    }
}

function decreaseQuantity(index) {
    if (isUpdating) return;
    
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
        saveCart();
        displayCart();
        
        showNotification('Đã cập nhật số lượng!', 'success');
    }
}

function updateQuantity(index, newQuantity) {
    if (isUpdating) return;
    
    let quantity = parseInt(newQuantity);
    
    if (isNaN(quantity) || quantity < 1) {
        quantity = 1;
    } else if (quantity > 99) {
        quantity = 99;
    }
    
    cart[index].quantity = quantity;
    saveCart();
    displayCart();
    
    showNotification('Đã cập nhật số lượng!', 'success');
}

function removeFromCart(index) {
    if (isUpdating) return;
    
    const item = cart[index];
    
    if (confirm(`Bạn có chắc muốn xóa "${item.name}" khỏi giỏ hàng?`)) {
        // Add removing animation
        const row = document.querySelector(`tr[data-index="${index}"]`);
        if (row) {
            row.classList.add('removing');
            setTimeout(() => {
                cart.splice(index, 1);
                saveCart();
                displayCart();
                showNotification('Đã xóa sản phẩm khỏi giỏ hàng!', 'success');
            }, 300);
        } else {
            cart.splice(index, 1);
            saveCart();
            displayCart();
            showNotification('Đã xóa sản phẩm khỏi giỏ hàng!', 'success');
        }
    }
}

function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
        cart = [];
        saveCart();
        displayCart();
        showNotification('Đã xóa tất cả sản phẩm!', 'success');
    }
}

// =============================================
// CALCULATIONS
// =============================================
function calculateSubtotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function calculateShipping(subtotal) {
    // Free shipping for orders over 500,000 VND
    if (subtotal >= 500000) {
        return 0;
    }
    return 30000; // 30,000 VND shipping fee
}

function calculateDiscount(subtotal) {
    // Check if coupon is applied
    const appliedCoupon = localStorage.getItem('appliedCoupon');
    if (!appliedCoupon) return 0;
    
    const coupon = JSON.parse(appliedCoupon);
    
    if (coupon.type === 'percentage') {
        return subtotal * (coupon.value / 100);
    } else if (coupon.type === 'fixed') {
        return coupon.value;
    }
    
    return 0;
}

// =============================================
// COUPON MANAGEMENT
// =============================================
function applyCoupon() {
    const couponCode = document.getElementById('couponCode').value.trim().toUpperCase();
    
    if (!couponCode) {
        showNotification('Vui lòng nhập mã giảm giá!', 'warning');
        return;
    }
    
    // Sample coupons (in real app, this would be from API)
    const coupons = {
        'WELCOME10': { type: 'percentage', value: 10, description: 'Giảm 10%' },
        'SAVE50K': { type: 'fixed', value: 50000, description: 'Giảm 50,000đ' },
        'FREESHIP': { type: 'freeship', value: 0, description: 'Miễn phí vận chuyển' },
        'VIP20': { type: 'percentage', value: 20, description: 'Giảm 20%' }
    };
    
    if (coupons[couponCode]) {
        localStorage.setItem('appliedCoupon', JSON.stringify(coupons[couponCode]));
        displayCart();
        showNotification(`Đã áp dụng mã giảm giá: ${coupons[couponCode].description}`, 'success');
    } else {
        showNotification('Mã giảm giá không hợp lệ!', 'error');
    }
}

// =============================================
// CHECKOUT
// =============================================
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Giỏ hàng của bạn đang trống!', 'warning');
        return;
    }
    
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        if (confirm('Bạn cần đăng nhập để tiếp tục thanh toán. Chuyển đến trang đăng nhập?')) {
            window.location.href = 'login.html?redirect=cart.html';
        }
        return;
    }
    
    // In real app, this would redirect to checkout page
    showNotification('Chức năng thanh toán đang được phát triển...', 'info');
    
    // For demo, show order summary
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping(subtotal);
    const discount = calculateDiscount(subtotal);
    const total = subtotal + shipping - discount;
    
    const orderSummary = `
        Tổng đơn hàng:
        - Tạm tính: ${formatPrice(subtotal)}
        - Phí vận chuyển: ${shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
        - Giảm giá: ${formatPrice(discount)}
        - Tổng cộng: ${formatPrice(total)}
        
        Số lượng sản phẩm: ${cart.length}
    `;
    
    alert(orderSummary);
}

// =============================================
// RELATED PRODUCTS
// =============================================
async function loadRelatedProducts() {
    if (cart.length === 0) {
        document.getElementById('relatedProductsSection').style.display = 'none';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const products = await response.json();
        
        // Get random products (not in cart)
        const cartProductIds = cart.map(item => item.id);
        const availableProducts = products.filter(p => !cartProductIds.includes(p.product_id));
        
        // Shuffle and get 4 random products
        const shuffled = availableProducts.sort(() => 0.5 - Math.random());
        const relatedProducts = shuffled.slice(0, 4);
        
        displayRelatedProducts(relatedProducts);
        
        document.getElementById('relatedProductsSection').style.display = 'block';
    } catch (error) {
        console.error('Error loading related products:', error);
        document.getElementById('relatedProductsSection').style.display = 'none';
    }
}

function displayRelatedProducts(products) {
    const container = document.getElementById('relatedProducts');
    
    let html = '';
    
    products.forEach(product => {
        html += `
            <div class="col-lg-3 col-md-6 mb-4">
                <div class="product-card">
                    <div class="product-image">
                        <a href="product-detail.html?id=${product.product_id}">
                            <img src="${product.image}" alt="${product.product_name}" 
                                 onerror="this.src='images/products/default.jpg'">
                        </a>
                    </div>
                    <div class="product-info">
                        <h6 class="product-title">
                            <a href="product-detail.html?id=${product.product_id}">
                                ${product.product_name}
                            </a>
                        </h6>
                        <div class="product-price">${formatPrice(product.price)}</div>
                        <button class="btn btn-primary btn-sm w-100 mt-2" 
                                onclick="addToCartFromRelated(${product.product_id}, '${product.product_name}', ${product.price}, '${product.image}')">
                            <i class="fas fa-cart-plus me-1"></i>Thêm vào giỏ
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function addToCartFromRelated(id, name, price, image) {
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity++;
        showNotification('Đã tăng số lượng sản phẩm trong giỏ hàng!', 'success');
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
        showNotification('Đã thêm sản phẩm vào giỏ hàng!', 'success');
    }
    
    saveCart();
    displayCart();
    loadRelatedProducts(); // Reload to update available products
}

// =============================================
// UTILITY FUNCTIONS
// =============================================
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// =============================================
// EXPORT FUNCTIONS (for use in other pages)
// =============================================
window.cartFunctions = {
    loadCart,
    saveCart,
    addToCart: function(id, name, price, image, quantity = 1) {
        loadCart();
        
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ id, name, price, image, quantity });
        }
        
        saveCart();
        return true;
    },
    getCartCount: function() {
        loadCart();
        return cart.reduce((total, item) => total + item.quantity, 0);
    },
    getCart: function() {
        loadCart();
        return cart;
    }
};
