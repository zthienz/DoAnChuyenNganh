// =============================================
// SEARCH SUGGESTIONS FUNCTIONALITY
// =============================================

// Search Suggestions
let searchTimeout;
let allProductsCache = []; // Cache for products

// Initialize search suggestions
function initializeSearchSuggestions() {
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (!searchInput || !searchSuggestions) return;
    
    // Load all products for suggestions
    loadProductsForSuggestions();
    
    // Add event listeners
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('focus', handleSearchFocus);
    searchInput.addEventListener('blur', handleSearchBlur);
    
    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            hideSuggestions();
        }
    });
    
    // Handle Enter key
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchProducts();
        }
    });
}

// Load products for suggestions
async function loadProductsForSuggestions() {
    try {
        const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api';
        const response = await fetch(`${API_BASE_URL}/products`);
        if (response.ok) {
            allProductsCache = await response.json();
        }
    } catch (error) {
        console.error('Error loading products for suggestions:', error);
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
function handleSearchBlur() {
    setTimeout(() => {
        hideSuggestions();
    }, 200);
}

// Show search suggestions
function showSuggestions(query) {
    const searchSuggestions = document.getElementById('searchSuggestions');
    if (!searchSuggestions) return;
    
    // Filter products based on query
    const filteredProducts = allProductsCache.filter(product => 
        product.product_name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5); // Limit to 5 suggestions
    
    if (filteredProducts.length > 0) {
        const suggestionsHTML = filteredProducts.map(product => {
            const imagePath = product.image_url || product.image;
            const imageTag = createImageTag(imagePath, escapeHtml(product.product_name), 'suggestion-image');
            
            return `
                <div class="suggestion-item" onclick="selectSuggestion('${escapeHtml(product.product_name)}', ${product.product_id})">
                    ${imageTag}
                    <div class="suggestion-content">
                        <div class="suggestion-name">${escapeHtml(product.product_name)}</div>
                        <div class="suggestion-price">${formatPrice(product.price)}đ</div>
                    </div>
                </div>
            `;
        }).join('');
        
        searchSuggestions.innerHTML = suggestionsHTML;
        searchSuggestions.style.display = 'block';
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
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = productName;
    }
    hideSuggestions();
    
    // Navigate to product detail
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

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure other scripts are loaded
    setTimeout(initializeSearchSuggestions, 100);
});