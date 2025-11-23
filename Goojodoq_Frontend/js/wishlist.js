// =============================================
// WISHLIST PAGE JAVASCRIPT
// =============================================

let wishlistData = [];

// Load wishlist when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập để xem danh sách yêu thích!', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    loadWishlist();
});

// Load wishlist from API
async function loadWishlist() {
    try {
        console.log('❤️ Loading wishlist for user:', currentUser.id_nguoidung);

        const response = await fetch(`${API_BASE_URL}/wishlist/${currentUser.id_nguoidung}`);
        if (!response.ok) {
            throw new Error('Failed to fetch wishlist');
        }

        wishlistData = await response.json();
        console.log('📦 Wishlist data:', wishlistData);

        displayWishlist();

    } catch (error) {
        console.error('❌ Error loading wishlist:', error);
        document.getElementById('loadingWishlist').style.display = 'none';
        showNotification('Không thể tải danh sách yêu thích. Vui lòng thử lại!', 'error');
    }
}

// Display wishlist items
function displayWishlist() {
    const loadingWishlist = document.getElementById('loadingWishlist');
    const emptyWishlist = document.getElementById('emptyWishlist');
    const wishlistItems = document.getElementById('wishlistItems');

    loadingWishlist.style.display = 'none';

    if (!wishlistData || wishlistData.length === 0) {
        emptyWishlist.style.display = 'block';
        wishlistItems.style.display = 'none';
        return;
    }

    emptyWishlist.style.display = 'none';
    wishlistItems.style.display = 'block';

    // Display wishlist items
    wishlistItems.innerHTML = wishlistData.map(item => {
        let imageUrl = item.image || '/images/products/default.jpg';
        if (imageUrl.startsWith('/images')) {
            imageUrl = `http://localhost:3000${imageUrl}`;
        }

        // Calculate discount percentage if applicable
        let discountBadge = '';
        if (item.sale_price && item.sale_price > item.price) {
            const discountPercent = Math.round(((item.sale_price - item.price) / item.sale_price) * 100);
            discountBadge = `<span class="discount-badge">-${discountPercent}%</span>`;
        }

        // Check stock status
        const inStock = item.stock > 0;
        const stockText = inStock 
            ? `<span class="wishlist-item-stock"><i class="fas fa-check-circle me-1"></i>Còn hàng (${item.stock})</span>`
            : `<span class="wishlist-item-stock out-of-stock"><i class="fas fa-times-circle me-1"></i>Hết hàng</span>`;

        return `
            <div class="wishlist-item">
                <div class="d-flex align-items-center">
                    <img src="${imageUrl}" 
                         alt="${item.product_name}" 
                         class="wishlist-item-image"
                         onerror="this.src='images/products/default.jpg'">
                    
                    <div class="wishlist-item-info">
                        <h5 class="wishlist-item-title">
                            <a href="product-detail.html?id=${item.product_id}" style="text-decoration: none; color: inherit;">
                                ${item.product_name}
                            </a>
                        </h5>
                        <p class="text-muted mb-2">SKU: ${item.sku}</p>
                        <div class="wishlist-item-price">
                            ${formatPrice(item.price)}
                            ${item.sale_price && item.sale_price > item.price ? `
                                <span style="text-decoration: line-through; color: #999; font-size: 1rem; margin-left: 10px;">
                                    ${formatPrice(item.sale_price)}
                                </span>
                                ${discountBadge}
                            ` : ''}
                        </div>
                        ${stockText}
                    </div>

                    <div class="d-flex flex-column gap-2">
                        ${inStock ? `
                            <button class="btn-add-to-cart" onclick="addToCartFromWishlist(${item.product_id}, '${escapeHtml(item.product_name)}', ${item.price}, '${imageUrl}')">
                                <i class="fas fa-shopping-cart me-2"></i>Thêm vào giỏ
                            </button>
                        ` : `
                            <button class="btn-add-to-cart" disabled style="opacity: 0.5; cursor: not-allowed;">
                                <i class="fas fa-ban me-2"></i>Hết hàng
                            </button>
                        `}
                        <button class="btn-remove" onclick="removeFromWishlist(${item.product_id})">
                            <i class="fas fa-trash me-2"></i>Xóa
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Add to cart from wishlist
async function addToCartFromWishlist(productId, productName, price, image) {
    try {
        // Add to cart
        await addToCart(productId, productName, price, image);
        
        // Optionally remove from wishlist after adding to cart
        // await removeFromWishlist(productId);
        
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

// Remove item from wishlist
async function removeFromWishlist(productId) {
    try {
        if (!confirm('Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?')) {
            return;
        }

        const response = await fetch(`${API_BASE_URL}/wishlist/${currentUser.id_nguoidung}/${productId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to remove from wishlist');
        }

        const result = await response.json();
        showNotification(result.message, 'success');

        // Reload wishlist
        await loadWishlist();

    } catch (error) {
        console.error('Error removing from wishlist:', error);
        showNotification('Không thể xóa sản phẩm!', 'error');
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
