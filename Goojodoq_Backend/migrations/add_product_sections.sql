-- Migration: Add product sections management
-- Tạo bảng quản lý sản phẩm theo từng mục hiển thị

-- Bảng lưu các section (mục hiển thị)
CREATE TABLE IF NOT EXISTS product_sections (
    id_section INT PRIMARY KEY AUTO_INCREMENT,
    ma_section VARCHAR(50) UNIQUE NOT NULL COMMENT 'sale, featured, all',
    ten_section VARCHAR(100) NOT NULL,
    mo_ta TEXT,
    thu_tu INT DEFAULT 0,
    hien_thi BOOLEAN DEFAULT TRUE,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng liên kết sản phẩm với section
CREATE TABLE IF NOT EXISTS product_section_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_section INT NOT NULL,
    id_sanpham BIGINT UNSIGNED NOT NULL,
    thu_tu INT DEFAULT 0 COMMENT 'Thứ tự hiển thị trong section',
    hien_thi BOOLEAN DEFAULT TRUE COMMENT 'Ẩn/hiện trong section này',
    ten_sanpham_custom VARCHAR(255) COMMENT 'Tên tùy chỉnh cho section này',
    gia_custom DECIMAL(15,2) COMMENT 'Giá tùy chỉnh cho section này',
    gia_goc_custom DECIMAL(15,2) COMMENT 'Giá gốc tùy chỉnh cho section này',
    mota_ngan_custom TEXT COMMENT 'Mô tả ngắn tùy chỉnh',
    ngay_them TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_capnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_section) REFERENCES product_sections(id_section) ON DELETE CASCADE,
    FOREIGN KEY (id_sanpham) REFERENCES sanpham(id_sanpham) ON DELETE CASCADE,
    UNIQUE KEY unique_section_product (id_section, id_sanpham)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default sections
INSERT INTO product_sections (ma_section, ten_section, mo_ta, thu_tu) VALUES
('sale', 'Sản phẩm đang giảm giá', 'Ưu đãi đặc biệt - Số lượng có hạn', 1),
('featured', 'Sản phẩm nổi bật', 'Những sản phẩm được yêu thích nhất', 2),
('all', 'Tất cả sản phẩm', 'Toàn bộ sản phẩm trong cửa hàng', 3);

-- Index for better performance
CREATE INDEX idx_section_order ON product_section_items(id_section, thu_tu, hien_thi);
CREATE INDEX idx_product_section ON product_section_items(id_sanpham, id_section);
