-- Tạo bảng đánh giá sản phẩm
CREATE TABLE IF NOT EXISTS danhgia_sanpham (
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
    UNIQUE KEY unique_review (id_donhang, id_sanpham, id_nguoidung)
);

-- Tạo bảng trả lời đánh giá (cho admin)
CREATE TABLE IF NOT EXISTS traloi_danhgia (
    id_traloi BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_danhgia BIGINT UNSIGNED NOT NULL,
    id_admin BIGINT UNSIGNED NOT NULL,
    noidung TEXT NOT NULL,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_danhgia) REFERENCES danhgia_sanpham(id_danhgia) ON DELETE CASCADE,
    FOREIGN KEY (id_admin) REFERENCES nguoidung(id_nguoidung) ON DELETE CASCADE
);

-- Index để tăng tốc truy vấn
CREATE INDEX idx_danhgia_sanpham ON danhgia_sanpham(id_sanpham);
CREATE INDEX idx_danhgia_donhang ON danhgia_sanpham(id_donhang);
CREATE INDEX idx_danhgia_nguoidung ON danhgia_sanpham(id_nguoidung);
