-- Migration: Create support_requests table
-- Created: 2025-11-30

CREATE TABLE IF NOT EXISTS yeucau_hotro (
    id_yeucau BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_nguoidung BIGINT UNSIGNED NULL,
    hoten VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    sodienthoai VARCHAR(20) NOT NULL,
    loai_lienhe ENUM('individual', 'business', 'creator') DEFAULT 'individual',
    chude VARCHAR(100) NOT NULL,
    noidung TEXT NOT NULL,
    trangthai ENUM('pending', 'processing', 'resolved', 'closed') DEFAULT 'pending',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_capnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_nguoidung) REFERENCES nguoidung(id_nguoidung) ON DELETE SET NULL,
    INDEX idx_nguoidung (id_nguoidung),
    INDEX idx_trangthai (trangthai),
    INDEX idx_ngay_tao (ngay_tao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comment to table
ALTER TABLE yeucau_hotro COMMENT = 'Bảng lưu trữ yêu cầu hỗ trợ từ khách hàng';
