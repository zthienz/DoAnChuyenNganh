# HƯỚNG DẪN HIỂN THỊ SẢN PHẨM TRÊN TRANG INDEX

## 🎯 MỤC TIÊU
Hiển thị 8 sản phẩm nổi bật trên trang chủ với ảnh từ thư mục `frontend/images/categories`

---

## 📋 CHUẨN BỊ

### 1. Kiểm tra cấu trúc thư mục ảnh
```
frontend/images/categories/
├── tai-nghe-1.jpg
├── tai-nghe-2.jpg
├── tai-nghe-3.jpg
├── loa-mini.jpg
├── loa-mini-2.jpg
├── sac-du-phong.jpg
├── sac-du-phong-2.jpg
├── cap-sac.jpg
├── cap-sac-2.jpg
├── quat-mini.jpg
├── quat-mini-2.jpg
├── tai-nghe-gaming.jpg
├── tai-nghe-gaming-2.jpg
├── loa-outdoor.jpg
├── loa-outdoor-2.jpg
├── sac-20k.jpg
└── sac-20k-2.jpg
```

### 2. Đảm bảo MySQL đang chạy
- Mở MySQL Workbench hoặc XAMPP
- Kiểm tra service MySQL đang running

---

## 🚀 BƯỚC THỰC HIỆN

### Bước 1: Import Database Schema (Nếu chưa có)
```sql
-- Mở MySQL Workbench
-- File > Open SQL Script
-- Chọn: database/goojodoq_database.sql
-- Execute (Ctrl + Shift + Enter)
```

### Bước 2: Import Dữ liệu Sản phẩm
```sql
-- Mở MySQL Workbench
-- File > Open SQL Script
-- Chọn: database/insert_products_with_images.sql
-- Execute (Ctrl + Shift + Enter)
```

**Kết quả mong đợi:**
```
Products inserted successfully!
total_products: 8
total_images: 16
```

### Bước 3: Kiểm tra dữ liệu đã import
```sql
-- Chạy query này để xem sản phẩm
SELECT 
    p.product_id,
    p.product_name,
    p.price,
    p.sale_price,
    pi.image_url
FROM products p
LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = TRUE
WHERE p.is_featured = TRUE;
```

**Kết quả:** Sẽ thấy 8 sản phẩm với đường dẫn ảnh

### Bước 4: Khởi động Backend Server
```bash
cd Goojodoq_Backend
node server.js
```

**Kết quả mong đợi:**
```
🚀 Server running on port 3000
```

### Bước 5: Test API
Mở browser và truy cập:
```
http://localhost:3000/api/products
```

**Kết quả:** Sẽ thấy JSON data của 8 sản phẩm với thông tin đầy đủ

### Bước 6: Mở trang Index
```
Mở file: frontend/index.html
```

**Kết quả:** Sẽ thấy 8 sản phẩm hiển thị trong phần "Sản phẩm nổi bật"

---

## ✅ KIỂM TRA KẾT QUẢ

### Trang Index phải hiển thị:
- ✅ 8 sản phẩm trong grid
- ✅ Ảnh sản phẩm từ thư mục `images/categories`
- ✅ Tên sản phẩm
- ✅ Giá gốc và giá khuyến mãi
- ✅ Badge "SALE" nếu có giảm giá
- ✅ Badge "MỚI" nếu là sản phẩm mới
- ✅ Nút "Đặt hàng" và "Wishlist"
- ✅ Ô "Thêm sản phẩm" nếu đăng nhập admin

---

## 🔧 XỬ LÝ LỖI

### Lỗi 1: "Không thể tải sản phẩm"
**Nguyên nhân:** Backend chưa chạy hoặc database chưa có dữ liệu

**Giải pháp:**
1. Kiểm tra backend đang chạy: `http://localhost:3000/api/products`
2. Kiểm tra database có dữ liệu:
```sql
SELECT COUNT(*) FROM products WHERE is_featured = TRUE;
```
3. Nếu = 0, chạy lại file `insert_products_with_images.sql`

### Lỗi 2: Ảnh không hiển thị (icon broken image)
**Nguyên nhân:** File ảnh không tồn tại hoặc đường dẫn sai

**Giải pháp:**
1. Kiểm tra file ảnh có trong `frontend/images/categories/`
2. Kiểm tra tên file khớp với database:
```sql
SELECT image_url FROM product_images WHERE is_primary = TRUE;
```
3. Đảm bảo tên file chính xác (phân biệt hoa thường)

### Lỗi 3: CORS Error
**Nguyên nhân:** Frontend không thể gọi API từ backend

**Giải pháp:**
Backend đã cấu hình CORS, nhưng nếu vẫn lỗi:
```javascript
// Trong Goojodoq_Backend/server.js
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
```

### Lỗi 4: "Không có sản phẩm nào để hiển thị"
**Nguyên nhân:** API trả về mảng rỗng

**Giải pháp:**
1. Kiểm tra products có `is_active = TRUE` và `is_featured = TRUE`
```sql
UPDATE products SET is_active = TRUE, is_featured = TRUE;
```
2. Restart backend server

---

## 📝 CẤU TRÚC DỮ LIỆU

### Bảng Products
```sql
product_id | product_name | price | sale_price | is_featured | is_active
-----------|--------------|-------|------------|-------------|----------
1          | Tai nghe TWS | 599000| 499000     | TRUE        | TRUE
2          | Loa Mini     | 399000| 299000     | TRUE        | TRUE
...
```

### Bảng Product_Images
```sql
image_id | product_id | image_url                    | is_primary
---------|------------|------------------------------|------------
1        | 1          | images/categories/tai-nghe-1.jpg | TRUE
2        | 1          | images/categories/tai-nghe-2.jpg | FALSE
...
```

---

## 🎨 TÙY CHỈNH

### Thay đổi số lượng sản phẩm hiển thị
Trong `frontend/js/main.js`:
```javascript
// Dòng này
displayProducts(products.slice(0, 8)); // Hiện 8 sản phẩm

// Đổi thành
displayProducts(products.slice(0, 12)); // Hiện 12 sản phẩm
```

### Thay đổi điều kiện lọc sản phẩm
Trong `Goojodoq_Backend/controllers/productController.js`:
```javascript
// Thêm điều kiện
WHERE p.is_active = TRUE AND p.is_featured = TRUE
```

### Sắp xếp sản phẩm
```javascript
// Sắp xếp theo giá
ORDER BY p.price ASC

// Sắp xếp theo tên
ORDER BY p.product_name ASC

// Sắp xếp theo mới nhất
ORDER BY p.created_at DESC
```

---

## 🔄 FLOW HOẠT ĐỘNG

```
1. User mở index.html
   ↓
2. JavaScript gọi loadFeaturedProducts()
   ↓
3. Fetch API: http://localhost:3000/api/products
   ↓
4. Backend query database
   ↓
5. Trả về JSON data (8 sản phẩm)
   ↓
6. JavaScript render HTML
   ↓
7. Hiển thị sản phẩm với ảnh từ images/categories
```

---

## 📞 CHECKLIST HOÀN THÀNH

- [ ] MySQL đang chạy
- [ ] Database `goojodoq_db` đã tạo
- [ ] Bảng `products` và `product_images` có dữ liệu
- [ ] File ảnh có trong `frontend/images/categories/`
- [ ] Backend server đang chạy (port 3000)
- [ ] API `/api/products` trả về dữ liệu
- [ ] Trang index.html hiển thị sản phẩm
- [ ] Ảnh sản phẩm hiển thị đúng
- [ ] Giá và thông tin hiển thị chính xác

---

## 🎉 KẾT QUẢ MONG ĐỢI

Sau khi hoàn thành các bước trên, trang index.html sẽ hiển thị:

```
┌─────────────────────────────────────────────┐
│         Sản phẩm nổi bật                    │
├─────────────────────────────────────────────┤
│  [Ảnh]  [Ảnh]  [Ảnh]  [Ảnh]                │
│  Tai    Loa    Sạc    Cáp                   │
│  nghe   Mini   dự     sạc                   │
│  TWS          phòng                         │
│  499K   299K   350K   79K                   │
│  [Đặt]  [Đặt]  [Đặt]  [Đặt]                │
│                                             │
│  [Ảnh]  [Ảnh]  [Ảnh]  [Ảnh]                │
│  Quạt   Tai    Loa    Sạc                   │
│  mini   nghe   Out    20K                   │
│         Game   door                         │
│  149K   699K   799K   550K                  │
│  [Đặt]  [Đặt]  [Đặt]  [Đặt]                │
└─────────────────────────────────────────────┘
```

---

## 💡 LƯU Ý QUAN TRỌNG

1. **Đường dẫn ảnh:** Đảm bảo đường dẫn trong database khớp với file thực tế
2. **Tên file:** Phân biệt hoa thường (Linux/Mac)
3. **Backend phải chạy:** Không có backend = không có dữ liệu
4. **CORS:** Đã được cấu hình sẵn trong backend
5. **LocalStorage:** Sản phẩm admin thêm sẽ merge với sản phẩm từ database

---

## 🚀 NÂNG CAO

### Thêm lazy loading cho ảnh
```javascript
<img src="${product.image}" loading="lazy" alt="${product.product_name}">
```

### Thêm placeholder khi ảnh chưa load
```javascript
<img src="${product.image}" 
     onerror="this.src='images/placeholder.jpg'" 
     alt="${product.product_name}">
```

### Cache dữ liệu sản phẩm
```javascript
// Lưu vào localStorage
localStorage.setItem('cachedProducts', JSON.stringify(products));

// Lấy từ cache
const cached = JSON.parse(localStorage.getItem('cachedProducts'));
```

---

Chúc bạn thành công! 🎉