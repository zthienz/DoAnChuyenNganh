# HƯỚNG DẪN CHẠY WEBSITE GOOJODOQ

## 📋 LÝ DO SẢN PHẨM KHÔNG HIỂN THỊ

### 1. **Backend server chưa chạy**
   - Server Node.js cần được khởi động để API hoạt động
   
### 2. **Database chưa có dữ liệu**
   - Bảng `products` trong database đang trống
   - Cần import dữ liệu mẫu

### 3. **CORS hoặc kết nối API**
   - Frontend không thể kết nối đến backend

---

## 🚀 CÁCH KHẮC PHỤC

### Bước 1: Import dữ liệu mẫu vào Database

Mở MySQL Workbench hoặc command line và chạy:

```sql
-- Import file này
source database/insert_sample_products.sql;

-- Hoặc copy-paste nội dung file vào MySQL Workbench và Execute
```

### Bước 2: Khởi động Backend Server

```bash
cd Goojodoq_Backend
node server.js
```

Bạn sẽ thấy: `🚀 Server running on port 3000`

### Bước 3: Mở Frontend

Mở file `frontend/index.html` trong trình duyệt hoặc sử dụng Live Server.

---

## ✅ KIỂM TRA

### Test Backend API:
Mở trình duyệt và truy cập:
```
http://localhost:3000/api/products
```

Bạn sẽ thấy JSON data của sản phẩm.

### Test Frontend:
1. Mở `frontend/index.html`
2. Kiểm tra phần "Sản phẩm nổi bật" - sẽ hiển thị 8 sản phẩm
3. Mở `frontend/shop.html` - sẽ hiển thị tất cả sản phẩm với bộ lọc

---

## 📁 CẤU TRÚC DỰ ÁN

```
├── database/
│   ├── goojodoq_database.sql          # Schema database
│   ├── insert_sample_products.sql     # Dữ liệu mẫu sản phẩm
│   └── add_admin_examples.sql         # Tạo admin
│
├── Goojodoq_Backend/
│   ├── server.js                      # Server chính
│   ├── config/db.js                   # Kết nối database
│   ├── routes/productRoutes.js        # Routes sản phẩm
│   ├── controllers/productController.js
│   └── .env                           # Cấu hình database
│
└── frontend/
    ├── index.html                     # Trang chủ với slideshow
    ├── shop.html                      # Trang shop với filter
    ├── css/
    │   ├── style.css                  # CSS chung
    │   └── shop.css                   # CSS trang shop
    ├── js/
    │   ├── main.js                    # JS chung + slideshow
    │   └── shop.js                    # JS trang shop
    └── images/
        ├── hero/                      # Ảnh slideshow
        └── products/                  # Ảnh sản phẩm
```

---

## 🎯 TÍNH NĂNG ĐÃ HOÀN THÀNH

### ✅ Trang Index (index.html)
- Hero slideshow với 4 slides (3 ảnh + 1 video)
- Tự động chuyển sau 7 giây
- Không tự chuyển khi video đang phát
- Nút điều khiển trái/phải
- Indicators để jump đến slide
- Nút Play/Pause
- Keyboard support (Arrow keys, Spacebar)
- Touch/Swipe support cho mobile
- Hiển thị 8 sản phẩm nổi bật
- Danh mục sản phẩm
- Newsletter subscription

### ✅ Trang Shop (shop.html)
- Hiển thị tất cả sản phẩm
- Sidebar filter:
  - Tìm kiếm theo tên
  - Lọc theo danh mục
  - Lọc theo khoảng giá
  - Lọc theo trạng thái (Sale, Mới, Bán chạy)
- Sắp xếp sản phẩm:
  - Tên A-Z, Z-A
  - Giá thấp đến cao, cao đến thấp
  - Mới nhất
- Pagination (12 sản phẩm/trang)
- Responsive design
- Loading states
- Empty states

---

## 🔧 CẤU HÌNH

### File .env (Goojodoq_Backend/.env)
```
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=your_password
DB_NAME=goojodoq_db
DB_PORT=3306
PORT=3000
```

### API Endpoint
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

---

## 📝 GHI CHÚ

1. **Ảnh slideshow**: Thay thế các file trong `frontend/images/hero/` bằng ảnh thật
2. **Ảnh sản phẩm**: Thêm ảnh vào `frontend/images/products/`
3. **Video**: Thêm file `hero-video.mp4` vào `frontend/images/hero/`
4. **Logo**: Thêm logo vào `frontend/images/logo.png`

---

## 🐛 TROUBLESHOOTING

### Sản phẩm vẫn không hiển thị?
1. Kiểm tra Console (F12) xem có lỗi gì
2. Kiểm tra Network tab xem API có được gọi không
3. Kiểm tra backend server có đang chạy không
4. Kiểm tra database có dữ liệu không

### CORS Error?
Backend đã cấu hình CORS, nhưng nếu vẫn lỗi:
```javascript
// Trong server.js
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
```

### Database connection error?
Kiểm tra file `.env` và đảm bảo MySQL đang chạy.

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, hãy kiểm tra:
1. MySQL service đang chạy
2. Node.js đã cài đặt (version 14+)
3. Tất cả dependencies đã install: `npm install`
4. Database đã được tạo và import schema
5. Dữ liệu mẫu đã được insert