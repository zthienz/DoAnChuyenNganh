-- =============================================
-- MIGRATION: Thêm trạng thái 'cho_thanhtoan' vào bảng donhang
-- Ngày: 2026-01-12
-- Mục đích: Fix lỗi đơn hàng vẫn được tạo khi hủy thanh toán
-- =============================================

-- Thêm trạng thái 'cho_thanhtoan' vào ENUM trangthai
ALTER TABLE donhang 
MODIFY COLUMN trangthai ENUM('cho_thanhtoan', 'cho_xacnhan', 'dang_giao', 'hoanthanh', 'huy') 
DEFAULT 'cho_xacnhan';

-- Cập nhật các đơn hàng bank_transfer chưa thanh toán thành trạng thái cho_thanhtoan
UPDATE donhang 
SET trangthai = 'cho_thanhtoan' 
WHERE phuongthuc_thanhtoan IN ('bank_transfer', 'payos') 
  AND trangthai_thanhtoan = 'chua_tt' 
  AND trangthai = 'cho_xacnhan';

-- Kiểm tra kết quả
SELECT 
  trangthai, 
  phuongthuc_thanhtoan, 
  trangthai_thanhtoan,
  COUNT(*) as so_luong
FROM donhang 
GROUP BY trangthai, phuongthuc_thanhtoan, trangthai_thanhtoan
ORDER BY trangthai, phuongthuc_thanhtoan;