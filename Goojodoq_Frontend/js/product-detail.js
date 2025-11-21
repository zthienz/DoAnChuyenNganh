// =============================================
// PRODUCT DETAIL PAGE JAVASCRIPT
// ============================================= */

// Global Variables
let currentProduct = null;
let selectedRating = 5;

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    initializeProductDetail();
});

function initializeProductDetail() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        loadProductDetail(productId);
    } else {
        showError('Không tìm thấy sản phẩm');
    }
    
    setupRatingInput();
}

// =============================================
// LOAD PRODUCT DETAIL
// =============================================
async function loadProductDetail(productId) {
    try {
        // Simulate loading product (replace with actual API call later)
        currentProduct = {
            product_id: productId,
            product_name: 'GOOJODOQ Loa Bluetooth Outdoor',
            price: 899000,
            sale_price: 799000,
            stock_quantity: 20,
            sku: 'LOA-OUT-001',
            category_name: 'Loa Bluetooth',
            short_description: 'Loa Bluetooth chống nước, âm bass mạnh mẽ, thời lượng pin lên đến 12 giờ',
            description: `
                <h4>Đặc điểm nổi bật</h4>
                <ul>
                    <li>Âm thanh stereo chất lượng cao</li>
                    <li>Chống nước chuẩn IPX7</li>
                    <li>Pin 5000mAh, sử dụng liên tục 12 giờ</li>
                    <li>Kết nối Bluetooth 5.0 ổn định</li>
                    <li>Thiết kế nhỏ gọn, dễ mang theo</li>
                </ul>
                
                <h4>Thông tin chi tiết</h4>
                <p>GOOJODOQ Loa Bluetooth Outdoor là sản phẩm loa di động cao cấp với chất lượng âm thanh vượt trội. 
                Được trang bị công nghệ Bluetooth 5.0 mới nhất, loa đảm bảo kết nối ổn định trong phạm vi 10m.</p>
                
                <p>Với khả năng chống nước chuẩn IPX7, bạn có thể yên tâm sử dụng loa ở bất kỳ đâu, 
                kể cả trong điều kiện thời tiết khắc nghiệt. Pin dung lượng 5000mAh cho phép sử dụng liên tục 
                lên đến 12 giờ với một lần sạc.</p>
            `,
            specifications: {
                'Thương hiệu': 'GOOJODOQ',
                'Model': 'BT-OUT-2023',
                'Công suất': '20W',
                'Kết nối': 'Bluetooth 5.0',
                'Pin': '5000mAh',
                'Thời gian sử dụng': '12 giờ',
                'Chống nước': 'IPX7',
                'Trọng lượng': '450g',
                'Kích thước': '180 x 70 x 70mm',
                'Xuất xứ': 'Trung Quốc',
                'Bảo hành': '12 tháng'
            },
            images: [
                'images/products/loa-outdoor.jpg',
                'images/products/loa-outdoor-2.jpg',
                'images/products/loa-outdoor-3.jpg',
                'images/products/loa-outdoor-4.jpg'
            ],
            is_new: true,
            review_count: 0
        };
        
        displayProductDetail();
        loadRelatedProducts();
        
    } catch (error) {
        console.error('Error loading product:', error);
        showError('Không thể tải thông tin sản phẩm');
    }
}

// =============================================
// DISPLAY PRODUCT DETAIL
// =============================================
function displayProductDetail() {
    if (!currentProduct) return;
    
    // Update page title
    document.title = `${currentProduct.product_name} - GOOJODOQ`;
    
    // Breadcrumb
    document.getElementById('productBreadcrumb').textContent = currentProduct.product_name;
    
    // Product name
    document.getElementById('productName').textContent = currentProduct.product_name;
    
    // Images
    const mainImage = document.getElementById('mainImage');
    mainImage.src = currentProduct.images[0] || 'images/products/default.jpg';
    mainImage.onerror = function() { this.src = 'images/products/default.jpg'; };
    
    // Thumbnails
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, index) => {
        if (currentProduct.images[index]) {
            thumb.src = currentProduct.images[index];
            thumb.onerror = function() { this.src = 'images/products/default.jpg'; };
        }
    });
    
    // Badges
    if (currentProduct.sale_price) {
        document.getElementById('saleBadge').style.display = 'block';
    }
    if (currentProduct.is_new) {
        document.getElementById('newBadge').style.display = 'block';
    }
    
    // Price
    const currentPrice = currentProduct.sale_price || currentProduct.price;
    document.getElementById('currentPrice').textContent = formatPrice(currentPrice);
    
    if (currentProduct.sale_price) {
        document.getElementById('originalPrice').textContent = formatPrice(currentProduct.price);
        document.getElementById('originalPrice').style.display = 'inline';
        
        const discount = Math.round((1 - currentProduct.sale_price / currentProduct.price) * 100);
        document.getElementById('discountBadge').textContent = `-${discount}%`;
        document.getElementById('discountBadge').style.display = 'inline-block';
    }
    
    // Short description
    document.getElementById('shortDescription').textContent = currentProduct.short_description;
    
    // Stock status
    const stockStatus = document.getElementById('stockStatus');
    if (currentProduct.stock_quantity > 0) {
        stockStatus.innerHTML = '<i class="fas fa-check-circle me-1"></i>Còn hàng';
        stockStatus.className = 'stock-value in-stock';
    } else {
        stockStatus.innerHTML = '<i class="fas fa-times-circle me-1"></i>Hết hàng';
        stockStatus.className = 'stock-value out-of-stock';
    }
    
    // Meta
    document.getElementById('productSKU').textContent = currentProduct.sku;
    document.getElementById('productCategory').textContent = currentProduct.category_name;
    
    // Review count
    document.getElementById('reviewCount').textContent = currentProduct.review_count;
    document.getElementById('reviewCountTab').textContent = currentProduct.review_count;
    document.getElementById('totalReviews').textContent = currentProduct.review_count;
    
    // Description
    document.getElementById('productDescription').innerHTML = currentProduct.description;
    
    // Specifications
    const specsTable = document.getElementById('specificationsTable');
    specsTable.innerHTML = '';
    for (const [key, value] of Object.entries(currentProduct.specifications)) {
        specsTable.innerHTML += `
            <tr>
                <td class="spec-label">${key}</td>
                <td class="spec-value">${value}</td>
            </tr>
        `;
    }
}

// =============================================
// IMAGE FUNCTIONS
// =============================================
function changeMainImage(thumbnail) {
    const mainImage = document.getElementById('mainImage');
    mainImage.src = thumbnail.src;
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');
}

// =============================================
// QUANTITY FUNCTIONS
// =============================================
function increaseQuantity() {
    const input = document.getElementById('quantity');
    const currentValue = parseInt(input.value);
    const maxValue = parseInt(input.max);
    
    if (currentValue < maxValue) {
        input.value = currentValue + 1;
    }
}

function decreaseQuantity() {
    const input = document.getElementById('quantity');
    const currentValue = parseInt(input.value);
    const minValue = parseInt(input.min);
    
    if (currentValue > minValue) {
        input.value = currentValue - 1;
    }
}

// =============================================
// CART FUNCTIONS
// =============================================
function addToCartDetail() {
    if (!currentProduct) return;
    
    const quantity = parseInt(document.getElementById('quantity').value);
    const price = currentProduct.sale_price || currentProduct.price;
    const image = currentProduct.images[0] || 'images/products/default.jpg';
    
    // Add to cart multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
        addToCart(
            currentProduct.product_id,
            currentProduct.product_name,
            price,
            image
        );
    }
    
    // Reset quantity
    document.getElementById('quantity').value = 1;
}

function toggleWishlistDetail() {
    if (!currentProduct) return;
    
    const price = currentProduct.sale_price || currentProduct.price;
    const image = currentProduct.images[0] || 'images/products/default.jpg';
    
    toggleWishlist(
        currentProduct.product_id,
        currentProduct.product_name,
        price,
        image
    );
}

// =============================================
// RATING INPUT
// =============================================
function setupRatingInput() {
    const stars = document.querySelectorAll('.rating-input i');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.rating);
            document.getElementById('ratingValue').value = selectedRating;
            
            // Update stars
            stars.forEach(s => {
                const rating = parseInt(s.dataset.rating);
                if (rating <= selectedRating) {
                    s.className = 'fas fa-star';
                } else {
                    s.className = 'far fa-star';
                }
            });
        });
        
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            stars.forEach(s => {
                const r = parseInt(s.dataset.rating);
                if (r <= rating) {
                    s.className = 'fas fa-star';
                } else {
                    s.className = 'far fa-star';
                }
            });
        });
    });
    
    // Reset on mouse leave
    document.querySelector('.rating-input').addEventListener('mouseleave', function() {
        stars.forEach(s => {
            const rating = parseInt(s.dataset.rating);
            if (rating <= selectedRating) {
                s.className = 'fas fa-star';
            } else {
                s.className = 'far fa-star';
            }
        });
    });
}

// =============================================
// REVIEW FUNCTIONS
// =============================================
function submitReview(event) {
    event.preventDefault();
    
    const rating = document.getElementById('ratingValue').value;
    const title = document.getElementById('reviewTitle').value;
    const content = document.getElementById('reviewContent').value;
    
    // Simulate review submission
    showNotification('Cảm ơn bạn đã đánh giá! Đánh giá của bạn sẽ được duyệt trong thời gian sớm nhất.', 'success');
    
    // Reset form
    document.getElementById('reviewForm').reset();
    selectedRating = 5;
}

// =============================================
// RELATED PRODUCTS
// =============================================
async function loadRelatedProducts() {
    try {
        // Simulate loading related products
        const relatedProducts = [
            {
                product_id: 2,
                product_name: 'GOOJODOQ Loa Bluetooth Mini',
                price: 399000,
                sale_price: 299000,
                image: 'images/products/loa-bluetooth-mini.jpg'
            },
            {
                product_id: 6,
                product_name: 'GOOJODOQ Tai nghe Gaming',
                price: 799000,
                sale_price: 699000,
                image: 'images/products/tai-nghe-gaming.jpg'
            },
            {
                product_id: 1,
                product_name: 'GOOJODOQ Tai nghe TWS Pro',
                price: 599000,
                sale_price: 499000,
                image: 'images/products/tai-nghe-tws-pro.jpg'
            },
            {
                product_id: 5,
                product_name: 'GOOJODOQ Quạt mini',
                price: 199000,
                sale_price: 149000,
                image: 'images/products/quat-mini.jpg'
            }
        ];
        
        displayRelatedProducts(relatedProducts);
        
    } catch (error) {
        console.error('Error loading related products:', error);
    }
}

function displayRelatedProducts(products) {
    const container = document.getElementById('relatedProducts');
    
    container.innerHTML = products.map(product => `
        <div class="col-lg-3 col-md-6 col-sm-6 mb-4">
            <div class="product-card">
                <div class="product-image">
                    <a href="product-detail.html?id=${product.product_id}">
                        <img src="${product.image}" alt="${product.product_name}" onerror="this.src='images/products/default.jpg'">
                    </a>
                    ${product.sale_price ? '<div class="product-badge sale">SALE</div>' : ''}
                </div>
                <div class="product-info">
                    <h5 class="product-title">
                        <a href="product-detail.html?id=${product.product_id}">${product.product_name}</a>
                    </h5>
                    <div class="product-price">
                        <span class="price-current">${formatPrice(product.sale_price || product.price)}</span>
                        ${product.sale_price ? `<span class="price-original">${formatPrice(product.price)}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="btn-add-cart" onclick="addToCart(${product.product_id}, '${product.product_name}', ${product.sale_price || product.price}, '${product.image}')">
                            <i class="fas fa-shopping-cart me-2"></i>Đặt hàng
                        </button>
                        <button class="btn-wishlist" onclick="toggleWishlist(${product.product_id}, '${product.product_name}', ${product.sale_price || product.price}, '${product.image}')">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// =============================================
// UTILITY FUNCTIONS
// =============================================
function showError(message) {
    document.querySelector('.product-detail-section').innerHTML = `
        <div class="container">
            <div class="alert alert-danger text-center">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
            </div>
            <div class="text-center">
                <a href="shop.html" class="btn btn-primary">
                    <i class="fas fa-arrow-left me-2"></i>Quay lại cửa hàng
                </a>
            </div>
        </div>
    `;
}