-- =============================================
-- THÊM ADMIN MỚI VÀO HỆ THỐNG
-- =============================================

-- Cách 1: Thêm trực tiếp vào database (password đã được hash)
-- Password: "admin123" -> Hash: $2b$10$CwTycUXWue0Thq9StjUM0uJ8KqBTtEd8QzKqTzr6z.dllKqrPqeQu

INSERT INTO users (email, password, full_name, role, is_active, email_verified) VALUES
('admin2@goojodoq.com', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8KqBTtEd8QzKqTzr6z.dllKqrPqeQu', 'Admin Phụ', 'admin', TRUE, TRUE);

-- Cách 2: Thêm nhiều admin cùng lúc
INSERT INTO users (email, password, full_name, role, is_active, email_verified) VALUES
('manager@goojodoq.com', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8KqBTtEd8QzKqTzr6z.dllKqrPqeQu', 'Quản lý', 'admin', TRUE, TRUE),
('support@goojodoq.com', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8KqBTtEd8QzKqTzr6z.dllKqrPqeQu', 'Hỗ trợ', 'admin', TRUE, TRUE);

-- =============================================
-- CÁCH TẠO HASH PASSWORD TRONG NODE.JS
-- =============================================

/*
Trong code Node.js, bạn sử dụng bcrypt để hash password:

const bcrypt = require('bcrypt');

// Hash password
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// Sử dụng:
const hashedPassword = await hashPassword('admin123');
console.log(hashedPassword); // Dùng kết quả này để insert vào database

// Verify password khi login
const verifyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};
*/

-- =============================================
-- STORED PROCEDURE TẠO ADMIN MỚI
-- =============================================

DELIMITER //

CREATE PROCEDURE CreateNewAdmin(
    IN p_email VARCHAR(255),
    IN p_password_hash VARCHAR(255),
    IN p_full_name VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Kiểm tra email đã tồn tại chưa
    IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Email đã tồn tại trong hệ thống';
    END IF;
    
    -- Thêm admin mới
    INSERT INTO users (email, password, full_name, role, is_active, email_verified) 
    VALUES (p_email, p_password_hash, p_full_name, 'admin', TRUE, TRUE);
    
    COMMIT;
    
    SELECT 'Admin mới đã được tạo thành công' as message;
END //

DELIMITER ;

-- Sử dụng stored procedure:
-- CALL CreateNewAdmin('newadmin@goojodoq.com', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8KqBTtEd8QzKqTzr6z.dllKqrPqeQu', 'Admin Mới');

-- =============================================
-- XEM DANH SÁCH ADMIN HIỆN TẠI
-- =============================================

SELECT user_id, email, full_name, role, is_active, created_at 
FROM users 
WHERE role = 'admin' 
ORDER BY created_at DESC;

-- =============================================
-- CẬP NHẬT THÔNG TIN ADMIN
-- =============================================

-- Đổi password admin (cần hash trước)
UPDATE users 
SET password = '$2b$10$NewHashedPasswordHere', updated_at = CURRENT_TIMESTAMP 
WHERE email = 'admin@goojodoq.com';

-- Vô hiệu hóa admin
UPDATE users 
SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
WHERE email = 'admin@goojodoq.com';

-- Kích hoạt lại admin
UPDATE users 
SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP 
WHERE email = 'admin@goojodoq.com';