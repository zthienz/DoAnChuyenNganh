-- =============================================
-- TẠO TÀI KHOẢN ADMIN MẪU
-- =============================================

-- Xóa admin cũ nếu có (tùy chọn)
-- DELETE FROM nguoidung WHERE email = 'admin@goojodoq.com';

-- Thêm tài khoản admin mới
-- Mật khẩu: admin123 (đã được hash bằng bcrypt)
INSERT INTO nguoidung (email, matkhau, hoten, sdt, quyen, trangthai) 
VALUES (
    'admin@goojodoq.com',
    '$2b$10$rZ5YjKvZ5YjKvZ5YjKvZ5e5YjKvZ5YjKvZ5YjKvZ5YjKvZ5YjKvZ5',  -- Thay bằng hash thực tế
    'Administrator',
    '0123456789',
    'admin',
    1
);

-- Kiểm tra tài khoản đã tạo
SELECT id_nguoidung, email, hoten, quyen, trangthai 
FROM nguoidung 
WHERE quyen = 'admin';

-- =============================================
-- HƯỚNG DẪN TẠO HASH MẬT KHẨU
-- =============================================

-- Chạy script Node.js sau để tạo hash mật khẩu:
-- node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10, (err, hash) => console.log(hash));"

-- Hoặc sử dụng script create_admin_user.js trong thư mục scripts
