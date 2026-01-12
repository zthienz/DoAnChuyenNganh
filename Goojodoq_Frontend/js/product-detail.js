// =============================================
// PRODUCT DETAIL PAGE JAVASCRIPT
// =============================================

// API_BASE_URL is defined in main.js and available via window.API_BASE_URL

// Global variables
let currentProduct = null;
let currentQuantity = 1;

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    console.log('🔍 Product ID from URL:', productId);
    console.log('🔍 Full URL:', window.location.href);
    console.log('🔍 API_BASE_URL:', window.API_BASE_URL);
    
    if (productId) {
        loadProductDetail(productId);
    } else {
        showError('Không tìm thấy sản phẩm. Vui lòng quay lại trang shop.');
    }
    
    // Update user display and cart count
    if (typeof updateUserDisplay === 'function') {
        updateUserDisplay();
    }
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
    
    setupRatingInput();
});

// =============================================
// LOAD PRODUCT DETAIL
// =============================================
async function loadProductDetail(productId) {
    try {
        showLoading();
        
        const response = await fetch(`${window.API_BASE_URL}/products/${productId}`);
        if (!response.ok) {
            throw new Error('Không tìm thấy sản phẩm');
        }
        
        currentProduct = await response.json();
        console.log('✅ Loaded product:', currentProduct);
        
        displayProductDetail();
        
    } catch (error) {
        console.error('❌ Error:', error);
        showError(error.message);
    }
}


function displayProductDetail() {
    if (!currentProduct) return;
    
    // Hide loading and show content
    const container = document.querySelector('.product-detail-section .container');
    const loadingDiv = container.querySelector('.loading-indicator');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
    const existingContent = container.querySelector('.row');
    if (existingContent) {
        existingContent.style.display = '';
    }
    
    const product = currentProduct;
    
    // Update page title
    document.title = `${product.product_name} - GOOJODOQ`;
    
    // Update breadcrumb (with null check)
    const breadcrumb = document.getElementById('productBreadcrumb');
    if (breadcrumb) {
        breadcrumb.textContent = product.product_name;
    }
    
    // Update product name
    const productNameEl = document.getElementById('productName');
    if (productNameEl) {
        productNameEl.textContent = product.product_name;
    }
    
    // Update images
    if (product.images && product.images.length > 0) {
        const mainImage = document.getElementById('mainImage');
        if (mainImage) {
            mainImage.src = `http://localhost:3000${product.images[0]}`;
            mainImage.alt = product.product_name;
        }
        
        // Update thumbnails
        const thumbnailContainer = document.querySelector('.thumbnail-images .row');
        if (thumbnailContainer) {
            let thumbnailsHTML = '';
            
            product.images.forEach((img, index) => {
                const imageUrl = `http://localhost:3000${img}`;
                thumbnailsHTML += `
                    <div class="col-3">
                        <img src="${imageUrl}" 
                             alt="Thumbnail ${index + 1}" 
                             class="img-fluid thumbnail ${index === 0 ? 'active' : ''}" 
                             onclick="changeMainImage(this)">
                    </div>
                `;
            });
            
            thumbnailContainer.innerHTML = thumbnailsHTML;
        }
    }
    
    // Update rating
    const avgRating = product.avg_rating || 0;
    const reviewCount = product.review_count || 0;
    updateStars(avgRating);
    
    const reviewCountEl = document.getElementById('reviewCount');
    if (reviewCountEl) reviewCountEl.textContent = reviewCount;
    
    const reviewCountTabEl = document.getElementById('reviewCountTab');
    if (reviewCountTabEl) reviewCountTabEl.textContent = reviewCount;
    
    const totalReviewsEl = document.getElementById('totalReviews');
    if (totalReviewsEl) totalReviewsEl.textContent = reviewCount;
    
    // Update price
    const price = parseFloat(product.price);
    const currentPriceEl = document.getElementById('currentPrice');
    if (currentPriceEl) {
        currentPriceEl.textContent = formatPrice(price);
    }
    
    // Hide sale price and discount (as requested)
    const originalPriceEl = document.getElementById('originalPrice');
    if (originalPriceEl) originalPriceEl.style.display = 'none';
    
    const discountBadgeEl = document.getElementById('discountBadge');
    if (discountBadgeEl) discountBadgeEl.style.display = 'none';
    
    const saleBadgeEl = document.getElementById('saleBadge');
    if (saleBadgeEl) saleBadgeEl.style.display = 'none';
    
    // Show new badge if applicable
    if (product.is_new) {
        const newBadgeEl = document.getElementById('newBadge');
        if (newBadgeEl) newBadgeEl.style.display = 'inline-block';
    }
    
    // Update short description
    const shortDescEl = document.getElementById('shortDescription');
    if (shortDescEl) {
        shortDescEl.textContent = product.short_description || product.product_name;
    }
    
    // Update stock status
    const stockStatus = document.getElementById('stockStatus');
    if (stockStatus) {
        if (product.stock_quantity > 0) {
            stockStatus.innerHTML = `<i class="fas fa-check-circle me-1"></i>Còn hàng (${product.stock_quantity} sản phẩm)`;
            stockStatus.className = 'stock-value in-stock';
            const addToCartBtn = document.querySelector('.btn-add-to-cart');
            if (addToCartBtn) addToCartBtn.disabled = false;
        } else {
            stockStatus.innerHTML = '<i class="fas fa-times-circle me-1"></i>Hết hàng';
            stockStatus.className = 'stock-value out-of-stock';
            const addToCartBtn = document.querySelector('.btn-add-to-cart');
            if (addToCartBtn) addToCartBtn.disabled = true;
        }
    }
    
    // Update quantity max
    const quantityEl = document.getElementById('quantity');
    if (quantityEl) {
        quantityEl.max = product.stock_quantity;
    }
    
    // Update SKU
    const skuEl = document.getElementById('productSKU');
    if (skuEl) {
        skuEl.textContent = product.sku || 'N/A';
    }
    
    // Update category
    const categoryEl = document.getElementById('productCategory');
    if (categoryEl) {
        categoryEl.textContent = product.category_name || 'N/A';
    }
    
    // Update total sold
    const totalSoldEl = document.getElementById('totalSold');
    if (totalSoldEl) {
        totalSoldEl.textContent = product.total_sold || 0;
    }
    
    // Update description
    const descriptionHTML = `
        <p>${product.description || product.short_description || 'Sản phẩm chất lượng cao từ GOOJODOQ.'}</p>
        <h4>Đặc điểm nổi bật:</h4>
        <ul>
            <li>Chất lượng cao, bền bỉ</li>
            <li>Thiết kế hiện đại, sang trọng</li>
            <li>Dễ dàng sử dụng</li>
            <li>Bảo hành chính hãng 12 tháng</li>
            <li>Giao hàng toàn quốc</li>
        </ul>
    `;
    const productDescEl = document.getElementById('productDescription');
    if (productDescEl) {
        productDescEl.innerHTML = descriptionHTML;
    }
    
    // Update specifications
    const specsHTML = `
        <tr>
            <td class="spec-label">Thương hiệu</td>
            <td class="spec-value">GOOJODOQ</td>
        </tr>
        <tr>
            <td class="spec-label">Mã sản phẩm</td>
            <td class="spec-value">${product.sku || 'N/A'}</td>
        </tr>
        <tr>
            <td class="spec-label">Tình trạng</td>
            <td class="spec-value">${product.stock_quantity > 0 ? 'Còn hàng' : 'Hết hàng'}</td>
        </tr>
        <tr>
            <td class="spec-label">Xuất xứ</td>
            <td class="spec-value">Trung Quốc</td>
        </tr>
        <tr>
            <td class="spec-label">Bảo hành</td>
            <td class="spec-value">12 tháng</td>
        </tr>
        <tr>
            <td class="spec-label">Giao hàng</td>
            <td class="spec-value">Toàn quốc</td>
        </tr>
    `;
    const specsTableEl = document.getElementById('specificationsTable');
    if (specsTableEl) {
        specsTableEl.innerHTML = specsHTML;
    }
    
    // Load reviews
    loadProductReviews(product.product_id);
}

// =============================================
// LOAD AND DISPLAY REVIEWS
// =============================================
async function loadProductReviews(productId) {
    try {
        // Load reviews
        const reviewsResponse = await fetch(`${window.API_BASE_URL}/reviews/product/${productId}`);
        const reviews = await reviewsResponse.json();
        
        // Load stats
        const statsResponse = await fetch(`${window.API_BASE_URL}/reviews/product/${productId}/stats`);
        const stats = await statsResponse.json();
        
        displayReviews(reviews, stats);
        
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

function displayReviews(reviews, stats) {
    const reviewsList = document.getElementById('reviewsList');
    
    // Update stats
    if (stats) {
        const avgRating = parseFloat(stats.avg_rating) || 0;
        const totalReviews = parseInt(stats.total_reviews) || 0;
        
        // Update average rating display
        const avgRatingEl = document.querySelector('.average-rating .rating-number');
        if (avgRatingEl) avgRatingEl.textContent = avgRating.toFixed(1);
        
        const avgStarsEl = document.querySelector('.average-rating .stars');
        if (avgStarsEl) {
            avgStarsEl.innerHTML = generateStarHTML(avgRating);
        }
        
        const totalReviewsEl = document.getElementById('totalReviews');
        if (totalReviewsEl) totalReviewsEl.textContent = totalReviews;
        
        // Update review count in tab
        const reviewCountTabEl = document.getElementById('reviewCountTab');
        if (reviewCountTabEl) reviewCountTabEl.textContent = totalReviews;
        
        // Update rating bars
        updateRatingBars(stats);
    }
    
    // Display reviews
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p class="text-muted">Chưa có đánh giá nào.</p>';
        return;
    }
    
    let html = '';
    reviews.forEach(review => {
        const isAdmin = currentUser && currentUser.quyen === 'admin';
        const hasReply = review.id_traloi !== null;
        
        html += `
            <div class="review-item" data-review-id="${review.id_danhgia}">
                <div class="review-header">
                    <div class="reviewer-info">
                        <strong>${review.ten_nguoidung || 'Khách hàng'}</strong>
                        <div class="review-stars">
                            ${generateStarHTML(review.so_sao)}
                        </div>
                    </div>
                    <div class="review-date">
                        ${new Date(review.ngay_tao).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>
                <div class="review-body">
                    <p>${review.noidung || 'Không có nội dung'}</p>
                </div>
                
                ${hasReply ? `
                    <div class="review-reply">
                        <div class="review-reply-header">
                            <span class="review-reply-author">
                                <i class="fas fa-shield-alt me-1"></i>${review.admin_ten || 'Admin'}
                            </span>
                            <span class="review-reply-date">
                                ${new Date(review.traloi_ngay_tao).toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                        <div class="review-reply-content">
                            ${review.traloi_noidung}
                        </div>
                        ${isAdmin ? `
                            <div class="mt-2">
                                <button class="btn btn-sm btn-outline-primary" onclick="editReply(${review.id_danhgia}, '${escapeHtml(review.traloi_noidung)}')">
                                    <i class="fas fa-edit me-1"></i>Sửa
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteReply(${review.id_traloi})">
                                    <i class="fas fa-trash me-1"></i>Xóa
                                </button>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
                
                ${isAdmin && !hasReply ? `
                    <div class="mt-3">
                        <button class="btn btn-sm btn-outline-primary" onclick="showReplyForm(${review.id_danhgia})">
                            <i class="fas fa-reply me-1"></i>Trả lời đánh giá
                        </button>
                    </div>
                    <div id="reply-form-${review.id_danhgia}" style="display: none;" class="admin-reply-form">
                        <label class="form-label"><strong>Trả lời của bạn:</strong></label>
                        <textarea class="form-control mb-2" id="reply-content-${review.id_danhgia}" rows="3" placeholder="Nhập nội dung trả lời..."></textarea>
                        <button class="btn-reply-admin me-2" onclick="submitReply(${review.id_danhgia})">
                            <i class="fas fa-paper-plane me-1"></i>Gửi
                        </button>
                        <button class="btn-cancel-reply" onclick="hideReplyForm(${review.id_danhgia})">
                            <i class="fas fa-times me-1"></i>Hủy
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    reviewsList.innerHTML = html;
}

function generateStarHTML(rating) {
    let html = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
        html += '<i class="fas fa-star"></i> ';
    }
    if (hasHalfStar) {
        html += '<i class="fas fa-star-half-alt"></i> ';
    }
    for (let i = Math.ceil(rating); i < 5; i++) {
        html += '<i class="far fa-star"></i> ';
    }
    
    return html;
}

function updateRatingBars(stats) {
    const total = parseInt(stats.total_reviews) || 0;
    if (total === 0) return;
    
    for (let i = 5; i >= 0; i--) {
        const count = parseInt(stats[`star_${i}`]) || 0;
        const percentage = (count / total) * 100;
        
        const barItems = document.querySelectorAll('.rating-bar-item');
        if (barItems[5 - i]) {
            const progressBar = barItems[5 - i].querySelector('.progress-bar');
            const countSpan = barItems[5 - i].querySelector('.rating-count');
            
            if (progressBar) progressBar.style.width = `${percentage}%`;
            if (countSpan) countSpan.textContent = count;
        }
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

// Admin reply functions
function showReplyForm(reviewId) {
    const form = document.getElementById(`reply-form-${reviewId}`);
    if (form) {
        form.style.display = 'block';
    }
}

function hideReplyForm(reviewId) {
    const form = document.getElementById(`reply-form-${reviewId}`);
    if (form) {
        form.style.display = 'none';
        document.getElementById(`reply-content-${reviewId}`).value = '';
    }
}

async function submitReply(reviewId) {
    try {
        const content = document.getElementById(`reply-content-${reviewId}`).value.trim();
        
        if (!content) {
            showNotification('Vui lòng nhập nội dung trả lời!', 'warning');
            return;
        }
        
        if (!currentUser || currentUser.quyen !== 'admin') {
            showNotification('Bạn không có quyền trả lời đánh giá!', 'error');
            return;
        }
        
        const response = await fetch(`${window.API_BASE_URL}/reviews/${reviewId}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                adminId: currentUser.id_nguoidung,
                content: content
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Không thể gửi trả lời');
        }
        
        showNotification('Đã gửi trả lời thành công!', 'success');
        
        // Reload reviews
        if (currentProduct) {
            loadProductReviews(currentProduct.product_id);
        }
        
    } catch (error) {
        console.error('Error submitting reply:', error);
        showNotification(error.message || 'Có lỗi xảy ra!', 'error');
    }
}

function editReply(reviewId, currentContent) {
    // Show form with current content
    const form = document.getElementById(`reply-form-${reviewId}`);
    if (!form) {
        // Create form if not exists
        const reviewItem = document.querySelector(`[data-review-id="${reviewId}"]`);
        if (reviewItem) {
            const replyDiv = reviewItem.querySelector('.review-reply');
            const formHTML = `
                <div id="reply-form-${reviewId}" class="admin-reply-form mt-3">
                    <label class="form-label"><strong>Sửa trả lời:</strong></label>
                    <textarea class="form-control mb-2" id="reply-content-${reviewId}" rows="3">${currentContent}</textarea>
                    <button class="btn-reply-admin me-2" onclick="submitReply(${reviewId})">
                        <i class="fas fa-paper-plane me-1"></i>Cập nhật
                    </button>
                    <button class="btn-cancel-reply" onclick="hideReplyForm(${reviewId})">
                        <i class="fas fa-times me-1"></i>Hủy
                    </button>
                </div>
            `;
            replyDiv.insertAdjacentHTML('afterend', formHTML);
        }
    } else {
        form.style.display = 'block';
        document.getElementById(`reply-content-${reviewId}`).value = currentContent;
    }
}

async function deleteReply(replyId) {
    if (!confirm('Bạn có chắc muốn xóa trả lời này?')) {
        return;
    }
    
    try {
        if (!currentUser || currentUser.quyen !== 'admin') {
            showNotification('Bạn không có quyền xóa trả lời!', 'error');
            return;
        }
        
        const response = await fetch(`${window.API_BASE_URL}/reviews/reply/${replyId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                adminId: currentUser.id_nguoidung
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Không thể xóa trả lời');
        }
        
        showNotification('Đã xóa trả lời thành công!', 'success');
        
        // Reload reviews
        if (currentProduct) {
            loadProductReviews(currentProduct.product_id);
        }
        
    } catch (error) {
        console.error('Error deleting reply:', error);
        showNotification(error.message || 'Có lỗi xảy ra!', 'error');
    }
}

function changeMainImage(thumbnail) {
    const mainImage = document.getElementById('mainImage');
    mainImage.src = thumbnail.src;
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');
}

function updateStars(rating) {
    const starsContainer = document.querySelector('.product-rating .stars');
    
    // Check if element exists
    if (!starsContainer) {
        console.warn('⚠️ Stars container not found');
        return;
    }
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    let html = '';
    for (let i = 0; i < fullStars; i++) {
        html += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        html += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = Math.ceil(rating); i < 5; i++) {
        html += '<i class="far fa-star"></i>';
    }
    
    starsContainer.innerHTML = html;
}

function increaseQuantity() {
    const input = document.getElementById('quantity');
    const max = parseInt(input.max);
    const current = parseInt(input.value);
    
    if (current < max) {
        input.value = current + 1;
        currentQuantity = current + 1;
    } else {
        if (typeof showNotification === 'function') {
            showNotification(`Số lượng tối đa là ${max} sản phẩm`, 'warning');
        } else {
            alert(`Số lượng tối đa là ${max} sản phẩm`);
        }
    }
}

function decreaseQuantity() {
    const input = document.getElementById('quantity');
    const current = parseInt(input.value);
    
    if (current > 1) {
        input.value = current - 1;
        currentQuantity = current - 1;
    }
}

function addToCartDetail() {
    if (!currentProduct) return;
    
    // Kiểm tra nếu là admin
    if (currentUser && currentUser.quyen === 'admin') {
        if (typeof showNotification === 'function') {
            showNotification('Bạn đang là admin, không thể sử dụng chức năng giỏ hàng!', 'warning');
        } else {
            alert('Bạn đang là admin, không thể sử dụng chức năng giỏ hàng!');
        }
        return;
    }
    
    const quantityInput = document.getElementById('quantity');
    const quantity = parseInt(quantityInput.value);
    const stockQuantity = currentProduct.stock_quantity;
    
    // Kiểm tra số lượng nhập vào
    if (quantity <= 0) {
        if (typeof showNotification === 'function') {
            showNotification('Số lượng phải lớn hơn 0', 'error');
        } else {
            alert('Số lượng phải lớn hơn 0');
        }
        return;
    }
    
    // Kiểm tra số lượng tồn kho
    if (quantity > stockQuantity) {
        if (typeof showNotification === 'function') {
            showNotification(`Số lượng vượt quá tồn kho! Chỉ còn ${stockQuantity} sản phẩm`, 'error');
        } else {
            alert(`Số lượng vượt quá tồn kho! Chỉ còn ${stockQuantity} sản phẩm`);
        }
        // Reset về số lượng tối đa
        quantityInput.value = stockQuantity;
        return;
    }
    
    const imageUrl = currentProduct.images && currentProduct.images.length > 0 
        ? `http://localhost:3000${currentProduct.images[0]}` 
        : 'images/products/default.jpg';
    
    // Kiểm tra tổng số lượng trong giỏ hàng
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === currentProduct.product_id);
    
    if (existingItem) {
        const totalQuantity = existingItem.quantity + quantity;
        if (totalQuantity > stockQuantity) {
            if (typeof showNotification === 'function') {
                showNotification(`Không thể thêm! Bạn đã có ${existingItem.quantity} sản phẩm trong giỏ. Tồn kho chỉ còn ${stockQuantity}`, 'error');
            } else {
                alert(`Không thể thêm! Bạn đã có ${existingItem.quantity} sản phẩm trong giỏ. Tồn kho chỉ còn ${stockQuantity}`);
            }
            return;
        }
    }
    
    // Use addToCart from main.js if available
    if (typeof addToCart === 'function') {
        addToCart(
            currentProduct.product_id,
            currentProduct.product_name,
            parseFloat(currentProduct.price),
            imageUrl,
            quantity
        );
    } else {
        // Fallback: add to cart manually
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: currentProduct.product_id,
                name: currentProduct.product_name,
                price: parseFloat(currentProduct.price),
                image: imageUrl,
                quantity: quantity
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        if (typeof showNotification === 'function') {
            showNotification('Đã thêm sản phẩm vào giỏ hàng!', 'success');
        } else {
            alert('Đã thêm sản phẩm vào giỏ hàng!');
        }
        
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
    }
}

function toggleWishlistDetail() {
    if (!currentProduct) return;
    
    // Kiểm tra nếu là admin
    if (currentUser && currentUser.quyen === 'admin') {
        if (typeof showNotification === 'function') {
            showNotification('Bạn đang là admin, không thể sử dụng chức năng yêu thích!', 'warning');
        } else {
            alert('Bạn đang là admin, không thể sử dụng chức năng yêu thích!');
        }
        return;
    }
    
    const imageUrl = currentProduct.images && currentProduct.images.length > 0 
        ? `http://localhost:3000${currentProduct.images[0]}` 
        : 'images/products/default.jpg';
    
    if (typeof toggleWishlist === 'function') {
        toggleWishlist(
            currentProduct.product_id,
            currentProduct.product_name,
            parseFloat(currentProduct.price),
            imageUrl
        );
    }
}



function showLoading() {
    // Instead of replacing entire container, just hide content and show loading
    const container = document.querySelector('.product-detail-section .container');
    const existingContent = container.querySelector('.row');
    
    if (existingContent) {
        existingContent.style.display = 'none';
    }
    
    // Add loading indicator if not exists
    let loadingDiv = container.querySelector('.loading-indicator');
    if (!loadingDiv) {
        loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-indicator text-center py-5';
        loadingDiv.innerHTML = `
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
            <p class="mt-3">Đang tải thông tin sản phẩm...</p>
        `;
        container.insertBefore(loadingDiv, container.firstChild);
    }
    loadingDiv.style.display = 'block';
}

function showError(message) {
    const container = document.querySelector('.product-detail-section .container');
    container.innerHTML = `
        <div class="text-center py-5">
            <i class="fas fa-exclamation-triangle fa-4x text-danger mb-3"></i>
            <h4>Có lỗi xảy ra</h4>
            <p>${message}</p>
            <a href="shop.html" class="btn btn-primary">
                <i class="fas fa-arrow-left me-2"></i>Quay lại Shop
            </a>
        </div>
    `;
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}
