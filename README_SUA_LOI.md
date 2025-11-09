# 🚨 SỬA LỖI NHANH - 3 BƯỚC

## ❌ LỖI BẠN GẶP:
- API trả về 500 (Internal Server Error)
- CORS error với ảnh

---

## ✅ GIẢI PHÁP NHANH - 3 BƯỚC

### BƯỚC 1: Kiểm tra Setup
```bash
node check-setup.js
```

Script này sẽ kiểm tra:
- ✅ Environment variables
- ✅ Database connection
- ✅ Bảng có tồn tại không
- ✅ Sản phẩm có trong DB không
- ✅ File ảnh có tồn tại không

### BƯỚC 2: Khởi động Backend
```bash
cd Goojodoq_Backend
node server.js
```

Phải thấy:
```
🚀 Server running on port 3000
```

### BƯỚC 3: Test
Mở file:
```
TEST_SIMPLE.html
```

Click:
1. **Test Backend** → Phải thấy ✅
2. **Lấy Sản Phẩm** → Phải thấy 3 sản phẩm

---

## 🔧 NẾU VẪN LỖI

### Lỗi: "Cannot connect to MySQL"
```bash
# Kiểm tra MySQL đang chạy
# Windows: Services → MySQL80 → Start
# Hoặc: XAMPP → Start MySQL
```

### Lỗi: "No products found"
```sql
-- Mở MySQL Workbench
-- File > Open SQL Script
-- Chọn: database/insert_products_with_images.sql
-- Execute
```

### Lỗi: "Image not found"
```bash
# Copy ảnh vào thư mục:
frontend/images/categories/
├── J201-1.webp
├── AB4088-1.webp
└── GFS001-1.webp
```

---

## 📁 FILES QUAN TRỌNG

- `check-setup.js` - Script kiểm tra setup
- `TEST_SIMPLE.html` - Test đơn giản
- `SUA_LOI.md` - Hướng dẫn chi tiết
- `database/insert_products_with_images.sql` - Dữ liệu mẫu

---

## ✅ SAU KHI SỬA XONG

Mở `frontend/index.html` → Phải thấy 3 sản phẩm hiển thị!

---

## 📞 CẦN TRỢ GIÚP?

Xem file: `SUA_LOI.md` để biết chi tiết