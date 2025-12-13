// =============================================
// IMAGE UTILITIES
// =============================================

/**
 * Xử lý đường dẫn hình ảnh sản phẩm
 * @param {string} imagePath - Đường dẫn hình ảnh từ database
 * @param {string} defaultImage - Hình ảnh mặc định (optional)
 * @returns {string} - Đường dẫn hình ảnh đã được xử lý
 */
function getProductImageUrl(imagePath, defaultImage = 'images/products/default.jpg') {
    // Nếu không có hình ảnh, trả về hình mặc định
    if (!imagePath) {
        return defaultImage;
    }
    
    // Nếu đã là URL đầy đủ (http/https), trả về nguyên vẹn
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // Nếu bắt đầu bằng /images/, loại bỏ dấu / đầu để thành đường dẫn tương đối
    if (imagePath.startsWith('/images/')) {
        return imagePath.substring(1); // Loại bỏ dấu / đầu
    }
    
    // Nếu đã có prefix images/, trả về nguyên vẹn
    if (imagePath.startsWith('images/')) {
        return imagePath;
    }
    
    // Nếu chỉ là tên file, thêm prefix images/products/
    return `images/products/${imagePath}`;
}

/**
 * Tạo HTML img tag với xử lý lỗi
 * @param {string} imagePath - Đường dẫn hình ảnh
 * @param {string} altText - Alt text
 * @param {string} className - CSS class (optional)
 * @param {string} defaultImage - Hình ảnh mặc định (optional)
 * @returns {string} - HTML img tag
 */
function createImageTag(imagePath, altText, className = '', defaultImage = 'images/products/default.jpg') {
    const imageUrl = getProductImageUrl(imagePath, defaultImage);
    const classAttr = className ? ` class="${className}"` : '';
    
    return `<img src="${imageUrl}" alt="${altText}"${classAttr} onerror="this.src='${defaultImage}'">`;
}

/**
 * Cập nhật src của img element với xử lý lỗi
 * @param {HTMLImageElement} imgElement - Element img
 * @param {string} imagePath - Đường dẫn hình ảnh
 * @param {string} defaultImage - Hình ảnh mặc định (optional)
 */
function setImageSrc(imgElement, imagePath, defaultImage = 'images/products/default.jpg') {
    if (!imgElement) return;
    
    const imageUrl = getProductImageUrl(imagePath, defaultImage);
    imgElement.src = imageUrl;
    
    // Thêm xử lý lỗi nếu chưa có
    if (!imgElement.onerror) {
        imgElement.onerror = function() {
            this.src = defaultImage;
        };
    }
}

// Export functions for use in other files
window.getProductImageUrl = getProductImageUrl;
window.createImageTag = createImageTag;
window.setImageSrc = setImageSrc;