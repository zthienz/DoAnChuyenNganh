# HƯỚNG DẪN HOÀN CHỈNH - HIỂN THỊ VÀ THÊM SẢN PHẨM

## 🎯 MỤC TIÊU
1. Hiển thị sản phẩm từ database trên trang index
2. Admin có thể thêm sản phẩm mới vào database
3. Sản phẩm mới tự động hiển thị sau khi thêm

---

## ✅ KIỂM TRA CHUẨN BỊ

### 1. Database đã có 3 sản phẩm
```sql
-- Kiểm tra trong MySQL
SELECT * FROM products;
SELECT * FROM product_images;
```

**Kết quả mong đợi:**
- 3 sản phẩm: Tai nghe TWS, Loa Mini, Quạt mini
- 6 ảnh sản phẩm (mỗi sản phẩm 2 ảnh)

### 2. Ảnh đã có trong thư mục
```
frontend/images/categories/
├── J201-1.webp          (Tai nghe)
├── AB4088-1.webp        (Loa)
└── GFS001-1.webp        (Quạt)
```

### 3. Backend đã cập nhật
- ✅ API GET `/api/products` - Lấy danh sách sản phẩm
- ✅ API POST `/api/products` - Thêm sản phẩm mới

---

## 🚀 BƯỚC THỰC HIỆN

### Bước 1: Khởi động Backend
```bash
cd Goojodoq_Backend
node server.js
```

**Kết quả:**
```
🚀 Server running on port 3000
```

### Bước 2: Test API
Mở browser và truy cập:
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
  {
    "product_id": 2,
    "product_name": "GOOJODOQ Loa Bluetooth Mini",
    ...
  },
  {
    "product_id": 3,
    "product_name": "GOOJODOQ Quạt mini cầm tay",
    ...
  }
]
```

### Bước 3: Mở trang Index
```
Mở file: frontend/index.html
```

**Kết quả:** Sẽ thấy 3 sản phẩm hiển thị trong phần "Sản phẩm nổi bật"

---

## 🎨 HIỂN THỊ SẢN PHẨM

### Code đã được cập nhật:

#### 1. HTML (index.html)
```html
<div class="row" id="productGrid">
    <!-- Products will be loaded here via JavaScript -->
</div>
```

#### 2. JavaScript (main.js)
```javascript
// Load sản phẩm từ API
async function loadFeaturedProducts() {
    const response = await fetch(`${API_BASE_URL}/products`);
    const products = await response.json();
    displayProducts(products.slice(0, 8)); // Hiển thị 8 sản phẩm
}

// Hiển thị sản phẩm
function displayProducts(products) {
    let html = products.map(product => `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="product-card">
                <img src="${product.image}" alt="${product.product_name}">
                <h5>${product.product_name}</h5>
                <p class="price">${formatPrice(product.sale_price || product.price)}</p>
                <button onclick="addToCart(...)">Đặt hàng</button>
            </div>
        </div>
    `).join('');
    
    // Thêm nút "Thêm sản phẩm" nếu là admin
    if (isAdminMode) {
        html += `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div class="product-card add-product-card" onclick="goToAddProduct()">
                    <i class="fas fa-plus-circle"></i>
                    <h5>Thêm sản phẩm mới</h5>
                </div>
            </div>
        `;
    }
    
    document.getElementById('productGrid').innerHTML = html;
}
```

---

## ➕ THÊM SẢN PHẨM MỚI (ADMIN)

### Quy trình hoàn chỉnh:

#### 1. Đăng nhập Admin
```
1. Mở: frontend/admin-login.html
2. Email: admin@goojodoq.com
3. Password: password
4. Click "Đăng nhập"
```

#### 2. Vào trang Index
```
1. Thấy nút "Admin Mode: ON" màu đỏ
2. Cuộn xuống "Sản phẩm nổi bật"
3. Thấy ô "Thêm sản phẩm mới" (màu tím)
```

#### 3. Click "Thêm sản phẩm mới"
```
→ Chuyển đến trang add-product.html
```

#### 4. Điền thông tin sản phẩm
```
✅ Upload ảnh chính (bắt buộc)
✅ Tên sản phẩm: "GOOJODOQ Cáp sạc Type-C"
✅ SKU: Tự động tạo hoặc nhập
✅ Danh mục: Chọn "Cáp sạc"
✅ Giá: 99000
✅ Giá KM: 79000
✅ Số lượng: 100
✅ Mô tả ngắn: "Cáp sạc Type-C chất lượng cao"
✅ Mô tả chi tiết: "..."
✅ Check: Kích hoạt, Nổi bật, Mới
```

#### 5. Click "Thêm sản phẩm"
```
→ Loading...
→ Gọi API POST /api/products
→ Lưu vào database
→ Success message
→ Tự động quay lại index.html
→ Sản phẩm mới xuất hiện trong danh sách
```

---

## 🔄 FLOW HOẠT ĐỘNG

### Hiển thị sản phẩm:
```
User mở index.html
    ↓
JavaScript: loadFeaturedProducts()
    ↓
Fetch: GET http://localhost:3000/api/products
    ↓
Backend: Query database
    ↓
Trả về: JSON array (3 sản phẩm)
    ↓
JavaScript: displayProducts()
    ↓
Render HTML với ảnh từ images/categories
    ↓
Hiển thị 3 sản phẩm + 1 ô "Thêm sản phẩm" (nếu admin)
```

### Thêm sản phẩm:
```
Admin click "Thêm sản phẩm"
    ↓
Mở add-product.html
    ↓
Admin điền form + upload ảnh
    ↓
Click "Thêm sản phẩm"
    ↓
JavaScript: submitProduct()
    ↓
Fetch: POST http://localhost:3000/api/products
    ↓
Backend: INSERT INTO products + product_images
    ↓
Trả về: {success: true, product_id: 4}
    ↓
JavaScript: showSuccessMessage()
    ↓
Redirect về index.html
    ↓
Load lại sản phẩm → Thấy sản phẩm mới
```

---

## 📝 CODE QUAN TRỌNG

### Backend API (productController.js)

#### GET - Lấy sản phẩm:
```javascript
export const getAllProducts = async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      p.product_id, 
      p.product_name,
      p.price, 
      p.sale_price,
      p.is_featured,
      p.is_new,
      (SELECT image_url FROM product_images 
       WHERE product_id = p.product_id AND is_primary = TRUE 
       LIMIT 1) AS image
    FROM products p
    WHERE p.is_active = TRUE
    ORDER BY p.created_at DESC
  `);
  res.json(rows);
};
```

#### POST - Thêm sản phẩm:
```javascript
export const createProduct = async (req, res) => {
  const { product_name, price, images, ... } = req.body;
  
  // Insert product
  const [result] = await pool.query(
    `INSERT INTO products (...) VALUES (...)`,
    [product_name, price, ...]
  );
  
  const productId = result.insertId;
  
  // Insert images
  await pool.query(
    `INSERT INTO product_images (product_id, image_url, is_primary) 
     VALUES (?, ?, TRUE)`,
    [productId, images.main]
  );
  
  res.json({ success: true, product_id: productId });
};
```

### Frontend JavaScript (add-product.js)

```javascript
async function saveProductToDatabase(productData) {
  const response = await fetch('http://localhost:3000/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });
  
  if (!response.ok) throw new Error('Failed to save');
  
  const result = await response.json();
  showSuccessMessage(productData);
}
```

---

## ✅ KIỂM TRA KẾT QUẢ

### Trang Index phải có:
- ✅ 3 sản phẩm từ database
- ✅ Ảnh hiển thị đúng (J201-1.webp, AB4088-1.webp, GFS001-1.webp)
- ✅ Tên, giá, giá KM hiển thị
- ✅ Badge "SALE", "MỚI"
- ✅ Nút "Đặt hàng", "Wishlist"
- ✅ Ô "Thêm sản phẩm" (nếu admin)

### Sau khi admin thêm sản phẩm:
- ✅ Sản phẩm lưu vào database
- ✅ Ảnh lưu vào product_images
- ✅ Tự động hiển thị trên index
- ✅ Không cần refresh thủ công

---

## 🔧 XỬ LÝ LỖI

### Lỗi 1: Không hiển thị sản phẩm
**Kiểm tra:**
```bash
# 1. Backend có chạy không?
curl http://localhost:3000/api/products

# 2. Database có dữ liệu không?
SELECT * FROM products WHERE is_active = TRUE;

# 3. Console có lỗi không?
F12 → Console tab
```

### Lỗi 2: Ảnh không hiển thị
**Kiểm tra:**
```bash
# 1. File ảnh có tồn tại không?
ls frontend/images/categories/

# 2. Đường dẫn trong DB đúng không?
SELECT image_url FROM product_images;

# 3. Tên file khớp không? (phân biệt hoa thường)
```

### Lỗi 3: Không thêm được sản phẩm
**Kiểm tra:**
```bash
# 1. Backend có nhận request không?
# Xem log trong terminal backend

# 2. Database có lỗi không?
# Xem error message trong response

# 3. CORS có lỗi không?
# Xem Console → Network tab
```

---

## 💡 LƯU Ý QUAN TRỌNG

### 1. Đường dẫn ảnh
- Ảnh trong database: `images/categories/J201-1.webp`
- File thực tế: `frontend/images/categories/J201-1.webp`
- Khi upload ảnh mới, cần lưu file vào thư mục này

### 2. Upload ảnh
- Hiện tại: Ảnh được convert sang base64 và lưu vào DB
- Tương lai: Nên upload file lên server và lưu đường dẫn

### 3. Admin mode
- Lưu trong localStorage: `isAdminMode = true`
- Thoát: Click nút "Admin Mode: ON"

### 4. Fallback
- Nếu API lỗi, sản phẩm sẽ lưu vào localStorage tạm thời
- Khi backend hoạt động lại, cần import thủ công

---

## 🎯 CHECKLIST HOÀN THÀNH

- [ ] Backend đang chạy (port 3000)
- [ ] Database có 3 sản phẩm
- [ ] Ảnh có trong thư mục images/categories
- [ ] API GET /api/products trả về dữ liệu
- [ ] API POST /api/products hoạt động
- [ ] Trang index hiển thị 3 sản phẩm
- [ ] Ảnh hiển thị đúng
- [ ] Admin có thể đăng nhập
- [ ] Ô "Thêm sản phẩm" xuất hiện khi admin
- [ ] Admin có thể thêm sản phẩm mới
- [ ] Sản phẩm mới lưu vào database
- [ ] Sản phẩm mới hiển thị trên index

---

## 🚀 DEMO NHANH

```bash
# Terminal 1: Start Backend
cd Goojodoq_Backend
node server.js

# Terminal 2: Test API
curl http://localhost:3000/api/products

# Browser: Mở trang
frontend/index.html

# Kết quả: Thấy 3 sản phẩm hiển thị
```

---

Chúc bạn thành công! 🎉