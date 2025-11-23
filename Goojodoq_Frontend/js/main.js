// =============================================
// GOOJODOQ WEBSITE JAVASCRIPT
// =============================================

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';
window.API_BASE_URL = API_BASE_URL; // Make it globally accessible

// Global Variables
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let isAdminMode = JSON.parse(localStorage.getItem('isAdminMode')) || false;

// Get current user from storage
function getCurrentUser() {
    const localUser = localStorage.getItem('user');
    const sessionUser = sessionStorage.getItem('user');
    
    if (localUser) {
        return JSON.parse(localUser);
    } else if (sessionUser) {
        return JSON.parse(sessionUser);
    }
    return null;
}

let currentUser = getCurrentUser();

// Slideshow Variables
let currentSlideIndex = 0;
let slideInterval;
let isAutoplayActive = true;
const SLIDE_DURATION = 7000; // 7 seconds

// Auto Logout Variables
let inactivityTimer = null;
const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes in milliseconds
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    updateCartCount();
    updateWishlistCount();
    updateUserDisplay();
    
    // Initialize auto logout if user is logged in
    if (currentUser) {
        initAutoLogout();
    }
    
    // Only load featured products on index page
    const productGrid = document.getElementById('productGrid');
    if (productGrid && !document.getElementById('productsGrid')) {
        loadFeaturedProducts();
    }
    
    setupEventListeners();
    initializeSlideshow();
    initializeAdminMode();
}

// =============================================
// ADMIN MODE FUNCTIONS
// =============================================
function initializeAdminMode() {
    const adminToggle = document.getElementById('adminModeToggle');
    if (!adminToggle) return;
    
    if (isAdminMode) {
        adminToggle.innerHTML = `
            <button class="btn btn-danger btn-sm" onclick="toggleAdminMode()">
                <i class="fas fa-user-shield me-1"></i>Admin Mode: ON
            </button>
        `;
    } else {
        adminToggle.innerHTML = `
            <button class="btn btn-outline-secondary btn-sm" onclick="window.location.href='admin-login.html'">
                <i class="fas fa-user-shield me-1"></i>Admin
            </button>
        `;
    }
}

function toggleAdminMode() {
    if (confirm('Bạn có muốn thoát chế độ Admin?')) {
        localStorage.setItem('isAdminMode', 'false');
        localStorage.removeItem('adminEmail');
        window.location.reload();
    }
}

// =============================================
// EVENT LISTENERS
// =============================================
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    }

    // Category cards click
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const categoryName = this.querySelector('.category-name').textContent;
            window.location.href = `shop.html?category=${encodeURIComponent(categoryName)}`;
        });
    });
}

// =============================================
// PRODUCT FUNCTIONS
// =============================================
async function loadFeaturedProducts() {
    try {
        showLoading('productGrid');
        
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        const products = await response.json();
        displayProducts(products.slice(0, 8)); // Show first 8 products
        
    } catch (error) {
        console.error('Error loading products:', error);
        showError('productGrid', 'Không thể tải sản phẩm. Vui lòng thử lại sau.');
    }
}

function displayProducts(products) {
    const productGrid = document.getElementById('productGrid');
    
    if (!products || products.length === 0) {
        productGrid.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted">Không có sản phẩm nào để hiển thị.</p>
            </div>
        `;
        return;
    }

    let productsHTML = products.map(product => {
        // Xử lý đường dẫn ảnh từ backend
        let imageUrl = product.image || '/images/products/default.jpg';
        
        // Nếu đường dẫn bắt đầu bằng /images, thêm API_BASE_URL
        if (imageUrl.startsWith('/images')) {
            imageUrl = `http://localhost:3000${imageUrl}`;
        }
        
        return `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="product-card fade-in">
                <div class="product-image">
                    <img src="${imageUrl}" 
                         alt="${product.product_name}" 
                         onerror="this.src='images/products/default.jpg'">
                    ${product.sale_price && product.price > product.sale_price ? '<div class="product-badge sale">SALE</div>' : ''}
                    ${product.is_new ? '<div class="product-badge new">MỚI</div>' : ''}
                </div>
                <div class="product-info">
                    <h5 class="product-title">
                        <a href="product-detail.html?id=${product.product_id}">${product.product_name}</a>
                    </h5>
                    <div class="product-rating">
                        <span class="stars">
                            ${'★'.repeat(Math.round(product.avg_rating || 0))}${'☆'.repeat(5 - Math.round(product.avg_rating || 0))}
                        </span>
                        <span class="rating-count">(${product.review_count || 0})</span>
                    </div>
                    <div class="product-price">
                        <span class="price-current">${formatPrice(product.price)}</span>
                        ${product.sale_price && product.sale_price < product.price ? `<span class="price-original">${formatPrice(product.sale_price)}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="btn-add-cart" onclick="addToCart(${product.product_id}, '${escapeHtml(product.product_name)}', ${product.price}, '${imageUrl}')">
                            <i class="fas fa-shopping-cart me-2"></i>Đặt hàng
                        </button>
                        <button class="btn-wishlist" onclick="toggleWishlist(${product.product_id}, '${escapeHtml(product.product_name)}', ${product.price}, '${imageUrl}')">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    // Add "Add Product" card if admin mode
    if (isAdminMode) {
        productsHTML += `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div class="product-card add-product-card" onclick="goToAddProduct()">
                    <div class="add-product-content">
                        <i class="fas fa-plus-circle"></i>
                        <h5>Thêm sản phẩm mới</h5>
                        <p>Click để thêm sản phẩm</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    productGrid.innerHTML = productsHTML;
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

// Function to go to add product page
function goToAddProduct() {
    // Save current page to localStorage
    localStorage.setItem('previousPage', window.location.pathname.split('/').pop() || 'index.html');
    window.location.href = 'add-product.html';
}

// =============================================
// CART FUNCTIONS
// =============================================
async function addToCart(productId, productName, price, image) {
    // Kiểm tra đăng nhập
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser.id_nguoidung,
                productId: productId,
                quantity: 1,
                price: price
            })
        });

        if (!response.ok) {
            throw new Error('Failed to add to cart');
        }

        const result = await response.json();
        showNotification('Đã thêm sản phẩm vào giỏ hàng!', 'success');
        
        // Update cart count
        updateCartCount();
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Không thể thêm vào giỏ hàng!', 'error');
    }
}

// removeFromCart is now handled in cart.js

async function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (!cartCount) return;
    
    // Nếu chưa đăng nhập, hiển thị 0
    if (!currentUser) {
        cartCount.textContent = '0';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/cart/count/${currentUser.id_nguoidung}`);
        if (!response.ok) {
            throw new Error('Failed to fetch cart count');
        }
        
        const data = await response.json();
        cartCount.textContent = data.count || 0;
        
    } catch (error) {
        console.error('Error updating cart count:', error);
        cartCount.textContent = '0';
    }
}

// =============================================
// WISHLIST FUNCTIONS
// =============================================
function toggleWishlist(productId, productName, price, image) {
    // Kiểm tra đăng nhập
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích!', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    const existingIndex = wishlist.findIndex(item => item.id === productId);
    
    if (existingIndex > -1) {
        wishlist.splice(existingIndex, 1);
        showNotification('Đã xóa khỏi danh sách yêu thích!', 'info');
    } else {
        wishlist.push({
            id: productId,
            name: productName,
            price: price,
            image: image
        });
        showNotification('Đã thêm vào danh sách yêu thích!', 'success');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
}

function updateWishlistCount() {
    const wishlistCount = document.getElementById('wishlistCount');
    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
    }
}

// =============================================
// SEARCH FUNCTIONS
// =============================================
function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (query) {
        window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
    }
}

// =============================================
// NEWSLETTER FUNCTIONS
// =============================================
function subscribeNewsletter(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    
    // Simulate API call
    setTimeout(() => {
        showNotification('Cảm ơn bạn đã đăng ký nhận tin!', 'success');
        form.reset();
    }, 1000);
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

function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="col-12">
                <div class="loading">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Đang tải...</span>
                    </div>
                </div>
            </div>
        `;
    }
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    ${message}
                </div>
            </div>
        `;
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// =============================================
// SMOOTH SCROLLING
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// =============================================
// BACK TO TOP BUTTON
// =============================================
window.addEventListener('scroll', function() {
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        if (window.pageYOffset > 300) {
            backToTop.style.display = 'block';
        } else {
            backToTop.style.display = 'none';
        }
    }
});

// =============================================
// LAZY LOADING IMAGES
// =============================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}
// =============================================
// SLIDESHOW FUNCTIONS
// =============================================
function initializeSlideshow() {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    
    if (slides.length === 0) return;
    
    // Start autoplay
    startAutoplay();
    
    // Handle video slides
    slides.forEach((slide, index) => {
        const video = slide.querySelector('video');
        if (video) {
            video.addEventListener('loadeddata', () => {
                if (index === currentSlideIndex) {
                    video.play().catch(e => console.log('Video autoplay prevented:', e));
                }
            });
            
            video.addEventListener('ended', () => {
                // Video ended, move to next slide
                changeSlide(1);
            });
        }
    });
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    
    if (slides.length === 0) return;
    
    // Stop current video if playing
    const currentSlide = slides[currentSlideIndex];
    const currentVideo = currentSlide.querySelector('video');
    if (currentVideo) {
        currentVideo.pause();
        currentVideo.currentTime = 0;
    }
    
    // Remove active class from current slide and indicator
    slides[currentSlideIndex].classList.remove('active');
    if (indicators[currentSlideIndex]) {
        indicators[currentSlideIndex].classList.remove('active');
    }
    
    // Calculate new slide index
    currentSlideIndex += direction;
    
    if (currentSlideIndex >= slides.length) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = slides.length - 1;
    }
    
    // Add active class to new slide and indicator
    slides[currentSlideIndex].classList.add('active');
    if (indicators[currentSlideIndex]) {
        indicators[currentSlideIndex].classList.add('active');
    }
    
    // Handle video in new slide
    const newSlide = slides[currentSlideIndex];
    const newVideo = newSlide.querySelector('video');
    if (newVideo) {
        // Stop autoplay when video is playing
        stopAutoplay();
        newVideo.play().catch(e => console.log('Video play prevented:', e));
        
        // Resume autoplay when video ends
        newVideo.addEventListener('ended', () => {
            if (isAutoplayActive) {
                startAutoplay();
            }
        }, { once: true });
    } else {
        // Resume autoplay for image slides
        if (isAutoplayActive) {
            resetAutoplay();
        }
    }
}

function currentSlide(slideNumber) {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    
    if (slides.length === 0) return;
    
    // Stop current video if playing
    const currentSlideElement = slides[currentSlideIndex];
    const currentVideo = currentSlideElement.querySelector('video');
    if (currentVideo) {
        currentVideo.pause();
        currentVideo.currentTime = 0;
    }
    
    // Remove active class from all slides and indicators
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Set new slide index
    currentSlideIndex = slideNumber - 1;
    
    // Add active class to selected slide and indicator
    slides[currentSlideIndex].classList.add('active');
    if (indicators[currentSlideIndex]) {
        indicators[currentSlideIndex].classList.add('active');
    }
    
    // Handle video in selected slide
    const selectedSlide = slides[currentSlideIndex];
    const selectedVideo = selectedSlide.querySelector('video');
    if (selectedVideo) {
        stopAutoplay();
        selectedVideo.play().catch(e => console.log('Video play prevented:', e));
        
        selectedVideo.addEventListener('ended', () => {
            if (isAutoplayActive) {
                startAutoplay();
            }
        }, { once: true });
    } else {
        if (isAutoplayActive) {
            resetAutoplay();
        }
    }
}

function startAutoplay() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
    
    slideInterval = setInterval(() => {
        const currentSlide = document.querySelectorAll('.slide')[currentSlideIndex];
        const currentVideo = currentSlide.querySelector('video');
        
        // Don't auto-advance if video is playing
        if (!currentVideo || currentVideo.paused || currentVideo.ended) {
            changeSlide(1);
        }
    }, SLIDE_DURATION);
}

function stopAutoplay() {
    if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
    }
}

function resetAutoplay() {
    stopAutoplay();
    if (isAutoplayActive) {
        startAutoplay();
    }
}

function toggleAutoplay() {
    const playPauseIcon = document.getElementById('playPauseIcon');
    
    if (isAutoplayActive) {
        // Pause autoplay
        stopAutoplay();
        isAutoplayActive = false;
        if (playPauseIcon) {
            playPauseIcon.className = 'fas fa-play';
        }
        
        // Also pause current video if playing
        const currentSlide = document.querySelectorAll('.slide')[currentSlideIndex];
        const currentVideo = currentSlide.querySelector('video');
        if (currentVideo && !currentVideo.paused) {
            currentVideo.pause();
        }
    } else {
        // Resume autoplay
        isAutoplayActive = true;
        if (playPauseIcon) {
            playPauseIcon.className = 'fas fa-pause';
        }
        
        // Resume current video if it was paused
        const currentSlide = document.querySelectorAll('.slide')[currentSlideIndex];
        const currentVideo = currentSlide.querySelector('video');
        if (currentVideo && currentVideo.paused) {
            currentVideo.play().catch(e => console.log('Video play prevented:', e));
        } else {
            startAutoplay();
        }
    }
}

// Pause slideshow when page is not visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopAutoplay();
        
        // Pause all videos
        document.querySelectorAll('video').forEach(video => {
            if (!video.paused) {
                video.pause();
            }
        });
    } else {
        if (isAutoplayActive) {
            const currentSlide = document.querySelectorAll('.slide')[currentSlideIndex];
            const currentVideo = currentSlide.querySelector('video');
            
            if (currentVideo) {
                currentVideo.play().catch(e => console.log('Video play prevented:', e));
            } else {
                startAutoplay();
            }
        }
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        changeSlide(-1);
    } else if (e.key === 'ArrowRight') {
        changeSlide(1);
    } else if (e.key === ' ') {
        e.preventDefault();
        toggleAutoplay();
    }
});

// Touch/Swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next slide
            changeSlide(1);
        } else {
            // Swipe right - previous slide
            changeSlide(-1);
        }
    }
}

// =============================================
// USER AUTHENTICATION FUNCTIONS
// =============================================
function updateUserDisplay() {
    // Refresh current user from storage
    currentUser = getCurrentUser();
    
    console.log('🔍 updateUserDisplay called');
    console.log('👤 Current User:', currentUser);
    
    // Update auth buttons (login/register)
    const authButtons = document.getElementById('authButtons');
    
    // Update cart icon
    const cartIcon = document.getElementById('cartIcon');
    
    // Update user dropdown
    const userDropdown = document.getElementById('userAccountDropdown');
    
    if (!currentUser) {
        // ===== CHƯA ĐĂNG NHẬP =====
        console.log('❌ User not logged in');
        
        // Hiện nút đăng nhập và đăng ký
        if (authButtons) {
            authButtons.style.display = 'flex';
            authButtons.innerHTML = `
                <a href="login.html" class="btn btn-outline-primary btn-sm me-2">
                    <i class="fas fa-sign-in-alt me-1"></i>Đăng nhập
                </a>
                <a href="register.html" class="btn btn-primary btn-sm">
                    <i class="fas fa-user-plus me-1"></i>Đăng ký
                </a>
            `;
        }
        
        // Ẩn giỏ hàng
        if (cartIcon) {
            cartIcon.style.display = 'none';
        }
        
        // Ẩn dropdown tài khoản
        if (userDropdown) {
            userDropdown.style.display = 'none';
        }
        
    } else if (currentUser.quyen === 'admin') {
        // ===== ĐĂNG NHẬP ADMIN =====
        const userName = currentUser.hoten || currentUser.email.split('@')[0];
        console.log('✅ Admin logged in:', userName);
        
        // Ẩn nút đăng nhập/đăng ký
        if (authButtons) {
            authButtons.style.display = 'none';
        }
        
        // Ẩn giỏ hàng
        if (cartIcon) {
            cartIcon.style.display = 'none';
        }
        
        // Hiện dropdown admin
        if (userDropdown) {
            userDropdown.style.display = 'block';
            userDropdown.innerHTML = `
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    <i class="fas fa-user-shield"></i> ${userName}
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="profile.html"><i class="fas fa-user-circle me-2"></i>Thông tin cá nhân</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><h6 class="dropdown-header"><i class="fas fa-user-shield me-2"></i>Quản trị hệ thống</h6></li>
                    <li><a class="dropdown-item" href="admin-customers.html"><i class="fas fa-users me-2"></i>Quản lý khách hàng</a></li>
                    <li><a class="dropdown-item" href="admin-orders.html"><i class="fas fa-shopping-bag me-2"></i>Quản lý đơn hàng</a></li>
                    <li><a class="dropdown-item" href="admin-products.html"><i class="fas fa-box me-2"></i>Quản lý sản phẩm</a></li>
                    <li><a class="dropdown-item" href="admin-revenue.html"><i class="fas fa-chart-line me-2"></i>Tổng doanh thu</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" onclick="logout(); return false;"><i class="fas fa-sign-out-alt me-2"></i>Đăng xuất</a></li>
                </ul>
            `;
        }
        
    } else {
        // ===== ĐĂNG NHẬP NGƯỜI DÙNG =====
        const userName = currentUser.hoten || currentUser.email.split('@')[0];
        console.log('✅ User logged in:', userName);
        
        // Ẩn nút đăng nhập/đăng ký
        if (authButtons) {
            authButtons.style.display = 'none';
        }
        
        // Hiện giỏ hàng
        if (cartIcon) {
            cartIcon.style.display = 'block';
        }
        
        // Hiện dropdown người dùng
        if (userDropdown) {
            userDropdown.style.display = 'block';
            userDropdown.innerHTML = `
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    <i class="fas fa-user-circle"></i> ${userName}
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="profile.html"><i class="fas fa-user-circle me-2"></i>Thông tin cá nhân</a></li>
                    <li><a class="dropdown-item" href="orders.html"><i class="fas fa-shopping-bag me-2"></i>Đơn hàng của tôi</a></li>
                    <li><a class="dropdown-item" href="wishlist.html"><i class="fas fa-heart me-2"></i>Sản phẩm yêu thích</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" onclick="logout(); return false;"><i class="fas fa-sign-out-alt me-2"></i>Đăng xuất</a></li>
                </ul>
            `;
        }
    }
}

function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        // Stop auto logout timer
        stopAutoLogout();
        
        // Xóa thông tin user
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        localStorage.removeItem('isAdminMode');
        
        // Cập nhật biến global
        currentUser = null;
        isAdminMode = false;
        
        // Hiển thị thông báo
        showNotification('Đã đăng xuất thành công!', 'success');
        
        // Reload trang để cập nhật UI
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
    return false;
}

function checkAuth() {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!user) {
        showNotification('Vui lòng đăng nhập để tiếp tục!', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return false;
    }
    return true;
}

// =============================================
// AUTO LOGOUT FUNCTIONS
// =============================================
function initAutoLogout() {
    console.log('🔒 Auto logout initialized (2 minutes inactivity)');
    
    // Start the inactivity timer
    resetInactivityTimer();
    
    // Add event listeners for user activity
    ACTIVITY_EVENTS.forEach(event => {
        document.addEventListener(event, resetInactivityTimer, true);
    });
}

function resetInactivityTimer() {
    // Clear existing timer
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    
    // Only set timer if user is logged in
    if (!currentUser) {
        return;
    }
    
    // Set new timer
    inactivityTimer = setTimeout(() => {
        autoLogout();
    }, INACTIVITY_TIMEOUT);
}

function autoLogout() {
    console.log('⏰ Auto logout triggered due to inactivity');
    
    // Clear timer
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }
    
    // Remove event listeners
    ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true);
    });
    
    // Clear user data
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    localStorage.removeItem('isAdminMode');
    
    // Update global variables
    currentUser = null;
    isAdminMode = false;
    
    // Show notification
    showNotification('Phiên đăng nhập đã hết hạn do không hoạt động. Vui lòng đăng nhập lại!', 'warning');
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

function stopAutoLogout() {
    console.log('🔓 Auto logout stopped');
    
    // Clear timer
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }
    
    // Remove event listeners
    ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true);
    });
}

// =============================================
// SALE PRODUCTS CAROUSEL
// =============================================
async function loadSaleProducts() {
    try {
        console.log('🔍 Loading sale products...');
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        const products = await response.json();
        console.log('📦 Total products:', products.length);
        
        // Lọc sản phẩm đang giảm giá (có gia_goc > gia)
        const saleProducts = products.filter(product => {
            const hasDiscount = product.sale_price && product.price && product.sale_price > product.price;
            if (hasDiscount) {
                console.log('💰 Sale product found:', product.product_name, 'Original:', product.sale_price, 'Sale:', product.price);
            }
            return hasDiscount;
        });
        
        console.log('🎉 Sale products count:', saleProducts.length);
        
        if (saleProducts.length === 0) {
            console.log('⚠️ No sale products found, hiding section');
            document.getElementById('sale-products').style.display = 'none';
            return;
        }
        
        displaySaleProducts(saleProducts);
        initSaleCarousel(saleProducts.length);
        
    } catch (error) {
        console.error('❌ Error loading sale products:', error);
        document.getElementById('sale-products').style.display = 'none';
    }
}

function displaySaleProducts(products) {
    const carousel = document.getElementById('saleCarousel');
    if (!carousel) return;
    
    let productsHTML = products.map(product => {
        // Tính phần trăm giảm giá
        const discountPercent = Math.round(((product.sale_price - product.price) / product.sale_price) * 100);
        
        // Xử lý đường dẫn ảnh
        let imageUrl = product.image || '/images/products/default.jpg';
        if (imageUrl.startsWith('/images')) {
            imageUrl = `http://localhost:3000${imageUrl}`;
        }
        
        return `
            <div class="sale-product-card" onclick="window.location.href='product-detail.html?id=${product.product_id}'">
                <div class="sale-badge">-${discountPercent}%</div>
                <div class="product-image">
                    <img src="${imageUrl}" 
                         alt="${product.product_name}" 
                         onerror="this.src='images/products/default.jpg'">
                </div>
                <div class="product-info">
                    <h5 class="product-name">${product.product_name}</h5>
                    <div class="product-price">
                        <span class="original-price">${formatPrice(product.sale_price)}</span>
                        <span class="sale-price">${formatPrice(product.price)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    carousel.innerHTML = productsHTML;
}

function initSaleCarousel(productCount) {
    const carousel = document.getElementById('saleCarousel');
    if (!carousel || productCount === 0) return;
    
    // Clone all products to create seamless loop
    const originalHTML = carousel.innerHTML;
    carousel.innerHTML = originalHTML + originalHTML; // Duplicate for seamless loop
    
    const products = carousel.querySelectorAll('.sale-product-card');
    if (products.length === 0) return;
    
    // Auto scroll every 5 seconds
    let currentPosition = 0;
    const cardWidth = 300; // 280px width + 20px gap
    
    setInterval(() => {
        currentPosition -= cardWidth;
        
        // Check if we've scrolled past half (original products)
        const totalWidth = productCount * cardWidth;
        if (Math.abs(currentPosition) >= totalWidth) {
            // Reset to start without animation
            carousel.style.transition = 'none';
            currentPosition = 0;
            carousel.style.transform = `translateX(${currentPosition}px)`;
            
            // Re-enable animation after a brief moment
            setTimeout(() => {
                carousel.style.transition = 'transform 0.5s ease';
                currentPosition -= cardWidth;
                carousel.style.transform = `translateX(${currentPosition}px)`;
            }, 50);
        } else {
            carousel.style.transition = 'transform 0.5s ease';
            carousel.style.transform = `translateX(${currentPosition}px)`;
        }
    }, 5000);
}

// Initialize sale carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadSaleProducts();
});

// =============================================
// WISHLIST FUNCTIONS
// =============================================
async function toggleWishlist(productId, productName, price, image) {
    // Kiểm tra đăng nhập
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích!', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    try {
        // Kiểm tra xem đã có trong wishlist chưa
        const checkResponse = await fetch(`${API_BASE_URL}/wishlist/${currentUser.id_nguoidung}/${productId}/check`);
        const checkResult = await checkResponse.json();
        
        if (checkResult.inWishlist) {
            // Xóa khỏi wishlist
            const response = await fetch(`${API_BASE_URL}/wishlist/${currentUser.id_nguoidung}/${productId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to remove from wishlist');
            }
            
            const result = await response.json();
            showNotification('Đã xóa khỏi danh sách yêu thích!', 'info');
            
            // Update button icon if on product page
            updateWishlistButton(productId, false);
            
        } else {
            // Thêm vào wishlist
            const response = await fetch(`${API_BASE_URL}/wishlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: currentUser.id_nguoidung,
                    productId: productId
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to add to wishlist');
            }
            
            const result = await response.json();
            showNotification('Đã thêm vào danh sách yêu thích!', 'success');
            
            // Update button icon if on product page
            updateWishlistButton(productId, true);
        }
        
    } catch (error) {
        console.error('Error toggling wishlist:', error);
        showNotification('Không thể cập nhật danh sách yêu thích!', 'error');
    }
}

// Update wishlist button icon
function updateWishlistButton(productId, inWishlist) {
    const buttons = document.querySelectorAll(`[onclick*="toggleWishlist(${productId}"]`);
    buttons.forEach(button => {
        const icon = button.querySelector('i');
        if (icon) {
            if (inWishlist) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                button.style.color = '#dc3545';
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                button.style.color = '#666';
            }
        }
    });
}

// Check if product is in wishlist (for product detail page)
async function checkProductInWishlist(productId) {
    if (!currentUser) return false;
    
    try {
        const response = await fetch(`${API_BASE_URL}/wishlist/${currentUser.id_nguoidung}/${productId}/check`);
        const result = await response.json();
        return result.inWishlist;
    } catch (error) {
        console.error('Error checking wishlist:', error);
        return false;
    }
}
