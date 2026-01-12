-- =============================================
-- BẢNG NHẬT KÝ HOẠT ĐỘNG (Activity Log)
-- =============================================
CREATE TABLE IF NOT EXISTS activity_log (
    id_activity BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    loai_hoatdong ENUM('product_stock_update', 'product_create', 'product_update', 'product_delete', 'order_create', 'order_update') NOT NULL,
    id_nguoidung BIGINT UNSIGNED,
    id_sanpham BIGINT UNSIGNED NULL,
    id_donhang BIGINT UNSIGNED NULL,
    tieu_de VARCHAR(255) NOT NULL,
    mo_ta TEXT,
    du_lieu_cu JSON NULL COMMENT 'Dữ liệu trước khi thay đổi',
    du_lieu_moi JSON NULL COMMENT 'Dữ liệu sau khi thay đổi',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_nguoidung) REFERENCES nguoidung(id_nguoidung) ON DELETE SET NULL,
    FOREIGN KEY (id_sanpham) REFERENCES sanpham(id_sanpham) ON DELETE CASCADE,
    FOREIGN KEY (id_donhang) REFERENCES donhang(id_donhang) ON DELETE CASCADE,
    INDEX idx_loai_hoatdong (loai_hoatdong),
    INDEX idx_nguoidung (id_nguoidung),
    INDEX idx_sanpham (id_sanpham),
    INDEX idx_ngay_tao (ngay_tao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;