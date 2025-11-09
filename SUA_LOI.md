# 🔧 HƯỚNG DẪN SỬA LỖI

## ❌ LỖI BẠN GẶP PHẢI

### Lỗi 1: API trả về 500 (Internal Server Error)
```
localhost:3000/api/products:1 Failed to load resource: 
the server responded with a status of 500
```

### Lỗi 2: CORS Error với ảnh
```
Access to fetch at 'file:///D:/DoAnChuyenNganh/images/...' 
has been blocked by CORS policy
```

---

## ✅ GIẢI PHÁP

### Bước 1: Kiểm tra Backend có chạy không

Mở terminal và chạy:
```bash
cd Goojodoq_Backend
node server.js
```

**Kết quả mong đợi:**
```
🚀 Server running on port 3000
```

**Nếu có lỗi:**
- Kiểm tra MySQL đang chạy
- Kiểm tra file `.env` có đúng thông tin
- Xem lỗi cụ thể trong terminal

---

### Bước 2: Kiểm tra Database Connection

Mở browser và test:
```
http://localhost:3000/test-db
```

**Kết quả mong đợi:**
```json
{
  "message": "Database connected!",
  "result": [{"total": 1}]
}
```

**Nếu lỗi:**
```bash
# Kiểm tra MySQL
# Windows: Mở Services → MySQL80 → Start
# Hoặc mở XAMPP → Start MySQL
```

---

### Bước 3: Kiểm tra Database có dữ liệu

Mở MySQL Workbench và chạy:
```sql
USE goojodoq_db;
SELECT * FROM products;
SELECT * FROM product_images;
```

**Kết quả mong đợi:**
- 3 sản phẩm trong bảng `products`
- 6 ảnh trong bảng `product_images`

**Nếu trống:**
```sql
-- Import file này
source database/insert_products_with_images.sql;

-- Hoặc copy-paste nội dung file và Execute
```

---

### Bước 4: Test API Products

Mở browser:
```
http://localhost:3000/api/products
```

**Kết quả mong đợi:**
```json
[
  {
    "product_id": 1,
    "product_name": "GOOJODOQ Tai nghe Bluetooth TWS Pro",
    "price": 599000,
    "sale_price": 499000,
    "image": "images/categories/J201-1.webp",
    ...
  },
  ...
]
```

**Nếu lỗi 500:**
- Xem log trong terminal backend
- Có thể do bảng `reviews` chưa có
- Tôi đã sửa code để không phụ thuộc vào bảng reviews

---

### Bước 5: Sửa lỗi đường dẫn ảnh

**Vấn đề:** Ảnh không load được vì đường dẫn `file://`

**Giải pháp:** Backend đã được cập nhật để serve ảnh

**Kiểm tra:**
```
http://localhost:3000/images/categories/J201-1.webp
```

Phải thấy ảnh hiển thị.

**Nếu không thấy:**
- Kiểm tra file ảnh có trong `frontend/images/categories/`
- Restart backend server

---

### Bước 6: Test với file mới

Mở file:
```
TEST_SIMPLE.html
```

Click các nút theo thứ tự:
1. **Test Backend** → Phải thấy ✅
2. **Lấy Sản Phẩm** → Phải thấy 3 sản phẩm

---

## 🔍 KIỂM TRA CHI TIẾT

### Kiểm tra 1: Backend Server
```bash
# Terminal
cd Goojodoq_Backend
node server.js

# Phải thấy:
# 🚀 Server running on port 3000
```

### Kiểm tra 2: Database Connection
```bash
# Browser
http://localhost:3000/test-db

# Phải thấy JSON response
```

### Kiểm tra 3: Products API
```bash
# Browser
http://localhost:3000/api/products

# Phải thấy array of products
```

### Kiểm tra 4: Images
```bash
# Browser
http://localhost:3000/images/categories/J201-1.webp

# Phải thấy ảnh
```

### Kiểm tra 5: Database Data
```sql
-- MySQL Workbench
USE goojodoq_db;
SELECT COUNT(*) FROM products;
-- Phải trả về: 3

SELECT COUNT(*) FROM product_images;
-- Phải trả về: 6
```

---

## 🛠️ SỬA LỖI CỤ THỂ

### Lỗi: "Cannot connect to MySQL"

**Giải pháp:**
```bash
# 1. Kiểm tra MySQL đang chạy
# Windows: Services → MySQL80 → Start

# 2. Kiểm tra .env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=your_password  # ← Đổi thành password thật
DB_NAME=goojodoq_db
DB_PORT=3306

# 3. Test connection
mysql -u root -p
# Nhập password và Enter
```

---

### Lỗi: "Table 'products' doesn't exist"

**Giải pháp:**
```sql
-- Mở MySQL Workbench
-- File > Open SQL Script
-- Chọn: database/goojodoq_database.sql
-- Execute (Ctrl + Shift + Enter)
```

---

### Lỗi: "No products found"

**Giải pháp:**
```sql
-- Mở MySQL Workbench
-- File > Open SQL Script
-- Chọn: database/insert_products_with_images.sql
-- Execute
```

---

### Lỗi: "Image not found"

**Giải pháp:**
```bash
# 1. Kiểm tra file ảnh có trong thư mục
ls frontend/images/categories/

# 2. Phải có các file:
# - J201-1.webp
# - AB4088-1.webp
# - GFS001-1.webp

# 3. Nếu không có, copy ảnh vào thư mục này

# 4. Restart backend
cd Goojodoq_Backend
# Ctrl+C để stop
node server.js  # Start lại
```

---

## 📋 CHECKLIST SỬA LỖI

- [ ] MySQL đang chạy
- [ ] Backend server đang chạy (port 3000)
- [ ] File .env có thông tin đúng
- [ ] Database `goojodoq_db` đã tạo
- [ ] Bảng `products` và `product_images` có dữ liệu
- [ ] File ảnh có trong `frontend/images/categories/`
- [ ] API `/test-db` trả về OK
- [ ] API `/api/products` trả về 3 sản phẩm
- [ ] Ảnh load được qua URL: `http://localhost:3000/images/...`

---

## 🎯 TEST CUỐI CÙNG

Sau khi sửa xong, test lại:

```bash
# 1. Mở TEST_SIMPLE.html
# 2. Click "Test Backend" → Phải thấy ✅
# 3. Click "Lấy Sản Phẩm" → Phải thấy 3 sản phẩm với ảnh
# 4. Mở frontend/index.html → Phải thấy 3 sản phẩm hiển thị
```

---

## 💡 GHI CHÚ

### Backend đã được cập nhật:
1. ✅ Không phụ thuộc vào bảng `reviews` nữa
2. ✅ Serve static files (ảnh) qua `/images`
3. ✅ Thêm error logging chi tiết

### Frontend không cần thay đổi:
- Code JavaScript đã đúng
- Chỉ cần backend chạy là OK

---

## 📞 NẾU VẪN LỖI

Hãy kiểm tra:

1. **Terminal backend** - Xem log lỗi cụ thể
2. **Browser Console (F12)** - Xem lỗi JavaScript
3. **MySQL Workbench** - Chạy query thủ công
4. **File .env** - Kiểm tra password đúng chưa

---

Chúc bạn sửa lỗi thành công! 🎉