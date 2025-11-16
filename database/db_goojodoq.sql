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

-- 2. Bảng địa chỉ người dùng
CREATE TABLE diachi (
  id_diachi BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_nguoidung BIGINT UNSIGNED NOT NULL,
  ten_nguoinhan VARCHAR(150),
  sdt VARCHAR(30),
  diachi_chitiet TEXT,
  thanhpho VARCHAR(100),
  quanhuyen VARCHAR(100),
  ma_buudien VARCHAR(20),
  macdinh TINYINT(1) DEFAULT 0,
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_nguoidung) REFERENCES nguoidung(id_nguoidung) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Bảng danh mục sản phẩm
CREATE TABLE danhmuc (
  id_danhmuc INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ten_danhmuc VARCHAR(150) NOT NULL,
  duongdan VARCHAR(200) NOT NULL UNIQUE,
  id_cha INT UNSIGNED DEFAULT NULL,
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_cha) REFERENCES danhmuc(id_danhmuc) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Bảng sản phẩm
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
  donvi_tiente VARCHAR(10) DEFAULT 'VND',
  tonkho INT DEFAULT 0,
  hien_thi TINYINT(1) DEFAULT 1,
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ngay_capnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_danhmuc) REFERENCES danhmuc(id_danhmuc) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Ảnh sản phẩm
CREATE TABLE anh_sanpham (
  id_anh BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_sanpham BIGINT UNSIGNED NOT NULL,
  duongdan_anh VARCHAR(1000) NOT NULL,
  mo_ta VARCHAR(255),
  thu_tu INT DEFAULT 0,
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_sanpham) REFERENCES sanpham(id_sanpham) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Biến thể sản phẩm
CREATE TABLE bien_the (
  id_bienthe BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_sanpham BIGINT UNSIGNED NOT NULL,
  ma_sku VARCHAR(100),
  ten_bienthe VARCHAR(255), -- ví dụ: "Màu Đen / 64GB"
  gia DECIMAL(12,2),
  tonkho INT DEFAULT 0,
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_sanpham) REFERENCES sanpham(id_sanpham) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Giỏ hàng
CREATE TABLE giohang (
  id_giohang BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_nguoidung BIGINT UNSIGNED NOT NULL,
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ngay_capnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_giohang_nguoidung (id_nguoidung),
  FOREIGN KEY (id_nguoidung) REFERENCES nguoidung(id_nguoidung) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Chi tiết giỏ hàng
CREATE TABLE chitiet_giohang (
  id_chitiet BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_giohang BIGINT UNSIGNED NOT NULL,
  id_sanpham BIGINT UNSIGNED NOT NULL,
  id_bienthe BIGINT UNSIGNED DEFAULT NULL,
  soluong INT NOT NULL DEFAULT 1,
  gia_donvi DECIMAL(12,2) NOT NULL,
  ngay_them TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_giohang) REFERENCES giohang(id_giohang) ON DELETE CASCADE,
  FOREIGN KEY (id_sanpham) REFERENCES sanpham(id_sanpham) ON DELETE CASCADE,
  FOREIGN KEY (id_bienthe) REFERENCES bien_the(id_bienthe) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Đơn hàng
CREATE TABLE donhang (
  id_donhang BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_nguoidung BIGINT UNSIGNED NOT NULL,
  ma_donhang VARCHAR(50) NOT NULL UNIQUE,
  trangthai ENUM('cho_xacnhan','da_xacnhan','dang_xuly','dang_giao','hoanthanh','huy','hoan_tien') DEFAULT 'cho_xacnhan',
  tong_tien DECIMAL(14,2) NOT NULL,
  id_diachi BIGINT UNSIGNED,
  phuongthuc_thanhtoan VARCHAR(100),
  trangthai_thanhtoan ENUM('chua_tt','da_tt','mot_phan','hoan_tien') DEFAULT 'chua_tt',
  ghichu TEXT,
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ngay_capnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_nguoidung) REFERENCES nguoidung(id_nguoidung) ON DELETE SET NULL,
  FOREIGN KEY (id_diachi) REFERENCES diachi(id_diachi) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Chi tiết đơn hàng
CREATE TABLE chitiet_donhang (
  id_chitiet BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_donhang BIGINT UNSIGNED NOT NULL,
  id_sanpham BIGINT UNSIGNED NOT NULL,
  id_bienthe BIGINT UNSIGNED DEFAULT NULL,
  ten_sanpham VARCHAR(255),
  soluong INT NOT NULL,
  gia_donvi DECIMAL(12,2) NOT NULL,
  thanh_tien DECIMAL(14,2) NOT NULL,
  FOREIGN KEY (id_donhang) REFERENCES donhang(id_donhang) ON DELETE CASCADE,
  FOREIGN KEY (id_sanpham) REFERENCES sanpham(id_sanpham) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Thanh toán
CREATE TABLE thanhtoan (
  id_thanhtoan BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_donhang BIGINT UNSIGNED NOT NULL,
  so_tien DECIMAL(14,2) NOT NULL,
  hinhthuc VARCHAR(100),
  ma_giaodich VARCHAR(255),
  trangthai ENUM('khoi_tao','thanh_cong','that_bai','hoan_tien') DEFAULT 'khoi_tao',
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_donhang) REFERENCES donhang(id_donhang) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Đánh giá sản phẩm
CREATE TABLE danhgia (
  id_danhgia BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_sanpham BIGINT UNSIGNED NOT NULL,
  id_nguoidung BIGINT UNSIGNED NOT NULL,
  so_sao TINYINT UNSIGNED NOT NULL,
  tieude VARCHAR(255),
  noidung TEXT,
  phanhoi_admin TEXT,
  id_admin BIGINT UNSIGNED,
  hien_thi TINYINT(1) DEFAULT 1,
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_sanpham) REFERENCES sanpham(id_sanpham) ON DELETE CASCADE,
  FOREIGN KEY (id_nguoidung) REFERENCES nguoidung(id_nguoidung) ON DELETE SET NULL,
  FOREIGN KEY (id_admin) REFERENCES nguoidung(id_nguoidung) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Hành động của admin
CREATE TABLE hanhdong_admin (
  id_hanhdong BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_admin BIGINT UNSIGNED NOT NULL,
  loai_hanhdong VARCHAR(100) NOT NULL,
  bang_lienquan VARCHAR(100),
  id_doi_tuong BIGINT,
  mo_ta TEXT,
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_admin) REFERENCES nguoidung(id_nguoidung) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Lịch sử tồn kho
CREATE TABLE lichsu_tonkho (
  id_lichsu BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_sanpham BIGINT UNSIGNED NOT NULL,
  id_bienthe BIGINT UNSIGNED DEFAULT NULL,
  thaydoi INT NOT NULL, -- + hoặc -
  lydo VARCHAR(100),
  id_thamchieu BIGINT,
  id_nguoithuchien BIGINT UNSIGNED,
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_sanpham) REFERENCES sanpham(id_sanpham) ON DELETE CASCADE,
  FOREIGN KEY (id_bienthe) REFERENCES bien_the(id_bienthe) ON DELETE SET NULL,
  FOREIGN KEY (id_nguoithuchien) REFERENCES nguoidung(id_nguoidung) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. Mã giảm giá
CREATE TABLE magiamgia (
  id_magiamgia BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ma VARCHAR(100) NOT NULL UNIQUE,
  mo_ta VARCHAR(255),
  loai_giam ENUM('theo_tien','theo_phantram'),
  giatri_giam DECIMAL(12,2),
  donhang_toi_thieu DECIMAL(14,2) DEFAULT 0,
  hieu_luc_tu DATETIME,
  hieu_luc_den DATETIME,
  gioihan_sudung INT DEFAULT NULL,
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 1. Bảng người dùng
INSERT INTO nguoidung (email, matkhau, hoten, sdt, quyen)
VALUES 
('admin@goojodoq.vn', '123456', 'Quản Trị Viên', '0909009009', 'admin'),
('khachhang1@gmail.com', '123456', 'Nguyen Van A', '0912345678', 'nguoidung'),
('khachhang2@gmail.com', '123456', 'Tran Thi B', '0987654321', 'nguoidung');

-- 2. Bảng địa chỉ
INSERT INTO diachi (id_nguoidung, ten_nguoinhan, sdt, diachi_chitiet, thanhpho, quanhuyen, ma_buudien, macdinh)
VALUES
(2, 'Nguyen Van A', '0912345678', '123 Đường ABC, Phường 1', 'TP.HCM', 'Quận 3', '700000', 1),
(3, 'Tran Thi B', '0987654321', '456 Đường XYZ, Phường 5', 'Hà Nội', 'Ba Đình', '100000', 1);

-- 3. Bảng danh mục
INSERT INTO danhmuc (ten_danhmuc, duongdan)
VALUES
('Phụ kiện điện thoại', 'phu-kien-dien-thoai'),
('Phụ kiện máy tính', 'phu-kien-may-tinh'),
('Phụ kiện iPad', 'phu-kien-ipad');

-- 4. Bảng sản phẩm
INSERT INTO sanpham (ma_sku, ten_sanpham, duongdan, mota_ngan, gia, tonkho, id_danhmuc)
VALUES
('GDQ-001', 'Chuột Bluetooth Goojodoq M1', 'chuot-bluetooth-goojodoq-m1', 'Chuột không dây Bluetooth siêu nhạy', 250000, 50, 2),
('GDQ-002', 'Bàn phím không dây Goojodoq K1', 'ban-phim-goojodoq-k1', 'Bàn phím mỏng nhẹ, pin lâu', 350000, 30, 2),
('GDQ-003', 'Bút cảm ứng Goojodoq P1 cho iPad', 'but-cam-ung-goojodoq-p1', 'Bút cảm ứng chuyên dụng cho iPad', 490000, 40, 3);

-- 5. Ảnh sản phẩm
INSERT INTO anh_sanpham (id_sanpham, duongdan_anh, mo_ta)
VALUES
(1, '/images/categories/chuot-m1-1.jpg', 'Ảnh mặt trên'),
(1, '/images/categories/chuot-m1-2.jpg', 'Ảnh mặt bên'),
(2, '/images/categories/banphim-k1-1.jpg', 'Ảnh tổng thể'),
(3, '/images/categories/but-p1-1.jpg', 'Ảnh sản phẩm bút');


-- 6. Biến thể sản phẩm (nếu có)
INSERT INTO bien_the (id_sanpham, ma_sku, ten_bienthe, gia, tonkho)
VALUES
(3, 'GDQ-P1-TRANG', 'Màu Trắng', 490000, 20),
(3, 'GDQ-P1-DEN', 'Màu Đen', 490000, 20);

-- 7. Giỏ hàng
INSERT INTO giohang (id_nguoidung)
VALUES (2), (3);

-- 8. Chi tiết giỏ hàng
INSERT INTO chitiet_giohang (id_giohang, id_sanpham, soluong, gia_donvi)
VALUES
(1, 1, 1, 250000),
(1, 3, 1, 490000),
(2, 2, 1, 350000);

-- 9. Đơn hàng
INSERT INTO donhang (id_nguoidung, ma_donhang, tong_tien, id_diachi, phuongthuc_thanhtoan, trangthai_thanhtoan)
VALUES
(2, 'DH0001', 740000, 1, 'COD', 'chua_tt'),
(3, 'DH0002', 350000, 2, 'Chuyển khoản', 'da_tt');

-- 10. Chi tiết đơn hàng
INSERT INTO chitiet_donhang (id_donhang, id_sanpham, ten_sanpham, soluong, gia_donvi, thanh_tien)
VALUES
(1, 1, 'Chuột Bluetooth Goojodoq M1', 1, 250000, 250000),
(1, 3, 'Bút cảm ứng Goojodoq P1', 1, 490000, 490000),
(2, 2, 'Bàn phím Goojodoq K1', 1, 350000, 350000);

-- 11. Thanh toán
INSERT INTO thanhtoan (id_donhang, so_tien, hinhthuc, ma_giaodich, trangthai)
VALUES
(1, 0, 'COD', NULL, 'khoi_tao'),
(2, 350000, 'Chuyển khoản', 'BANK123456', 'thanh_cong');

-- 12. Đánh giá
INSERT INTO danhgia (id_sanpham, id_nguoidung, so_sao, tieude, noidung)
VALUES
(1, 2, 5, 'Sản phẩm tốt', 'Chuột rất nhạy, cầm chắc tay.'),
(3, 3, 4, 'Bút cảm ứng ổn', 'Bút viết mượt nhưng pin hơi yếu.');

-- 13. Hành động admin
INSERT INTO hanhdong_admin (id_admin, loai_hanhdong, bang_lienquan, id_doi_tuong, mo_ta)
VALUES
(1, 'them_sanpham', 'sanpham', 3, 'Thêm sản phẩm mới Goojodoq P1'),
(1, 'capnhat_donhang', 'donhang', 2, 'Xác nhận thanh toán đơn hàng DH0002');

-- 14. Lịch sử tồn kho
INSERT INTO lichsu_tonkho (id_sanpham, thaydoi, lydo, id_thamchieu, id_nguoithuchien)
VALUES
(1, -1, 'ban_hang', 1, 2),
(3, -1, 'ban_hang', 1, 2),
(2, -1, 'ban_hang', 2, 3);

-- 15. Mã giảm giá
INSERT INTO magiamgia (ma, mo_ta, loai_giam, giatri_giam, donhang_toi_thieu, hieu_luc_tu, hieu_luc_den)
VALUES
('SALE10', 'Giảm 10% cho đơn từ 500K', 'theo_phantram', 10, 500000, '2025-01-01', '2025-12-31'),
('GIAM50K', 'Giảm trực tiếp 50.000đ', 'theo_tien', 50000, 300000, '2025-01-01', '2025-12-31');
