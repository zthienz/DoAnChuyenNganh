// =============================================
// IMAGE UTILITIES
// =============================================

/**
 * Xử lý đường dẫn hình ảnh để sử dụng frontend static files
 * @param {string} imagePath - Đường dẫn hình ảnh từ database hoặc API
 * @returns {string} - Đường dẫn hình ảnh đã được xử lý
 */
function processImageUrl(imagePath) {
    // Nếu không có hình ảnh, dùng ảnh mặc định
    if (!imagePath) {
        return 'images/products/default.jpg';
    }
    
    // Nếu đường dẫn bắt đầu bằng /images, chuyển thành đường dẫn frontend
    if (imagePath.startsWith('/images')) {
        return `images${imagePath.substring('/images'.length)}`;
    }
    
    // Nếu đã có backend URL, chuyển về frontend
    if (imagePath.startsWith('http://localhost:3000/images')) {
        return imagePath.replace('http://localhost:3000/images', 'images');
    }
    
    // Nếu đã là đường dẫn frontend, giữ nguyên
    if (imagePath.startsWith('images/')) {
        return imagePath;
    }
    
    // Nếu chỉ là tên file, thêm đường dẫn products
    if (!imagePath.includes('/')) {
        return `images/products/${imagePath}`;
    }
    
    // Trường hợp khác, trả về như cũ
    return imagePath;
}

/**
 * Xử lý lỗi khi load hình ảnh
 * @param {HTMLImageElement} img - Element img bị lỗi
 */
function handleImageError(img) {
    // Tránh vòng lặp vô hạn
    if (img.src.includes('default.jpg')) {
        return;
    }
    
    // Thử các đường dẫn fallback
    if (img.src.startsWith('http://localhost:3000')) {
        // Nếu backend URL failed, thử frontend relative path
        const imagePath = img.src.replace('http://localhost:3000/images/products/', '');
        img.src = `images/products/${imagePath}`;
    } else if (!img.src.includes('images/products/default.jpg')) {
        // Nếu tất cả đều fail, dùng ảnh mặc định
        img.src = 'images/products/default.jpg';
    }
}

/**
 * Tạo HTML cho hình ảnh sản phẩm với xử lý lỗi
 * @param {string} imagePath - Đường dẫn hình ảnh
 * @param {string} altText - Alt text cho hình ảnh
 * @param {string} className - CSS class cho img element
 * @returns {string} - HTML string
 */
function createProductImageHtml(imagePath, altText, className = 'product-image') {
    const processedUrl = processImageUrl(imagePath);
    return `<img src="${processedUrl}" 
                 alt="${altText}" 
                 class="${className}"
                 onerror="handleImageError(this)">`;
}

/**
 * Cập nhật tất cả hình ảnh trong một container
 * @param {string} containerId - ID của container chứa hình ảnh
 */
function updateImagesInContainer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const images = container.querySelectorAll('img[src*="localhost:3000"]');
    images.forEach(img => {
        img.src = processImageUrl(img.src);
    });
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        processImageUrl,
        handleImageError,
        createProductImageHtml,
        updateImagesInContainer
    };
}
