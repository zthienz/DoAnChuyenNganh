-- =============================================
-- INSERT PRODUCTS WITH IMAGES FOR GOOJODOQ
-- =============================================

USE goojodoq_db;

-- Xóa dữ liệu cũ nếu có
DELETE FROM product_images;
DELETE FROM products;

-- Reset AUTO_INCREMENT
ALTER TABLE products AUTO_INCREMENT = 1;
ALTER TABLE product_images AUTO_INCREMENT = 1;

-- =============================================
-- INSERT PRODUCTS
-- =============================================

-- Product 1: Tai nghe Bluetooth TWS Pro
INSERT INTO products (product_name, product_slug, category_id, description, short_description, price, sale_price, stock_quantity, sku, brand, is_featured, is_active, is_bestseller, is_new) VALUES
('GOOJODOQ Tai nghe Bluetooth TWS Pro', 'tai-nghe-bluetooth-tws-pro', 1, 
'<h4>Đặc điểm nổi bật</h4>
<ul>
    <li>Âm thanh Hi-Fi chất lượng cao</li>
    <li>Chống ồn chủ động ANC</li>
    <li>Pin 30 giờ sử dụng</li>
    <li>Kết nối Bluetooth 5.3</li>
    <li>Chống nước IPX5</li>
</ul>', 
'Tai nghe Bluetooth không dây cao cấp với âm thanh sống động', 
599000, 499000, 50, 'TN-TWS-001', 'GOOJODOQ', TRUE, TRUE, TRUE, TRUE);

-- Product 2: Loa Bluetooth Mini
INSERT INTO products (product_name, product_slug, category_id, description, short_description, price, sale_price, stock_quantity, sku, brand, is_featured, is_active, is_bestseller, is_new) VALUES
('GOOJODOQ Loa Bluetooth Mini', 'loa-bluetooth-mini', 2,
'<h4>Đặc điểm nổi bật</h4>
<ul>
    <li>Âm thanh stereo mạnh mẽ</li>
    <li>Pin 10 giờ sử dụng</li>
    <li>Thiết kế nhỏ gọn</li>
    <li>Kết nối Bluetooth 5.0</li>
</ul>',
'Loa Bluetooth nhỏ gọn, âm thanh mạnh mẽ',
399000, 299000, 30, 'LOA-BT-001', 'GOOJODOQ', TRUE, TRUE, TRUE, FALSE);

-- Product 3: Sạc dự phòng 10000mAh
INSERT INTO products (product_name, product_slug, category_id, description, short_description, price, sale_price, stock_quantity, sku, brand, is_featured, is_active, is_bestseller, is_new) VALUES
('GOOJODOQ Sạc dự phòng 10000mAh', 'sac-du-phong-10000mah', 4,
'<h4>Đặc điểm nổi bật</h4>
<ul>
    <li>Dung lượng 10000mAh</li>
    <li>Sạc nhanh 20W</li>
    <li>2 cổng USB</li>
    <li>Màn hình LED hiển thị pin</li>
</ul>',
'Pin sạc dự phòng dung lượng cao, sạc nhanh',
450000, 350000, 40, 'SDC-10K-001', 'GOOJODOQ', TRUE, TRUE, FALSE, FALSE);

-- Product 4: Cáp sạc Type-C
INSERT INTO products (product_name, product_slug, category_id, description, short_description, price, sale_price, stock_quantity, sku, brand, is_featured, is_active, is_bestseller, is_new) VALUES
('GOOJODOQ Cáp sạc Type-C 1m', 'cap-sac-type-c-1m', 5,
'<h4>Đặc điểm nổi bật</h4>
<ul>
    <li>Sạc nhanh 60W</li>
    <li>Dây bọc nylon bền bỉ</li>
    <li>Chiều dài 1m</li>
    <li>Chống đứt gãy</li>
</ul>',
'Cáp sạc Type-C chất lượng cao, sạc nhanh',
99000, 79000, 100, 'CAP-TC-001', 'GOOJODOQ', TRUE, TRUE, TRUE, FALSE);

-- Product 5: Quạt mini cầm tay
INSERT INTO products (product_name, product_slug, category_id, description, short_description, price, sale_price, stock_quantity, sku, brand, is_featured, is_active, is_bestseller, is_new) VALUES
('GOOJODOQ Quạt mini cầm tay', 'quat-mini-cam-tay', 3,
'<h4>Đặc điểm nổi bật</h4>
<ul>
    <li>3 tốc độ gió</li>
    <li>Pin sạc USB</li>
    <li>Thiết kế nhỏ gọn</li>
    <li>Sử dụng 4-6 giờ</li>
</ul>',
'Quạt mini tiện lợi, pin sạc USB',
199000, 149000, 60, 'QUAT-MINI-001', 'GOOJODOQ', TRUE, TRUE, FALSE, TRUE);

-- Product 6: Tai nghe có dây Gaming
INSERT INTO products (product_name, product_slug, category_id, description, short_description, price, sale_price, stock_quantity, sku, brand, is_featured, is_active, is_bestseller, is_new) VALUES
('GOOJODOQ Tai nghe Gaming Pro', 'tai-nghe-gaming-pro', 1,
'<h4>Đặc điểm nổi bật</h4>
<ul>
    <li>Âm thanh 7.1 surround</li>
    <li>Micro chống ồn</li>
    <li>LED RGB</li>
    <li>Đệm tai êm ái</li>
</ul>',
'Tai nghe gaming chuyên nghiệp với micro chống ồn',
799000, 699000, 25, 'TN-GAME-001', 'GOOJODOQ', TRUE, TRUE, TRUE, FALSE);

-- Product 7: Loa Bluetooth Outdoor
INSERT INTO products (product_name, product_slug, category_id, description, short_description, price, sale_price, stock_quantity, sku, brand, is_featured, is_active, is_bestseller, is_new) VALUES
('GOOJODOQ Loa Bluetooth Outdoor', 'loa-bluetooth-outdoor', 2,
'<h4>Đặc điểm nổi bật</h4>
<ul>
    <li>Chống nước IPX7</li>
    <li>Pin 12 giờ</li>
    <li>Âm bass mạnh mẽ</li>
    <li>Kết nối TWS</li>
</ul>',
'Loa Bluetooth chống nước, âm bass mạnh',
899000, 799000, 20, 'LOA-OUT-001', 'GOOJODOQ', TRUE, TRUE, FALSE, TRUE);

-- Product 8: Sạc dự phòng 20000mAh
INSERT INTO products (product_name, product_slug, category_id, description, short_description, price, sale_price, stock_quantity, sku, brand, is_featured, is_active, is_bestseller, is_new) VALUES
('GOOJODOQ Sạc dự phòng 20000mAh', 'sac-du-phong-20000mah', 4,
'<h4>Đặc điểm nổi bật</h4>
<ul>
    <li>Dung lượng 20000mAh</li>
    <li>Sạc nhanh 30W</li>
    <li>3 cổng output</li>
    <li>Màn hình LCD</li>
</ul>',
'Pin sạc dự phòng siêu khủng 20000mAh',
650000, 550000, 35, 'SDC-20K-001', 'GOOJODOQ', TRUE, TRUE, TRUE, FALSE);

-- =============================================
-- INSERT PRODUCT IMAGES
-- =============================================

-- Images for Product 1 (Tai nghe TWS)
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(1, 'images/categories/tai-nghe-1.jpg', 'Tai nghe Bluetooth TWS Pro', TRUE, 1),
(1, 'images/categories/tai-nghe-2.jpg', 'Tai nghe Bluetooth TWS Pro - Góc 2', FALSE, 2),
(1, 'images/categories/tai-nghe-3.jpg', 'Tai nghe Bluetooth TWS Pro - Góc 3', FALSE, 3);

-- Images for Product 2 (Loa Mini)
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(2, 'images/categories/loa-mini.jpg', 'Loa Bluetooth Mini', TRUE, 1),
(2, 'images/categories/loa-mini-2.jpg', 'Loa Bluetooth Mini - Góc 2', FALSE, 2);

-- Images for Product 3 (Sạc dự phòng 10K)
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(3, 'images/categories/sac-du-phong.jpg', 'Sạc dự phòng 10000mAh', TRUE, 1),
(3, 'images/categories/sac-du-phong-2.jpg', 'Sạc dự phòng 10000mAh - Góc 2', FALSE, 2);

-- Images for Product 4 (Cáp sạc)
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(4, 'images/categories/cap-sac.jpg', 'Cáp sạc Type-C', TRUE, 1),
(4, 'images/categories/cap-sac-2.jpg', 'Cáp sạc Type-C - Chi tiết', FALSE, 2);

-- Images for Product 5 (Quạt mini)
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(5, 'images/categories/quat-mini.jpg', 'Quạt mini cầm tay', TRUE, 1),
(5, 'images/categories/quat-mini-2.jpg', 'Quạt mini cầm tay - Góc 2', FALSE, 2);

-- Images for Product 6 (Tai nghe Gaming)
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(6, 'images/categories/tai-nghe-gaming.jpg', 'Tai nghe Gaming Pro', TRUE, 1),
(6, 'images/categories/tai-nghe-gaming-2.jpg', 'Tai nghe Gaming Pro - Góc 2', FALSE, 2);

-- Images for Product 7 (Loa Outdoor)
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(7, 'images/categories/loa-outdoor.jpg', 'Loa Bluetooth Outdoor', TRUE, 1),
(7, 'images/categories/loa-outdoor-2.jpg', 'Loa Bluetooth Outdoor - Góc 2', FALSE, 2);

-- Images for Product 8 (Sạc 20K)
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(8, 'images/categories/sac-20k.jpg', 'Sạc dự phòng 20000mAh', TRUE, 1),
(8, 'images/categories/sac-20k-2.jpg', 'Sạc dự phòng 20000mAh - Góc 2', FALSE, 2);

-- =============================================
-- VERIFY DATA
-- =============================================

SELECT 'Products inserted successfully!' as message;
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_images FROM product_images;

-- Show products with images
SELECT 
    p.product_id,
    p.product_name,
    p.price,
    p.sale_price,
    p.stock_quantity,
    pi.image_url as primary_image
FROM products p
LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = TRUE
WHERE p.is_featured = TRUE
ORDER BY p.product_id;