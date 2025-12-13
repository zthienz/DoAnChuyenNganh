-- Tạo bảng lưu trữ thông tin giao dịch thanh toán
USE goojodoq_db;

CREATE TABLE IF NOT EXISTS payment_transactions (
    id_transaction BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_donhang BIGINT UNSIGNED NOT NULL,
    order_code BIGINT NOT NULL UNIQUE,
    amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'payos',
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    payment_url TEXT,
    response_code VARCHAR(10),
    response_desc TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_donhang) REFERENCES donhang(id_donhang) ON DELETE CASCADE,
    INDEX idx_order_code (order_code),
    INDEX idx_status (status),
    INDEX idx_donhang (id_donhang)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;