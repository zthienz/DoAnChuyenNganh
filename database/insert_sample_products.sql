-- =============================================
-- INSERT SAMPLE PRODUCTS FOR GOOJODOQ
-- =============================================

USE goojodoq_db;

-- Insert sample products
INSERT INTO products (product_name, product_slug, category_id, description, short_description, price, sale_price, stock_quantity, sku, is_featured, is_active, is_bestseller, is_new) VALUES
('GOOJODOQ Tai nghe Bluetooth TWS Pro', 'tai-nghe-bluetooth-tws-pro', 1, 'Tai nghe Bluetooth chất lượng cao với âm thanh sống động', 'Tai nghe không dây cao cấp', 599000, 499000, 50, 'TN-TWS-001', TRUE, TRUE, TRUE, TRUE),
('GOOJODOQ Loa Bluetooth Mini', 'loa-bluetooth-mini', 2, 'Loa Bluetooth nhỏ gọn, âm thanh mạnh mẽ', 'Loa di động tiện lợi', 399000, 299000, 30, 'LOA-BT-001', TRUE, TRUE, TRUE, FALSE),
('GOOJODOQ Sạc dự phòng 10000mAh', 'sac-du-phong-10000mah', 4, 'Pin sạc dự phòng dung lượng cao, sạc nhanh', 'Sạc dự phòng 10000mAh', 450000, 350000, 40, 'SDC-10K-001', TRUE, TRUE, FALSE, FALSE),
('GOOJODOQ Cáp sạc Type-C', 'cap-sac-type-c', 5, 'Cáp sạc Type-C chất lượng cao, sạc nhanh', 'Cáp sạc bền bỉ', 99000, 79000, 100, 'CAP-TC-001', TRUE, TRUE, TRUE, FALSE),
('GOOJODOQ Quạt mini cầm tay', 'quat-mini-cam-tay', 3, 'Quạt mini tiện lợi, pin sạc USB', 'Quạt cầm tay di động', 199000, 149000, 60, 'QUAT-MINI-001', TRUE, TRUE, FALSE, TRUE),
('GOOJODOQ Tai nghe có dây Gaming', 'tai-nghe-co-day-gaming', 1, 'Tai nghe gaming chuyên nghiệp với micro chống ồn', 'Tai nghe gaming cao cấp', 799000, 699000, 25, 'TN-GAME-001', TRUE, TRUE, TRUE, FALSE),
('GOOJODOQ Loa Bluetooth Outdoor', 'loa-bluetooth-outdoor', 2, 'Loa Bluetooth chống nước, âm bass mạnh', 'Loa outdoor chống nước', 899000, 799000, 20, 'LOA-OUT-001', TRUE, TRUE, FALSE, TRUE),
('GOOJODOQ Sạc dự phòng 20000mAh', 'sac-du-phong-20000mah', 4, 'Pin sạc dự phòng siêu khủng 20000mAh', 'Sạc dự phòng dung lượng lớn', 650000, 550000, 35, 'SDC-20K-001', TRUE, TRUE, TRUE, FALSE);

-- Insert product images
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(1, 'images/products/tai-nghe-tws-pro.jpg', 'Tai nghe Bluetooth TWS Pro', TRUE, 1),
(2, 'images/products/loa-bluetooth-mini.jpg', 'Loa Bluetooth Mini', TRUE, 1),
(3, 'images/products/sac-du-phong-10k.jpg', 'Sạc dự phòng 10000mAh', TRUE, 1),
(4, 'images/products/cap-sac-type-c.jpg', 'Cáp sạc Type-C', TRUE, 1),
(5, 'images/products/quat-mini.jpg', 'Quạt mini cầm tay', TRUE, 1),
(6, 'images/products/tai-nghe-gaming.jpg', 'Tai nghe Gaming', TRUE, 1),
(7, 'images/products/loa-outdoor.jpg', 'Loa Bluetooth Outdoor', TRUE, 1),
(8, 'images/products/sac-du-phong-20k.jpg', 'Sạc dự phòng 20000mAh', TRUE, 1);

-- Insert sample reviews
INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase, is_approved) VALUES
(1, 1, 5, 'Rất tuyệt vời!', 'Tai nghe chất lượng tốt, âm thanh rõ ràng', TRUE, TRUE),
(1, 1, 4, 'Tốt', 'Sản phẩm ổn, đáng giá tiền', TRUE, TRUE),
(2, 1, 5, 'Loa hay', 'Âm thanh to và rõ, pin trâu', TRUE, TRUE),
(3, 1, 4, 'Sạc nhanh', 'Sạc nhanh, dung lượng đủ dùng', TRUE, TRUE);

SELECT 'Sample products inserted successfully!' as message;