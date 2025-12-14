// =============================================
// CHECKOUT PAGE JAVASCRIPT
// =============================================

let cartData = null;
let addressData = null;
let appliedVoucher = null;
let subtotalAmount = 0;
let discountAmount = 0;
let finalTotal = 0;

// Load checkout data when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập!', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    loadCheckoutData();
});

// Load cart and address data
async function loadCheckoutData() {
    try {
        // Load selected items from sessionStorage
        const selectedItemsJson = sessionStorage.getItem('selectedCartItems');
        
        if (!selectedItemsJson) {
            showNotification('Không có sản phẩm nào được chọn!', 'warning');
            setTimeout(() => {
                window.location.href = 'cart.html';
            }, 1500);
            return;
        }

        const selectedItems = JSON.parse(selectedItemsJson);
        
        if (!selectedItems || selectedItems.length === 0) {
            showNotification('Không có sản phẩm nào được chọn!', 'warning');
            setTimeout(() => {
                window.location.href = 'cart.html';
            }, 1500);
            return;
        }

        // Create cartData object with selected items only
        cartData = {
            items: selectedItems,
            total: selectedItems.reduce((sum, item) => sum + (item.soluong * parseFloat(item.gia_donvi)), 0)
        };

        // Load address
        const addressResponse = await fetch(`${API_BASE_URL}/profile/${currentUser.id_nguoidung}`);
        if (!addressResponse.ok) throw new Error('Failed to load address');
        const profileData = await addressResponse.json();
        addressData = profileData.address;

        if (!addressData || !addressData.ten_nguoinhan) {
            showNotification('Vui lòng cập nhật địa chỉ nhận hàng!', 'warning');
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1500);
            return;
        }

        displayAddress();
        displayProducts();
        calculateTotal();

    } catch (error) {
        console.error('Error loading checkout data:', error);
        showNotification('Không thể tải thông tin. Vui lòng thử lại!', 'error');
    }
}

// Display shipping address
function displayAddress() {
    const addressHtml = `
        <div class="p-3 bg-light rounded">
            <p class="mb-2"><strong>${addressData.ten_nguoinhan}</strong></p>
            <p class="mb-2"><i class="fas fa-phone me-2"></i>${addressData.sdt}</p>
            <p class="mb-0"><i class="fas fa-map-marker-alt me-2"></i>
                ${addressData.diachi_chitiet}, ${addressData.quanhuyen}, ${addressData.thanhpho}
                ${addressData.ma_buudien ? `, ${addressData.ma_buudien}` : ''}
            </p>
            <a href="profile.html" class="btn btn-sm btn-outline-primary mt-2">
                <i class="fas fa-edit me-1"></i>Thay đổi
            </a>
        </div>
    `;
    document.getElementById('shippingAddress').innerHTML = addressHtml;
}

// Display products
function displayProducts() {
    const productsHtml = cartData.items.map(item => {
        let imageUrl = item.image || '/images/products/default.jpg';
        if (imageUrl.startsWith('/images')) {
            imageUrl = `http://localhost:3000${imageUrl}`;
        }

        const itemTotal = item.soluong * parseFloat(item.gia_donvi);

        return `
            <div class="product-item">
                <img src="${imageUrl}" 
                     alt="${item.product_name}" 
                     class="product-image"
                     onerror="this.src='images/products/default.jpg'">
                <div class="product-info">
                    <h6 class="mb-1">${item.product_name}</h6>
                    <p class="text-muted mb-1">SKU: ${item.sku}</p>
                    <p class="mb-0">
                        <span class="text-primary">${formatPrice(item.gia_donvi)}</span>
                        <span class="text-muted"> x ${item.soluong}</span>
                    </p>
                </div>
                <div class="text-end">
                    <strong class="text-danger">${formatPrice(itemTotal)}</strong>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('productsList').innerHTML = productsHtml;
}

// Calculate total
function calculateTotal() {
    subtotalAmount = cartData.total;
    const shippingFee = 0; // Free shipping
    
    // Tính giảm giá
    if (appliedVoucher) {
        if (appliedVoucher.discountType === 'theo_phantram') {
            discountAmount = subtotalAmount * appliedVoucher.discount / 100;
        } else if (appliedVoucher.discountType === 'theo_tien') {
            discountAmount = appliedVoucher.discount;
        } else {
            discountAmount = 0;
        }
    } else {
        discountAmount = 0;
    }
    
    finalTotal = subtotalAmount + shippingFee - discountAmount;

    document.getElementById('subtotal').textContent = formatPrice(subtotalAmount);
    document.getElementById('shipping').textContent = shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee);
    
    if (discountAmount > 0) {
        document.getElementById('discountRow').style.display = 'flex';
        document.getElementById('discount').textContent = '-' + formatPrice(discountAmount);
    } else {
        document.getElementById('discountRow').style.display = 'none';
    }
    
    document.getElementById('total').textContent = formatPrice(finalTotal);
}

// Apply voucher
async function applyVoucher() {
    const voucherCode = document.getElementById('voucherCode').value.trim();
    const messageDiv = document.getElementById('voucherMessage');

    if (!voucherCode) {
        messageDiv.innerHTML = '<small class="text-danger">Vui lòng nhập mã giảm giá!</small>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/vouchers/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: voucherCode, userId: currentUser.id_nguoidung })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Mã giảm giá không hợp lệ');
        }

        const voucher = await response.json();
        
        // Kiểm tra đơn hàng tối thiểu
        if (voucher.minOrder && subtotalAmount < voucher.minOrder) {
            throw new Error(`Đơn hàng tối thiểu ${formatPrice(voucher.minOrder)} để sử dụng mã này`);
        }
        
        appliedVoucher = voucher;
        
        // Tính giá trị giảm
        let discountText = '';
        let savedAmount = 0;
        
        if (voucher.discountType === 'theo_phantram') {
            savedAmount = subtotalAmount * voucher.discount / 100;
            discountText = `Giảm ${voucher.discount}%`;
        } else if (voucher.discountType === 'theo_tien') {
            savedAmount = voucher.discount;
            discountText = `Giảm ${formatPrice(voucher.discount)}`;
        }
        
        messageDiv.innerHTML = `
            <div class="discount-badge">
                <i class="fas fa-check-circle me-1"></i>
                ${discountText} - Tiết kiệm ${formatPrice(savedAmount)}
            </div>
        `;
        
        calculateTotal();
        showNotification('Áp dụng mã giảm giá thành công!', 'success');

    } catch (error) {
        console.error('Error applying voucher:', error);
        messageDiv.innerHTML = `<small class="text-danger">${error.message}</small>`;
        appliedVoucher = null;
        calculateTotal();
    }
}

// Confirm order
async function confirmOrder() {
    try {
        const paymentMethod = document.getElementById('paymentMethod').value;
        const note = document.getElementById('orderNote').value.trim();

        if (!confirm('Xác nhận đặt hàng?')) {
            return;
        }

        showNotification('Đang xử lý đơn hàng...', 'info');

        const orderData = {
            userId: currentUser.id_nguoidung,
            items: cartData.items,
            total: finalTotal,
            subtotal: subtotalAmount,
            discount: discountAmount,
            addressId: addressData.id_diachi,
            paymentMethod: paymentMethod,
            note: note,
            voucherCode: appliedVoucher ? appliedVoucher.code : null
        };

        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Không thể tạo đơn hàng');
        }

        const result = await response.json();
        
        // Clear selected items from sessionStorage
        sessionStorage.removeItem('selectedCartItems');
        
        // Nếu chọn chuyển khoản ngân hàng, chuyển hướng đến PayOS
        if (paymentMethod === 'bank') {
            showNotification('Đang tạo link thanh toán...', 'info');
            
            try {
                // Tạo link thanh toán PayOS
                console.log('🏦 Creating payment for order:', result.orderId, 'Amount:', finalTotal);
                
                const paymentResponse = await fetch(`${API_BASE_URL}/payment/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        orderId: result.orderId,
                        amount: finalTotal,
                        description: `DH${result.orderId}`,
                        returnUrl: `${window.location.origin}/payment-success.html?orderId=${result.orderId}`,
                        cancelUrl: `${window.location.origin}/payment-cancel.html?orderId=${result.orderId}`
                    })
                });

                console.log('💳 Payment response status:', paymentResponse.status);

                if (!paymentResponse.ok) {
                    const errorText = await paymentResponse.text();
                    console.error('❌ Payment response error:', errorText);
                    throw new Error(`HTTP ${paymentResponse.status}: ${errorText}`);
                }

                const paymentResult = await paymentResponse.json();
                console.log('✅ Payment result:', paymentResult);
                
                if (paymentResult.success) {
                    showNotification('Chuyển hướng đến trang thanh toán...', 'success');
                    
                    // Lưu thông tin để tracking
                    sessionStorage.setItem('paymentOrderId', result.orderId);
                    sessionStorage.setItem('paymentOrderCode', paymentResult.orderCode);
                    
                    // Chuyển hướng đến PayOS
                    setTimeout(() => {
                        window.location.href = paymentResult.paymentUrl;
                    }, 1000);
                } else {
                    throw new Error(paymentResult.error || 'Lỗi tạo link thanh toán');
                }
                
            } catch (paymentError) {
                console.error('Payment error:', paymentError);
                showNotification('Lỗi tạo link thanh toán: ' + paymentError.message, 'error');
                
                // Vẫn chuyển đến trang orders nếu lỗi thanh toán
                setTimeout(() => {
                    window.location.href = 'orders.html';
                }, 2000);
            }
        } else {
            // COD - chuyển đến trang orders như bình thường
            showNotification('Đặt hàng thành công!', 'success');
            setTimeout(() => {
                window.location.href = 'orders.html';
            }, 1500);
        }

    } catch (error) {
        console.error('Error confirming order:', error);
        showNotification(error.message || 'Không thể đặt hàng. Vui lòng thử lại!', 'error');
    }
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}
