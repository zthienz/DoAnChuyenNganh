-- =============================================
-- GOOJODOQ DATABASE SCHEMA
-- Hệ thống quản lý cửa hàng phụ kiện điện tử
-- =============================================

CREATE DATABASE IF NOT EXISTS goojodoq_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE goojodoq_db;

-- =============================================
-- BẢNG NGƯỜI DÙNG (Users)
-- =============================================
CREATE TABLE nguoidung (
    id_nguoidung BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    matkhau VARCHAR(255) NOT NULL,
    hoten VARCHAR(100),
    sdt VARCHAR(20),
    quyen ENUM('admin', 'nguoidung') DEFAULT 'nguoidung',
    trangthai TINYINT(1) DEFAULT 1 COMMENT '1: Hoạt động, 0: Bị khóa',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_capnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_quyen (quyen),
    INDEX idx_trangthai (trangthai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- BẢNG DANH MỤC SẢN PHẨM (Categories)
-- =============================================
CREATE TABLE danhmuc (
    id_danhmuc INT PRIMARY KEY AUTO_INCREMENT,
    ten_danhmuc VARCHAR(100) NOT NULL,
    duongdan VARCHAR(100) UNIQUE NOT NULL,
    mo_ta TEXT,
    thu_tu INT DEFAULT 0,
    hien_thi TINYINT(1) DEFAULT 1,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_duongdan (duongdan),
    INDEX idx_hien_thi (hien_thi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- BẢNG SẢN PHẨM (Products)
-- =============================================
CREATE TABLE sanpham (
    id_sanpham BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    ma_sku VARCHAR(50) UNIQUE NOT NULL,
    ten_sanpham VARCHAR(255) NOT NULL,
    duongdan VARCHAR(255) UNIQUE NOT NULL,
    mota_ngan TEXT,
    mota_chitiet LONGTEXT,
    id_danhmuc INT,
    gia DECIMAL(15,2) NOT NULL COMMENT 'Giá bán hiện tại',
    gia_goc DECIMAL(15,2) COMMENT 'Giá gốc (trước khi giảm)',
    tonkho INT DEFAULT 0,
    hien_thi TINYINT(1) DEFAULT 1,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_capnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_danhmuc) REFERENCES danhmuc(id_danhmuc) ON DELETE SET NULL,
    INDEX idx_ma_sku (ma_sku),
    INDEX idx_duongdan (duongdan),
    INDEX idx_danhmuc (id_danhmuc),
    INDEX idx_hien_thi (hien_thi),
    INDEX idx_gia (gia),
    INDEX idx_ngay_tao (ngay_tao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- BẢNG ẢNH SẢN PHẨM (Product Images)
-- =============================================
CREATE TABLE anh_sanpham (
    id_anh BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_sanpham BIGINT UNSIGNED NOT NULL,
    duongdan_anh VARCHAR(500) NOT NULL,
    mo_ta VARCHAR(255),
    thu_tu INT DEFAULT 0,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_sanpham) REFERENCES sanpham(id_sanpham) ON DELETE CASCADE,
    INDEX idx_sanpham (id_sanpham),
    INDEX idx_thu_tu (thu_tu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- BẢNG QUẢN LÝ SECTION SẢN PHẨM
-- =============================================
CREATE TABLE product_sections (
    id_section INT PRIMARY KEY AUTO_INCREMENT,
    ma_section VARCHAR(50) UNIQUE NOT NULL COMMENT 'sale, featured, all',
    ten_section VARCHAR(100) NOT NULL,
    mo_ta TEXT,
    thu_tu INT DEFAULT 0,
    hien_thi BOOLEAN DEFAULT TRUE,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_section_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_section INT NOT NULL,
    id_sanpham BIGINT UNSIGNED NOT NULL,
    thu_tu INT DEFAULT 0,
    hien_thi BOOLEAN DEFAULT TRUE,
    ten_sanpham_custom VARCHAR(255),
    gia_custom DECIMAL(15,2),
    gia_goc_custom DECIMAL(15,2),
    mota_ngan_custom TEXT,
    ngay_them TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_capnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_section) REFERENCES product_sections(id_section) ON DELETE CASCADE,
    FOREIGN KEY (id_sanpham) REFERENCES sanpham(id_sanpham) ON DELETE CASCADE,
    UNIQUE KEY unique_section_product (id_section, id_sanpham),
    INDEX idx_section_order (id_section, thu_tu, hien_thi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- BẢNG ĐỊA CHỈ (Addresses)
-- =============================================
CREATE TABLE diachi (
    id_diachi BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_nguoidung BIGINT UNSIGNED NOT NULL,
    ten_nguoinhan VARCHAR(100) NOT NULL,
    sdt VARCHAR(20) NOT NULL,
    diachi_chitiet TEXT NOT NULL,
    thanhpho VARCHAR(100) NOT NULL,
    quanhuyen VARCHAR(100) NOT NULL,
    ma_buudien VARCHAR(20),
    macdinh TINYINT(1) DEFAULT 0,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_nguoidung) REFERENCES nguoidung(id_nguoidung) ON DELETE CASCADE,
    INDEX idx_nguoidung (id_nguoidung),
    INDEX idx_macdinh (macdinh)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- BẢNG GIỎ HÀNG (Shopping Cart)
-- =============================================
CREATE TABLE giohang (
    id_giohang BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_nguoidung BIGINT UNSIGNED NOT NULL,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_capnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_nguoidung) REFERENCES nguoidung(id_nguoidung) ON DELETE CASCADE,
    UNIQUE KEY unique_user_cart (id_nguoidung)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE chitiet_giohang (
    id_chitiet BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_giohang BIGINT UNSIGNED NOT NULL,
    id_sanpham BIGINT UNSIGNED NOT NULL,
    soluong INT NOT NULL DEFAULT 1,
    gia_donvi DECIMAL(15,2) NOT NULL,
    ngay_them TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_capnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_giohang) REFERENCES giohang(id_giohang) ON DELETE CASCADE,
    FOREIGN KEY (id_sanpham) REFERENCES sanpham(id_sanpham) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_product (id_giohang, id_sanpham),
    INDEX idx_giohang (id_giohang),
    INDEX idx_sanpham (id_sanpham)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- BẢNG ĐƠN HÀNG (Orders)
-- =============================================
CREATE TABLE donhang (
    id_donhang BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_nguoidung BIGINT UNSIGNED NOT NULL,
    ma_donhang VARCHAR(50) UNIQUE NOT NULL,
    trangthai ENUM('cho_xacnhan', 'dang_giao', 'hoanthanh', 'huy') DEFAULT 'cho_xacnhan',
    tong_tien DECIMAL(15,2) NOT NULL,
    id_diachi BIGINT UNSIGNED NOT NULL,
    phuongthuc_thanhtoan ENUM('cod', 'payos') DEFAULT 'cod',
    ghichu TEXT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_capnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_nguoidung) REFERENCES nguoidung(id_nguoidung) ON DELETE CASCADE,
    FOREIGN KEY (id_diachi) REFERENCES diachi(id_diachi) ON DELETE RESTRICT,
    INDEX idx_nguoidung (id_nguoidung),
    INDEX idx_ma_donhang (ma_donhang),
    INDEX idx_trangthai (trangthai),
    INDEX idx_ngay_tao (ngay_tao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE chitiet_donhang (
    id_chitiet BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_donhang BIGINT UNSIGNED NOT NULL,
    id_sanpham BIGINT UNSIGNED NOT NULL,
    soluong INT NOT NULL,
    gia_donvi DECIMAL(15,2) NOT NULL,
    thanh_tien DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (id_donhang) REFERENCES donhang(id_donhang) ON DELETE CASCADE,
    FOREIGN KEY (id_sanpham) REFERENCES sanpham(id_sanpham) ON DELETE RESTRICT,
    INDEX idx_donhang (id_donhang),
    INDEX idx_sanpham (id_sanpham)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- BẢNG THANH TOÁN (Payment Transactions)
-- =============================================
CREATE TABLE payment_transactions (
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

-- =============================================
-- BẢNG MÃ GIẢM GIÁ (Vouchers)
-- =============================================
CREATE TABLE magiamgia (
    id_magiamgia INT PRIMARY KEY AUTO_INCREMENT,
    ma VARCHAR(50) UNIQUE NOT NULL,
    mo_ta TEXT,
    loai_giam ENUM('percent', 'fixed') NOT NULL DEFAULT 'percent',
    giatri_giam DECIMAL(15,2) NOT NULL,
    donhang_toi_thieu DECIMAL(15,2) DEFAULT 0,
    gioihan_sudung INT DEFAULT NULL COMMENT 'NULL = không giới hạn',
    hieu_luc_tu DATETIME DEFAULT NULL,
    hieu_luc_den DATETIME DEFAULT NULL,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ma (ma),
    INDEX idx_hieu_luc (hieu_luc_tu, hieu_luc_den)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE voucher_sudung (
    id_sudung BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_voucher INT NOT NULL,
    id_nguoidung BIGINT UNSIGNED NOT NULL,
    id_donhang BIGINT UNSIGNED NOT NULL,
    ngay_sudung TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_voucher) REFERENCES magiamgia(id_magiamgia) ON DELETE CASCADE,
    FOREIGN KEY (id_nguoidung) REFERENCES nguoidung(id_nguoidung) ON DELETE CASCADE,
    FOREIGN KEY (id_donhang) REFERENCES donhang(id_donhang) ON DELETE CASCADE,
    INDEX idx_voucher (id_voucher),
    INDEX idx_nguoidung (id_nguoidung)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- BẢNG DANH SÁCH YÊU THÍCH (Wishlist)
-- =============================================
CREATE TABLE yeuthich (
    id_yeuthich BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_nguoidung BIGINT UNSIGNED NOT NULL,
    id_sanpham BIGINT UNSIGNED NOT NULL,
    ngay_them TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_nguoidung) REFERENCES nguoidung(id_nguoidung) ON DELETE CASCADE,
    FOREIGN KEY (id_sanpham) REFERENCES sanpham(id_sanpham) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist (id_nguoidung, id_sanpham),
    INDEX idx_nguoidung (id_nguoidung),
    INDEX idx_sanpham (id_sanpham)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- BẢNG ĐÁNH GIÁ SẢN PHẨM (Product Reviews)
-- =============================================
CREATE TABLE danhgia_sanpham (
    id_danhgia BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_donhang BIGINT UNSIGNED NOT NULL,
    id_sanpham BIGINT UNSIGNED NOT NULL,
    id_nguoidung BIGINT UNSIGNED NOT NULL,
    so_sao INT NOT NULL CHECK (so_sao >= 0 AND so_sao <= 5),
    noidung TEXT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_donhang) REFERENCES donhang(id_donhang) ON DELETE CASCADE,
    FOREIGN KEY (id_sanpham) REFERENCES sanpham(id_sanpham) ON DELETE CASCADE,
    FOREIGN KEY (id_nguoidung) REFERENCES nguoidung(id_nguoidung) ON DELETE CASCADE,
    UNIQUE KEY unique_review (id_donhang, id_sanpham, id_nguoidung),
    INDEX idx_sanpham (id_sanpham),
    INDEX idx_donhang (id_donhang),
    INDEX idx_nguoidung (id_nguoidung)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE traloi_danhgia (
    id_traloi BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_danhgia BIGINT UNSIGNED NOT NULL,
    id_admin BIGINT UNSIGNED NOT NULL,
    noidung TEXT NOT NULL,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_danhgia) REFERENCES danhgia_sanpham(id_danhgia) ON DELETE CASCADE,
    FOREIGN KEY (id_admin) REFERENCES nguoidung(id_nguoidung) ON DELETE CASCADE,
    INDEX idx_danhgia (id_danhgia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- BẢNG HỖ TRỢ KHÁCH HÀNG (Customer Support)
-- =============================================
CREATE TABLE yeucau_hotro (
    id_yeucau BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_nguoidung BIGINT UNSIGNED NULL,
    hoten VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    sodienthoai VARCHAR(20) NOT NULL,
    loai_lienhe ENUM('individual', 'business') DEFAULT 'individual',
    chude VARCHAR(255) NOT NULL,
    noidung TEXT NOT NULL,
    trangthai ENUM('pending', 'processing', 'resolved', 'closed') DEFAULT 'pending',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_capnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_nguoidung) REFERENCES nguoidung(id_nguoidung) ON DELETE SET NULL,
    INDEX idx_nguoidung (id_nguoidung),
    INDEX idx_trangthai (trangthai),
    INDEX idx_ngay_tao (ngay_tao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- BẢNG NHẬT KÝ HOẠT ĐỘNG (Activity Log)
-- =============================================
CREATE TABLE activity_log (
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

-- =============================================
-- DỮ LIỆU MẪU (Sample Data)
-- =============================================

-- Thêm admin mặc định
INSERT INTO nguoidung (email, matkhau, hoten, quyen) VALUES 
('admin@goojodoq.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin');

-- Thêm danh mục sản phẩm
INSERT INTO danhmuc (ten_danhmuc, duongdan, mo_ta, thu_tu) VALUES
('Quạt Mini', 'quat-mini', 'Quạt mini cầm tay, để bàn', 1),
('Loa Bluetooth', 'loa-bluetooth', 'Loa không dây Bluetooth', 2),
('Tai Nghe', 'tai-nghe', 'Tai nghe có dây và không dây', 3),
('Phụ Kiện Điện Thoại', 'phu-kien-dien-thoai', 'Ốp lưng, cáp sạc, kính cường lực', 4);

-- Thêm product sections
INSERT INTO product_sections (ma_section, ten_section, mo_ta, thu_tu) VALUES
('sale', 'Sản Phẩm Khuyến Mãi', 'Các sản phẩm đang được giảm giá', 1),
('featured', 'Sản Phẩm Nổi Bật', 'Sản phẩm được đề xuất', 2),
('all', 'Tất Cả Sản Phẩm', 'Toàn bộ sản phẩm trong cửa hàng', 3);

-- =============================================
-- TRIGGERS VÀ PROCEDURES
-- =============================================

-- Trigger cập nhật ngày sửa đổi cho bảng sản phẩm
DELIMITER //
CREATE TRIGGER update_product_timestamp 
    BEFORE UPDATE ON sanpham 
    FOR EACH ROW 
BEGIN
    SET NEW.ngay_capnhat = CURRENT_TIMESTAMP;
END//
DELIMITER ;

-- Trigger cập nhật tồn kho khi tạo đơn hàng
DELIMITER //
CREATE TRIGGER update_stock_after_order 
    AFTER INSERT ON chitiet_donhang 
    FOR EACH ROW 
BEGIN
    UPDATE sanpham 
    SET tonkho = tonkho - NEW.soluong 
    WHERE id_sanpham = NEW.id_sanpham;
END//
DELIMITER ;
    ngay_them TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_giohang) REFERENCES giohang(id_giohang) ON DELETE CASCADE,
    FOREIGN KEY (id_sanpham) REFERENCES sanpham(id_sanpham) ON DELETE CASCADE,
    INDEX idx_giohang (id_giohang),
    INDEX idx_sanpham (id_sanpham)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- BẢNG ĐƠN HÀNG (Orders)
-- =============================================
CREATE TABLE donhang (
    id_donhang BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_nguoidung BIGINT UNSIGNED NOT NULL,
    ma_donhang VARCHAR(50) UNIQUE NOT NULL,
    trangthai ENUM('cho_xacnhan', 'dang_giao', 'hoanthanh', 'huy') DEFAULT 'cho_xacnhan',
    trangthai_thanhtoan ENUM('chua_tt', 'da_tt') DEFAULT 'chua_tt',
    tong_tien DECIMAL(15,2) NOT NULL,
    id_diachi BIGINT UNSIGNED,
    phuongthuc_thanhtoan ENUM('cod', 'bank_transfer', 'momo', 'vnpay') DEFAULT 'cod',
    ghichu TEXT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_capnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_nguoidung) REFERENCES nguoidung(id_nguoidung) ON DELETE CASCADE,
    FOREIGN KEY (id_diachi) REFERENCES diachi(id_diachi) ON DELETE SET NULL,
    INDEX idx_nguoidung (id_nguoidung),
    INDEX idx_ma_donhang (ma_donhang),
    INDEX idx_trangthai (trangthai),
    INDEX idx_ngay_tao (ngay_tao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE chitiet_donhang (
    id_chitiet BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_donhang BIGINT UNSIGNED NOT NULL,
    id_sanpham BIGINT UNSIGNED NOT NULL,
    soluong INT NOT NULL,
    gia_donvi DECIMAL(15,2) NOT NULL,
    thanh_tien DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (id_donhang) REFERENCES donhang(id_donhang) ON DELETE CASCADE,
    FOREIGN KEY (id_sanpham) REFERENCES sanpham(id_sanpham) ON DELETE CASCADE,
    INDEX idx_donhang (id_donhang),
    INDEX idx_sanpham (id_sanpham)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- BẢNG DANH SÁCH YÊU THÍCH (Wishlist)
-- =============================================
CREATE TABLE sanpham_yeuthich (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_nguoidung BIGINT UNSIGNED NOT NULL,
    id_sanpham BIGINT UNSIGNED NOT NULL,
    ngay_them TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_nguoidung) REFERENCES nguoidung(id_nguoidung) ON DELETE CASCADE,
    FOREIGN KEY (id_sanpham) REFERENCES sanpham(id_sanpham) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist (id_nguoidung, id_sanpham),
    INDEX idx_nguoidung (id_nguoidung),
    INDEX idx_sanpham (id_sanpham)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- BẢNG MÃ GIẢM GIÁ (Vouchers)
-- =============================================
CREATE TABLE magiamgia (
    id_magiamgia BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    ma VARCHAR(50) UNIQUE NOT NULL,
    mo_ta TEXT,
    loai_giam ENUM('theo_phantram', 'theo_sotien') NOT NULL,
    giatri_giam DECIMAL(15,2) NOT NULL,
    donhang_toi_thieu DECIMAL(15,2) DEFAULT 0,
    gioihan_sudung INT,
    hieu_luc_tu TIMESTAMP NULL,
    hieu_luc_den TIMESTAMP NULL,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ma (ma),
    INDEX idx_hieu_luc (hieu_luc_tu, hieu_luc_den)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE voucher_sudung (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_voucher BIGINT UNSIGNED NOT NULL,
    id_nguoidung BIGINT UNSIGNED NOT NULL,
    id_donhang BIGINT UNSIGNED NOT NULL,
    ngay_sudung TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_voucher) REFERENCES magiamgia(id_magiamgia) ON DELETE CASCADE,
    FOREIGN KEY (id_nguoidung) REFERENCES nguoidung(id_nguoidung) ON DELETE CASCADE,
    FOREIGN KEY (id_donhang) REFERENCES donhang(id_donhang) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- BẢNG ĐÁNH GIÁ SẢN PHẨM (Product Reviews)
-- =============================================
CREATE TABLE danhgia_sanpham (
    id_danhgia BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_donhang BIGINT UNSIGNED NOT NULL,
    id_sanpham BIGINT UNSIGNED NOT NULL,
    id_nguoidung BIGINT UNSIGNED NOT NULL,
    so_sao INT NOT NULL CHECK (so_sao >= 0 AND so_sao <= 5),
    noidung TEXT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_donhang) REFERENCES donhang(id_donhang) ON DELETE CASCADE,
    FOREIGN KEY (id_sanpham) REFERENCES sanpham(id_sanpham) ON DELETE CASCADE,
    FOREIGN KEY (id_nguoidung) REFERENCES nguoidung(id_nguoidung) ON DELETE CASCADE,
    UNIQUE KEY unique_review (id_donhang, id_sanpham, id_nguoidung),
    INDEX idx_sanpham (id_sanpham),
    INDEX idx_nguoidung (id_nguoidung)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE traloi_danhgia (
    id_traloi BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_danhgia BIGINT UNSIGNED NOT NULL,
    id_admin BIGINT UNSIGNED NOT NULL,
    noidung TEXT NOT NULL,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_danhgia) REFERENCES danhgia_sanpham(id_danhgia) ON DELETE CASCADE,
    FOREIGN KEY (id_admin) REFERENCES nguoidung(id_nguoidung) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- BẢNG YÊU CẦU HỖ TRỢ (Support Requests)
-- =============================================
CREATE TABLE yeucau_hotro (
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

-- =============================================
-- BẢNG GIAO DỊCH THANH TOÁN (Payment Transactions)
-- =============================================
CREATE TABLE payment_transactions (
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

-- =============================================
-- DỮ LIỆU MẪU (Sample Data)
-- =============================================

-- Thêm admin mặc định
INSERT INTO nguoidung (email, matkhau, hoten, quyen) VALUES 
('admin@goojodoq.com', '$2b$10$example_hashed_password', 'Administrator', 'admin');

-- Thêm danh mục sản phẩm
INSERT INTO danhmuc (ten_danhmuc, duongdan, mo_ta, thu_tu) VALUES
('Quạt mini', 'quat-mini', 'Quạt mini cầm tay, để bàn', 1),
('Loa Bluetooth', 'loa-bluetooth', 'Loa không dây chất lượng cao', 2),
('Tai nghe', 'tai-nghe', 'Tai nghe có dây và không dây', 3),
('Phụ kiện điện thoại', 'phu-kien-dien-thoai', 'Ốp lưng, cáp sạc, đế đỡ', 4);

-- Thêm sections mặc định
INSERT INTO product_sections (ma_section, ten_section, mo_ta, thu_tu) VALUES
('sale', 'Sản phẩm đang giảm giá', 'Ưu đãi đặc biệt - Số lượng có hạn', 1),
('featured', 'Sản phẩm nổi bật', 'Những sản phẩm được yêu thích nhất', 2),
('all', 'Tất cả sản phẩm', 'Toàn bộ sản phẩm trong cửa hàng', 3);

-- Thêm sản phẩm mẫu
INSERT INTO sanpham (ma_sku, ten_sanpham, duongdan, mota_ngan, id_danhmuc, gia, gia_goc, tonkho) VALUES
('QUAT001', 'Quạt mini cầm tay GOOJODOQ', 'quat-mini-cam-tay', 'Quạt mini tiện lợi, pin sạc USB', 1, 150000, 200000, 50),
('LOA001', 'Loa Bluetooth GOOJODOQ Pro', 'loa-bluetooth-pro', 'Loa không dây chất lượng cao, âm thanh sống động', 2, 500000, 600000, 30),
('TAI001', 'Tai nghe không dây GOOJODOQ Air', 'tai-nghe-khong-day', 'Tai nghe True Wireless với chất lượng âm thanh tuyệt vời', 3, 800000, 1000000, 25);

-- Thêm ảnh sản phẩm mẫu
INSERT INTO anh_sanpham (id_sanpham, duongdan_anh, mo_ta, thu_tu) VALUES
(1, 'images/products/quat-mini-1.jpg', 'Quạt mini - Ảnh chính', 0),
(2, 'images/products/loa-bluetooth-1.jpg', 'Loa Bluetooth - Ảnh chính', 0),
(3, 'images/products/tai-nghe-1.jpg', 'Tai nghe - Ảnh chính', 0);

-- Thêm sản phẩm vào sections
INSERT INTO product_section_items (id_section, id_sanpham, thu_tu) VALUES
(1, 1, 1), -- Quạt mini vào section sale
(1, 3, 2), -- Tai nghe vào section sale
(2, 2, 1), -- Loa vào section featured
(2, 3, 2), -- Tai nghe vào section featured
(3, 1, 1), -- Tất cả sản phẩm
(3, 2, 2),
(3, 3, 3);

-- Thêm mã giảm giá mẫu
INSERT INTO magiamgia (ma, mo_ta, loai_giam, giatri_giam, donhang_toi_thieu, gioihan_sudung, hieu_luc_den) VALUES
('WELCOME10', 'Giảm 10% cho đơn hàng đầu tiên', 'theo_phantram', 10, 200000, 100, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('FREESHIP', 'Miễn phí vận chuyển', 'theo_sotien', 30000, 500000, 50, DATE_ADD(NOW(), INTERVAL 15 DAY));
 