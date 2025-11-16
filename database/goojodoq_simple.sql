-- =============================================
-- GOOJODOQ DATABASE - PHIÊN BẢN ĐƠN GIẢN
-- =============================================

-- Drop database cũ nếu có
DROP DATABASE IF EXISTS goojodoq_db;

-- Tạo database mới
CREATE DATABASE IF NOT EXISTS goojodoq_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE goojodoq_db;

-- 1. Bảng người dùng
CREATE TABLE nguoidung (
    id_nguoidung BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    matkhau VARCHAR(255) NOT NULL,
    hoten VARCHAR(150),
    sdt VARCHAR(30),
    quyen ENUM('nguoidung','admin') NOT NULL DEFAULT 'nguoidung',
    trangthai TINYINT(1) DEFAULT 1,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_capnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Bảng danh mục sản phẩm
CREATE TABLE danhmuc (
    id_danhmuc INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ten_danhmuc VARCHAR(150) NOT NULL,
    duongdan VARCHAR(200) NOT NULL UNIQUE,
    id_cha INT UNSIGNED DEFAULT NULL,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cha) REFERENCES danhmuc(id_danhmuc) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Bảng sản phẩm
CREATE TABLE sanpham (
    id_sanpham BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ma_sku VARCHAR(100) UNIQUE,
    ten_sanpham VARCHAR(255) NOT NULL,
    duongdan VARCHAR(255) NOT NULL UNIQUE,
    mota_ngan VARCHAR(500),
    mota_chitiet TEXT,
    id_danhmuc INT UNSIGNED,
    gia DECIMAL(12,2) NOT NULL,
    gia_goc DECIMAL(12,2) DEFAULT NULL,
    tonkho INT DEFAULT 0,
    hien_thi TINYINT(1) DEFAULT 1,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_capnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_danhmuc) REFERENCES danhmuc(id_danhmuc) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Ảnh sản phẩm
CREATE TABLE anh_sanpham (
    id_anh BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_sanpham BIGINT UNSIGNED NOT NULL,
    duongdan_anh VARCHAR(1000) NOT NULL,
    mo_ta VARCHAR(255),
    thu_tu INT DEFAULT 0,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_sanpham) REFERENCES sanpham(id_sanpham) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Đánh giá sản phẩm
CREATE TABLE danhgia (
    id_danhgia BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_sanpham BIGINT UNSIGNED NOT NULL,
    id_nguoidung BIGINT UNSIGNED NOT NULL,
    so_sao TINYINT UNSIGNED NOT NULL,
    tieude VARCHAR(255),
    noidung TEXT,
    hien_thi TINYINT(1) DEFAULT 1,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_sanpham) REFERENCES sanpham(id_sanpham) ON DELETE CASCADE,
    FOREIGN KEY (id_nguoidung) REFERENCES nguoidung(id_nguoidung) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- INSERT DỮ LIỆU MẪU
-- =============================================

-- 1. Người dùng
INSERT INTO nguoidung (email, matkhau, hoten, sdt, quyen) VALUES
('admin@goojodoq.com', 'password', 'Quản Trị Viên', '0909009009', 'admin'),
('khach1@gmail.com', 'password', 'Nguyễn Văn A', '0912345678', 'nguoidung');

-- 2. Danh mục
INSERT INTO danhmuc (ten_danhmuc, duongdan) VALUES
('Tai nghe Bluetooth', 'tai-nghe-bluetooth'),
('Loa Bluetooth', 'loa-bluetooth'),
('Phụ kiện điện thoại', 'phu-kien-dien-thoai');

-- 3. Sản phẩm
INSERT INTO sanpham (ma_sku, ten_sanpham, duongdan, mota_ngan, mota_chitiet, id_danhmuc, gia, gia_goc, tonkho) VALUES
('TN-TWS-001', 'GOOJODOQ Tai nghe Bluetooth TWS Pro', 'tai-nghe-bluetooth-tws-pro', 
 'Tai nghe Bluetooth không dây cao cấp với âm thanh sống động', 
 '<h4>Đặc điểm nổi bật</h4><ul><li>Âm thanh Hi-Fi chất lượng cao</li><li>Chống ồn chủ động ANC</li><li>Pin 30 giờ sử dụng</li><li>Kết nối Bluetooth 5.3</li></ul>', 
 1, 499000, 599000, 50),

('LOA-BT-001', 'GOOJODOQ Loa Bluetooth Mini', 'loa-bluetooth-mini',
 'Loa Bluetooth nhỏ gọn, âm thanh mạnh mẽ',
 '<h4>Đặc điểm nổi bật</h4><ul><li>Âm thanh stereo mạnh mẽ</li><li>Pin 10 giờ sử dụng</li><li>Thiết kế nhỏ gọn</li><li>Kết nối Bluetooth 5.0</li></ul>',
 2, 299000, 399000, 30),

('QUAT-MINI-001', 'GOOJODOQ Quạt mini cầm tay', 'quat-mini-cam-tay',
 'Quạt mini tiện lợi, pin sạc USB',
 '<h4>Đặc điểm nổi bật</h4><ul><li>3 tốc độ gió</li><li>Pin sạc USB</li><li>Thiết kế nhỏ gọn</li><li>Sử dụng 4-6 giờ</li></ul>',
 3, 149000, 199000, 60);

-- 4. Ảnh sản phẩm
INSERT INTO anh_sanpham (id_sanpham, duongdan_anh, mo_ta, thu_tu) VALUES
(1, 'images/categories/J201-1.webp', 'Tai nghe TWS Pro', 0),
(1, 'images/categories/J201-1.webp', 'Tai nghe TWS Pro - Góc 2', 1),
(2, 'images/categories/AB4088-1.webp', 'Loa Bluetooth Mini', 0),
(2, 'images/categories/AB4088-1.webp', 'Loa Bluetooth Mini - Góc 2', 1),
(3, 'images/categories/GFS001-1.webp', 'Quạt mini cầm tay', 0),
(3, 'images/categories/GFS001-1.webp', 'Quạt mini cầm tay - Góc 2', 1);

-- 5. Đánh giá mẫu
INSERT INTO danhgia (id_sanpham, id_nguoidung, so_sao, tieude, noidung) VALUES
(1, 2, 5, 'Sản phẩm tuyệt vời!', 'Tai nghe chất lượng tốt, âm thanh rõ ràng'),
(2, 2, 4, 'Loa hay', 'Âm thanh to và rõ, pin trâu');

-- =============================================
-- KIỂM TRA DỮ LIỆU
-- =============================================

SELECT 'Database created successfully!' as message;
SELECT COUNT(*) as total_users FROM nguoidung;
SELECT COUNT(*) as total_categories FROM danhmuc;
SELECT COUNT(*) as total_products FROM sanpham;
SELECT COUNT(*) as total_images FROM anh_sanpham;

-- Xem sản phẩm với ảnh
SELECT 
    sp.id_sanpham,
    sp.ten_sanpham,
    sp.gia,
    sp.gia_goc,
    sp.tonkho,
    (SELECT duongdan_anh FROM anh_sanpham WHERE id_sanpham = sp.id_sanpham ORDER BY thu_tu LIMIT 1) as anh_chinh
FROM sanpham sp
WHERE sp.hien_thi = 1;