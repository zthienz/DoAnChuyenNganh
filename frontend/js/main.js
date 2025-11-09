// =============================================
// GOOJODOQ WEBSITE JAVASCRIPT
// =============================================

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Global Variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let isAdminMode = JSON.parse(localStorage.getItem('isAdminMode')) || false;

// Slideshow Variables
let currentSlideIndex = 0;
let slideInterval;
let isAutoplayActive = true;
const SLIDE_DURATION = 7000; // 7 seconds

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    updateCartCount();
    updateWishlistCount();
    loadFeaturedProducts();
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

    let productsHTML = products.map(product => `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="product-card fade-in">
                <div class="product-image">
                    <img src="${product.image || 'images/products/default.jpg'}" 
                         alt="${product.product_name}" 
                         onerror="this.src='images/products/default.jpg'">
                    ${product.sale_price ? '<div class="product-badge sale">SALE</div>' : ''}
                    ${product.is_new ? '<div class="product-badge new">MỚI</div>' : ''}
                </div>
                <div class="product-info">
                    <h5 class="product-title">
                        <a href="product-detail.html?id=${product.product_id}">${product.product_name}</a>
                    </h5>
                    <div class="product-rating">
                        <span class="stars">
                            ${'★'.repeat(5)}
                        </span>
                        <span class="rating-count">(0)</span>
                    </div>
                    <div class="product-price">
                        <span class="price-current">${formatPrice(product.sale_price || product.price)}</span>
                        ${product.sale_price ? `<span class="price-original">${formatPrice(product.price)}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="btn-add-cart" onclick="addToCart(${product.product_id}, '${product.product_name}', ${product.sale_price || product.price}, '${product.image || 'images/products/default.jpg'}')">
                            <i class="fas fa-shopping-cart me-2"></i>Đặt hàng
                        </button>
                        <button class="btn-wishlist" onclick="toggleWishlist(${product.product_id}, '${product.product_name}', ${product.sale_price || product.price}, '${product.image || 'images/products/default.jpg'}')">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
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

// Function to go to add product page
function goToAddProduct() {
    // Save current page to localStorage
    localStorage.setItem('previousPage', window.location.pathname.split('/').pop() || 'index.html');
    window.location.href = 'add-product.html';
}

// =============================================
// CART FUNCTIONS
// =============================================
function addToCart(productId, productName, price, image) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showNotification('Đã tăng số lượng sản phẩm trong giỏ hàng!', 'success');
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            image: image,
            quantity: 1
        });
        showNotification('Đã thêm sản phẩm vào giỏ hàng!', 'success');
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Đã xóa sản phẩm khỏi giỏ hàng!', 'info');
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// =============================================
// WISHLIST FUNCTIONS
// =============================================
function toggleWishlist(productId, productName, price, image) {
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