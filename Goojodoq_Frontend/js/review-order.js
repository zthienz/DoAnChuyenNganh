// =============================================
// REVIEW ORDER PAGE JAVASCRIPT
// =============================================

let orderId = null;
let orderData = null;
let reviews = {};

// Load order products when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const localUser = localStorage.getItem('user');
    const sessionUser = sessionStorage.getItem('user');
    
    if (localUser) {
        currentUser = JSON.parse(localUser);
    } else if (sessionUser) {
        currentUser = JSON.parse(sessionUser);
    }
    
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập để đánh giá!', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    // Get order ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    orderId = urlParams.get('orderId');
    
    if (!orderId) {
        showNotification('Không tìm thấy đơn hàng!', 'error');
        setTimeout(() => {
            window.location.href = 'orders.html';
        }, 1500);
        return;
    }

    loadOrderProducts();
});

// Load order products for review
async function loadOrderProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/reviews/order/${orderId}/products`);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Không thể tải sản phẩm');
        }

        orderData = await response.json();
        
        // Update order code
        document.getElementById('orderCode').textContent = `DH${orderId.toString().padStart(13, '0')}`;
        
        displayProducts(orderData.products);

    } catch (error) {
        console.error('Error loading order products:', error);
        document.getElementById('productsList').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${error.message}
                <br><br>
                <a href="orders.html" class="btn btn-primary">
                    <i class="fas fa-arrow-left me-2"></i>Quay lại đơn hàng
                </a>
            </div>
        `;
    }
}

// Display products
function displayProducts(products) {
    const container = document.getElementById('productsList');
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-info-circle me-2"></i>
                Không có sản phẩm nào trong đơn hàng này.
            </div>
        `;
        return;
    }

    let html = '';
    products.forEach(product => {
        let imageUrl = product.image || '/images/products/default.jpg';
        if (imageUrl.startsWith('/images')) {
            imageUrl = `http://localhost:3000${imageUrl}`;
        }

        const alreadyReviewed = product.id_danhgia !== null;
        
        html += `
            <div class="product-review-card" data-product-id="${product.id_sanpham}">
                <div class="product-review-header">
                    <img src="${imageUrl}" alt="${product.ten_sanpham}" onerror="this.src='images/products/default.jpg'">
                    <div class="product-review-info">
                        <h5 class="mb-1">${product.ten_sanpham}</h5>
                        <p class="text-muted mb-0">SKU: ${product.ma_sku}</p>
                        <p class="text-muted mb-0">Số lượng: ${product.soluong}</p>
                    </div>
                </div>
                
                ${alreadyReviewed ? `
                    <div class="already-reviewed">
                        <h6><i class="fas fa-check-circle me-2"></i>Bạn đã đánh giá sản phẩm này</h6>
                        <div class="star-rating-display mb-2">
                            ${generateStarDisplay(product.so_sao)}
                        </div>
                        <p class="mb-0"><strong>Nội dung:</strong> ${product.danhgia_noidung || 'Không có nội dung'}</p>
                    </div>
                ` : `
                    <div class="review-form">
                        <label class="form-label"><strong>Đánh giá của bạn:</strong></label>
                        <div class="star-rating" data-product-id="${product.id_sanpham}">
                            <i class="far fa-star" data-rating="1"></i>
                            <i class="far fa-star" data-rating="2"></i>
                            <i class="far fa-star" data-rating="3"></i>
                            <i class="far fa-star" data-rating="4"></i>
                            <i class="far fa-star" data-rating="5"></i>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Nội dung đánh giá:</label>
                            <textarea class="form-control review-textarea" 
                                      id="review-content-${product.id_sanpham}" 
                                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."></textarea>
                        </div>
                    </div>
                `}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Show action buttons if there are products to review
    const hasUnreviewedProducts = products.some(p => p.id_danhgia === null);
    if (hasUnreviewedProducts) {
        document.getElementById('actionButtons').style.display = 'block';
    }
    
    // Setup star rating
    setupStarRatings();
}

// Generate star display for already reviewed products
function generateStarDisplay(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            html += '<i class="fas fa-star" style="color: #ffc107;"></i> ';
        } else {
            html += '<i class="far fa-star" style="color: #ddd;"></i> ';
        }
    }
    return html;
}

// Setup star ratings
function setupStarRatings() {
    const starContainers = document.querySelectorAll('.star-rating');
    
    starContainers.forEach(container => {
        const productId = container.getAttribute('data-product-id');
        const stars = container.querySelectorAll('i');
        
        // Initialize with 5 stars
        reviews[productId] = { rating: 5, content: '' };
        stars.forEach(star => {
            star.classList.remove('far');
            star.classList.add('fas', 'active');
        });
        
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                reviews[productId].rating = rating;
                
                // Update star display
                stars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.remove('far');
                        s.classList.add('fas', 'active');
                    } else {
                        s.classList.remove('fas', 'active');
                        s.classList.add('far');
                    }
                });
            });
            
            // Hover effect
            star.addEventListener('mouseenter', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                stars.forEach((s, index) => {
                    if (index < rating) {
                        s.style.color = '#ffc107';
                    } else {
                        s.style.color = '#ddd';
                    }
                });
            });
        });
        
        container.addEventListener('mouseleave', function() {
            const currentRating = reviews[productId].rating;
            stars.forEach((s, index) => {
                if (index < currentRating) {
                    s.style.color = '#ffc107';
                } else {
                    s.style.color = '#ddd';
                }
            });
        });
    });
}

// Submit all reviews
async function submitAllReviews() {
    try {
        // Collect all reviews
        const reviewsToSubmit = [];
        
        for (const productId in reviews) {
            const contentTextarea = document.getElementById(`review-content-${productId}`);
            if (contentTextarea) {
                const content = contentTextarea.value.trim();
                reviewsToSubmit.push({
                    orderId: parseInt(orderId),
                    productId: parseInt(productId),
                    userId: currentUser.id_nguoidung,
                    rating: reviews[productId].rating,
                    content: content
                });
            }
        }
        
        if (reviewsToSubmit.length === 0) {
            showNotification('Không có đánh giá nào để gửi!', 'warning');
            return;
        }
        
        // Show loading
        const submitBtn = event.target;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang gửi...';
        
        // Submit each review
        let successCount = 0;
        for (const review of reviewsToSubmit) {
            const response = await fetch(`${API_BASE_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(review)
            });
            
            if (response.ok) {
                successCount++;
            }
        }
        
        if (successCount > 0) {
            showNotification(`Đã gửi ${successCount} đánh giá thành công!`, 'success');
            setTimeout(() => {
                window.location.href = 'orders.html';
            }, 1500);
        } else {
            throw new Error('Không thể gửi đánh giá');
        }
        
    } catch (error) {
        console.error('Error submitting reviews:', error);
        showNotification('Có lỗi xảy ra khi gửi đánh giá!', 'error');
        
        // Re-enable button
        const submitBtn = event.target;
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Gửi đánh giá';
    }
}
