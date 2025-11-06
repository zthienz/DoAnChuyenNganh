-- =============================================
-- GOOJODOQ E-COMMERCE DATABASE SCHEMA
-- =============================================

CREATE DATABASE IF NOT EXISTS goojodoq_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE goojodoq_db;

-- =============================================
-- BẢNG NGƯỜI DÙNG (USERS)
-- =============================================
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- BẢNG DANH MỤC SẢN PHẨM (CATEGORIES)
-- =============================================
CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(255) NOT NULL,
    category_slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- BẢNG SẢN PHẨM (PRODUCTS)
-- =============================================
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(255) NOT NULL,
    product_slug VARCHAR(255) UNIQUE NOT NULL,
    category_id INT,
    description TEXT,
    short_description TEXT,
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    stock_quantity INT DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    weight DECIMAL(8,2),
    dimensions VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    color VARCHAR(50),
    warranty_period INT DEFAULT 12, -- tháng
    origin_country VARCHAR(100),
    specifications JSON, -- Thông số kỹ thuật chi tiết
    features TEXT, -- Tính năng nổi bật
    package_contents TEXT, -- Nội dung hộp
    view_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- =============================================
-- BẢNG HÌNH ẢNH SẢN PHẨM (PRODUCT_IMAGES)
-- =============================================
CREATE TABLE product_images (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- =============================================
-- BẢNG GIỎ HÀNG (CART)
-- =============================================
CREATE TABLE cart (
    cart_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- =============================================
-- BẢNG ĐƠN HÀNG (ORDERS)
-- =============================================
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    payment_method ENUM('cod', 'bank_transfer', 'credit_card', 'e_wallet') DEFAULT 'cod',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_name VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);-- 
=============================================
-- BẢNG CHI TIẾT ĐƠN HÀNG (ORDER_ITEMS)
-- =============================================
CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- =============================================
-- BẢNG ĐÁNH GIÁ SẢN PHẨM (REVIEWS)
-- =============================================
CREATE TABLE reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    admin_reply TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_review (user_id, product_id)
);

-- =============================================
-- BẢNG WISHLIST (YÊU THÍCH)
-- =============================================
CREATE TABLE wishlist (
    wishlist_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_wishlist (user_id, product_id)
);

-- =============================================
-- BẢNG COUPON/MÃ GIẢM GIÁ (COUPONS)
-- =============================================
CREATE TABLE coupons (
    coupon_id INT PRIMARY KEY AUTO_INCREMENT,
    coupon_code VARCHAR(50) UNIQUE NOT NULL,
    coupon_name VARCHAR(255) NOT NULL,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_amount DECIMAL(10,2) DEFAULT 0,
    maximum_discount DECIMAL(10,2),
    usage_limit INT,
    used_count INT DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- BẢNG SỬ DỤNG COUPON (COUPON_USAGE)
-- =============================================
CREATE TABLE coupon_usage (
    usage_id INT PRIMARY KEY AUTO_INCREMENT,
    coupon_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- =============================================
-- BẢNG NEWSLETTER SUBSCRIPTION
-- =============================================
CREATE TABLE newsletter_subscriptions (
    subscription_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP NULL
);

-- =============================================
-- BẢNG CONTACT MESSAGES (LIÊN HỆ)
-- =============================================
CREATE TABLE contact_messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new',
    admin_reply TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- BẢNG WEBSITE SETTINGS (CÀI ĐẶT WEBSITE)
-- =============================================
CREATE TABLE website_settings (
    setting_id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('text', 'number', 'boolean', 'json') DEFAULT 'text',
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- BẢNG BLOG POSTS (BÀI VIẾT BLOG)
-- =============================================
CREATE TABLE blog_posts (
    post_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image VARCHAR(500),
    author_id INT NOT NULL,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    meta_title VARCHAR(255),
    meta_description TEXT,
    view_count INT DEFAULT 0,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(user_id) ON DELETE CASCADE
);-- ==
===========================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Products table indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_name ON products(product_name);

-- Orders table indexes
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_number ON orders(order_number);

-- Reviews table indexes
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_approved ON reviews(is_approved);

-- Cart table indexes
CREATE INDEX idx_cart_user ON cart(user_id);
CREATE INDEX idx_cart_created_at ON cart(created_at);

-- =============================================
-- INSERT SAMPLE DATA
-- =============================================

-- Insert default admin user
INSERT INTO users (email, password, full_name, role, is_active, email_verified) VALUES
('admin@goojodoq.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin', TRUE, TRUE);

-- Insert sample categories
INSERT INTO categories (category_name, category_slug, description, is_active, sort_order) VALUES
('Tai nghe Bluetooth', 'tai-nghe-bluetooth', 'Tai nghe không dây chất lượng cao', TRUE, 1),
('Loa Bluetooth', 'loa-bluetooth', 'Loa không dây di động', TRUE, 2),
('Phụ kiện điện thoại', 'phu-kien-dien-thoai', 'Các phụ kiện cho điện thoại', TRUE, 3),
('Sạc dự phòng', 'sac-du-phong', 'Pin sạc dự phòng di động', TRUE, 4),
('Cáp sạc', 'cap-sac', 'Cáp sạc các loại', TRUE, 5),
('Ốp lưng', 'op-lung', 'Ốp lưng bảo vệ điện thoại', TRUE, 6);

-- Insert website settings
INSERT INTO website_settings (setting_key, setting_value, setting_type, description) VALUES
('site_name', 'GOOJODOQ', 'text', 'Tên website'),
('site_description', 'Cửa hàng phụ kiện điện tử chính hãng', 'text', 'Mô tả website'),
('contact_email', 'contact@goojodoq.com', 'text', 'Email liên hệ'),
('contact_phone', '1900-xxxx', 'text', 'Số điện thoại liên hệ'),
('shipping_fee', '30000', 'number', 'Phí vận chuyển mặc định'),
('free_shipping_threshold', '500000', 'number', 'Miễn phí vận chuyển từ'),
('currency', 'VND', 'text', 'Đơn vị tiền tệ'),
('timezone', 'Asia/Ho_Chi_Minh', 'text', 'Múi giờ'),
('items_per_page', '12', 'number', 'Số sản phẩm mỗi trang'),
('enable_reviews', 'true', 'boolean', 'Cho phép đánh giá sản phẩm'),
('enable_wishlist', 'true', 'boolean', 'Cho phép danh sách yêu thích'),
('maintenance_mode', 'false', 'boolean', 'Chế độ bảo trì');

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- View for product with category info
CREATE VIEW product_details AS
SELECT 
    p.*,
    c.category_name,
    c.category_slug as category_slug_name,
    (SELECT image_url FROM product_images pi WHERE pi.product_id = p.product_id AND pi.is_primary = TRUE LIMIT 1) as primary_image,
    (SELECT AVG(rating) FROM reviews r WHERE r.product_id = p.product_id AND r.is_approved = TRUE) as avg_rating,
    (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.product_id AND r.is_approved = TRUE) as review_count
FROM products p
LEFT JOIN categories c ON p.category_id = c.category_id;

-- View for order summary
CREATE VIEW order_summary AS
SELECT 
    o.*,
    u.full_name as customer_name,
    u.email as customer_email,
    COUNT(oi.order_item_id) as item_count
FROM orders o
JOIN users u ON o.user_id = u.user_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY o.order_id;

-- =============================================
-- STORED PROCEDURES
-- =============================================

DELIMITER //

-- Procedure to update product stock after order
CREATE PROCEDURE UpdateProductStock(
    IN p_product_id INT,
    IN p_quantity INT,
    IN p_operation VARCHAR(10) -- 'decrease' or 'increase'
)
BEGIN
    IF p_operation = 'decrease' THEN
        UPDATE products 
        SET stock_quantity = stock_quantity - p_quantity 
        WHERE product_id = p_product_id AND stock_quantity >= p_quantity;
    ELSEIF p_operation = 'increase' THEN
        UPDATE products 
        SET stock_quantity = stock_quantity + p_quantity 
        WHERE product_id = p_product_id;
    END IF;
END //

-- Procedure to calculate order total
CREATE PROCEDURE CalculateOrderTotal(
    IN p_order_id INT,
    OUT p_total DECIMAL(10,2)
)
BEGIN
    SELECT SUM(total_price) INTO p_total
    FROM order_items
    WHERE order_id = p_order_id;
END //

DELIMITER ;

-- =============================================
-- TRIGGERS
-- =============================================

DELIMITER //

-- Trigger to update order total when order items change
CREATE TRIGGER update_order_total_after_insert
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    UPDATE orders 
    SET total_amount = (
        SELECT SUM(total_price) 
        FROM order_items 
        WHERE order_id = NEW.order_id
    )
    WHERE order_id = NEW.order_id;
END //

-- Trigger to update product rating when review is added
CREATE TRIGGER update_product_rating_after_review
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    -- This would be handled in application logic for better performance
    -- But keeping as example
    UPDATE products 
    SET updated_at = CURRENT_TIMESTAMP
    WHERE product_id = NEW.product_id;
END //

DELIMITER ;

-- =============================================
-- FINAL NOTES
-- =============================================
/*
Database Schema Features:
1. Complete user management (customers & admins)
2. Product catalog with categories and images
3. Shopping cart functionality
4. Order management system
5. Review and rating system
6. Wishlist functionality
7. Coupon/discount system
8. Newsletter subscription
9. Contact form messages
10. Blog system
11. Website settings
12. Performance optimized with indexes
13. Views for common queries
14. Stored procedures for business logic
15. Triggers for data consistency

Security Features:
- Password hashing (handled in application)
- Email verification system
- Role-based access control
- Input validation through constraints
- Foreign key relationships for data integrity

Performance Features:
- Proper indexing on frequently queried columns
- Views for complex queries
- Stored procedures for business logic
- Optimized table structure
*/