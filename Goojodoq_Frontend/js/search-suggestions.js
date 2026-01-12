// =============================================
// SEARCH SUGGESTIONS FUNCTIONALITY
// =============================================

// Search Suggestions
let searchTimeout;
let allProductsCache = []; // Cache for products

// Initialize search suggestions
function initializeSearchSuggestions() {
    console.log('🚀 Initializing search suggestions...');
    
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (!searchInput) {
        console.warn('⚠️ Search input element not found');
        return;
    }
    
    if (!searchSuggestions) {
        console.warn('⚠️ Search suggestions element not found');
        return;
    }
    
    console.log('✅ Search elements found, setting up event listeners...');
    
    // Load all products for suggestions
    loadProductsForSuggestions();
    
    // Add event listeners
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('focus', handleSearchFocus);
    
    // Use mousedown instead of click to prevent blur from hiding suggestions
    searchSuggestions.addEventListener('mousedown', function(e) {
        e.preventDefault(); // Prevent blur from firing
    });
    
    searchInput.addEventListener('blur', handleSearchBlur);
    
    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
        const searchContainer = searchInput.closest('.search-box');
        if (searchContainer && !searchContainer.contains(e.target)) {
            hideSuggestions();
        }
    });
    
    // Handle Enter key
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (typeof searchProducts === 'function') {
                searchProducts();
            } else {
                console.warn('⚠️ searchProducts function not found');
            }
        }
    });
    
    console.log('✅ Search suggestions initialized successfully');
}

// Load products for suggestions
async function loadProductsForSuggestions() {
    try {
        const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api';
        console.log('🔍 Loading products for suggestions from:', `${API_BASE_URL}/products`);
        
        const response = await fetch(`${API_BASE_URL}/products`);
        if (response.ok) {
            allProductsCache = await response.json();
            console.log('✅ Loaded', allProductsCache.length, 'products for suggestions');
        } else {
            console.error('❌ Failed to load products:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('❌ Error loading products for suggestions:', error);
    }
}

// Handle search input
function handleSearchInput(e) {
    const query = e.target.value.trim();
    
    clearTimeout(searchTimeout);
    
    if (query.length >= 2) {
        searchTimeout = setTimeout(() => {
            showSuggestions(query);
        }, 300); // Debounce 300ms
    } else {
        hideSuggestions();
    }
}

// Handle search focus
function handleSearchFocus(e) {
    const query = e.target.value.trim();
    if (query.length >= 2) {
        showSuggestions(query);
    }
}

// Handle search blur (with delay to allow clicking suggestions)
function handleSearchBlur(e) {
    setTimeout(() => {
        hideSuggestions();
    }, 150); // Reduced delay since we're using mousedown prevention
}

// Show search suggestions
function showSuggestions(query) {
    const searchSuggestions = document.getElementById('searchSuggestions');
    if (!searchSuggestions) {
        console.warn('⚠️ Search suggestions element not found');
        return;
    }
    
    // Check if products are loaded
    if (!allProductsCache || allProductsCache.length === 0) {
        console.warn('⚠️ No products loaded for suggestions');
        searchSuggestions.innerHTML = '<div class="no-suggestions">Đang tải dữ liệu...</div>';
        searchSuggestions.style.display = 'block';
        return;
    }
    
    console.log('🔍 Searching for:', query, 'in', allProductsCache.length, 'products');
    
    // Filter products based on query
    const filteredProducts = allProductsCache.filter(product => 
        product.product_name && product.product_name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5); // Limit to 5 suggestions
    
    console.log('📋 Found', filteredProducts.length, 'matching products');
    
    if (filteredProducts.length > 0) {
        const suggestionsHTML = filteredProducts.map(product => {
            const imagePath = product.image_url || product.image;
            
            // Sử dụng hàm xử lý hình ảnh
            const imageUrl = getProductImageUrl(imagePath);
            
            return `
                <div class="suggestion-item" data-product-id="${product.product_id}" data-product-name="${escapeHtml(product.product_name)}">
                    <img src="${imageUrl}" alt="${escapeHtml(product.product_name)}" class="suggestion-image" onerror="this.src='images/products/default.jpg'">
                    <div class="suggestion-content">
                        <div class="suggestion-name">${escapeHtml(product.product_name)}</div>
                        <div class="suggestion-price">${formatPrice(product.price)}đ</div>
                    </div>
                </div>
            `;
        }).join('');
        
        searchSuggestions.innerHTML = suggestionsHTML;
        searchSuggestions.style.display = 'block';
        
        // Add click event listeners to suggestion items
        const suggestionItems = searchSuggestions.querySelectorAll('.suggestion-item');
        suggestionItems.forEach(item => {
            item.addEventListener('mouseup', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const productId = this.getAttribute('data-product-id');
                const productName = this.getAttribute('data-product-name');
                
                console.log('🔗 Suggestion clicked:', productName, 'ID:', productId);
                selectSuggestion(productName, productId);
            });
        });
    } else {
        searchSuggestions.innerHTML = '<div class="no-suggestions">Không tìm thấy sản phẩm nào</div>';
        searchSuggestions.style.display = 'block';
    }
}

// Hide search suggestions
function hideSuggestions() {
    const searchSuggestions = document.getElementById('searchSuggestions');
    if (searchSuggestions) {
        searchSuggestions.style.display = 'none';
    }
}

// Select a suggestion
function selectSuggestion(productName, productId) {
    console.log('🔗 Selecting suggestion:', productName, 'ID:', productId);
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = productName;
    }
    hideSuggestions();
    
    // Navigate to product detail
    console.log('🔗 Navigating to product detail:', `product-detail.html?id=${productId}`);
    window.location.href = `product-detail.html?id=${productId}`;
}

// Format price helper function
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Get product image URL with proper processing
function getProductImageUrl(imagePath) {
    if (!imagePath) {
        return 'images/products/default.jpg';
    }
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // If it starts with /, it's already a relative path from root
    if (imagePath.startsWith('/')) {
        return imagePath.substring(1); // Remove leading slash for relative path
    }
    
    // If it's just a filename, add the products path
    if (!imagePath.includes('/')) {
        return `images/products/${imagePath}`;
    }
    
    // Otherwise return as is
    return imagePath;
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing search suggestions...');
    // Small delay to ensure other scripts are loaded
    setTimeout(() => {
        console.log('🚀 Starting search suggestions initialization...');
        initializeSearchSuggestions();
    }, 100);
});
