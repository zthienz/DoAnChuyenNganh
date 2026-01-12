-- Migration: Remove 'cho_thanhtoan' status from order enum
-- Date: 2026-01-12
-- Description: Update order status logic - remove 'cho_thanhtoan' status as orders now start with 'cho_xacnhan'

-- Update any existing orders with 'cho_thanhtoan' status to 'cho_xacnhan'
UPDATE donhang 
SET trangthai = 'cho_xacnhan' 
WHERE trangthai = 'cho_thanhtoan';

-- Modify the ENUM to remove 'cho_thanhtoan' status
ALTER TABLE donhang 
MODIFY COLUMN trangthai ENUM('cho_xacnhan', 'dang_giao', 'hoanthanh', 'huy') 
DEFAULT 'cho_xacnhan';

-- Add comment to document the change
ALTER TABLE donhang COMMENT = 'Orders table - Updated 2026-01-12: Removed cho_thanhtoan status, orders now start with cho_xacnhan and payment status determines cancellation ability';