# TÀI LIỆU HỆ THỐNG GOOJODOQ
## Cửa hàng phụ kiện điện tử trực tuyến

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1 Mô tả dự án
GOOJODOQ là hệ thống thương mại điện tử chuyên bán phụ kiện điện tử như quạt mini, loa Bluetooth, tai nghe và các phụ kiện điện thoại. Hệ thống được xây dựng với kiến trúc Client-Server, sử dụng công nghệ web hiện đại.

### 1.2 Công nghệ sử dụng
- **Frontend**: HTML5, CSS3, JavaScript ES6+, Bootstrap 5
- **Backend**: Node.js, Express.js
- **Database**: MySQL 8.0
- **Authentication**: bcrypt cho mã hóa mật khẩu
- **Payment Gateway**: PayOS SDK (@payos/node)
- **API**: RESTful API
- **Other Libraries**: CORS, dotenv, mysql2, node-fetch

### 1.3 Cấu trúc dự án
```
GOOJODOQ/
├── Goojodoq_Backend/           # Backend API Server
│   ├── config/                 # Database configuration
│   ├── controllers/            # API Controllers
│   ├── routes/                 # API Routes
│   ├── migrations/             # Database migrations
│   ├── scripts/                # Utility scripts
│   ├── server.js              # Main server file
│   ├── package.json           # Dependencies
│   └── .env                   # Environment variables
├── Goojodoq_Frontend/         # Frontend Web Application
│   ├── css/                   # Stylesheets
│   ├── js/                    # JavaScript files
│   ├── images/                # Static images
│   ├── components/            # Reusable components
│   ├── index.html             # Homepage
│   ├── shop.html              # Product listing
│   ├── cart.html              # Shopping cart
│   ├── checkout.html          # Checkout process
│   ├── admin-*.html           # Admin pages
│   └── ...                    # Other pages
├── goojodoq_db.sql           # Complete database schema
└── GOOJODOQ_System_Documentation.md # This documentation
```

---

## 2. CẤU TRÚC CƠ SỞ DỮ LIỆU

### 2.1 Sơ đồ quan hệ các bảng
```
nguoidung (1) -----> (n) diachi
    |                     |
    |                     |
    v                     v
giohang (1) -----> (n) donhang
    |                     |
    v                     v
chitiet_giohang      chitiet_donhang
    |                     |
    v                     v
sanpham <-----------> anh_sanpham
    |                     |
    v                     v
danhmuc              danhgia_sanpham
    |                     |
    v                     v
product_sections     traloi_danhgia
    |
    v
product_section_items
```

### 2.2 Danh sách các bảng chính

#### **BẢNG NGƯỜI DÙNG VÀ QUYỀN**
1. **nguoidung** - Thông tin người dùng và admin
2. **diachi** - Địa chỉ giao hàng của người dùng

#### **BẢNG SẢN PHẨM**
3. **danhmuc** - Danh mục sản phẩm
4. **sanpham** - Thông tin sản phẩm
5. **anh_sanpham** - Hình ảnh sản phẩm
6. **product_sections** - Quản lý section hiển thị (sale, featured, all)
7. **product_section_items** - Sản phẩm trong từng section

#### **BẢNG GIỎ HÀNG VÀ ĐƠN HÀNG**
8. **giohang** - Giỏ hàng của người dùng
9. **chitiet_giohang** - Chi tiết sản phẩm trong giỏ hàng
10. **donhang** - Thông tin đơn hàng
11. **chitiet_donhang** - Chi tiết sản phẩm trong đơn hàng

#### **BẢNG THANH TOÁN**
12. **payment_transactions** - Giao dịch thanh toán PayOS

#### **BẢNG KHUYẾN MÃI**
13. **magiamgia** - Mã giảm giá/voucher
14. **voucher_sudung** - Lịch sử sử dụng voucher

#### **BẢNG TƯƠNG TÁC NGƯỜI DÙNG**
15. **yeuthich** - Danh sách yêu thích
16. **danhgia_sanpham** - Đánh giá sản phẩm
17. **traloi_danhgia** - Trả lời đánh giá từ admin

#### **BẢNG HỖ TRỢ VÀ QUẢN LÝ**
18. **yeucau_hotro** - Yêu cầu hỗ trợ khách hàng
19. **activity_log** - Nhật ký hoạt động hệ thống

---

## 3. KIẾN TRÚC HỆ THỐNG

### 3.1 Sơ đồ tổng quan
```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐    MySQL    ┌─────────────────┐
│                 │ ◄──────────────► │                 │ ◄─────────► │                 │
│   FRONTEND      │                  │    BACKEND      │             │    DATABASE     │
│   (Client)      │                  │   (Server)      │             │    (MySQL)      │
│                 │                  │                 │             │                 │
│ - HTML/CSS/JS   │                  │ - Node.js       │             │ - goojodoq_db   │
│ - Bootstrap     │                  │ - Express.js    │             │ - 19 Tables     │
│ - Responsive    │                  │ - RESTful API   │             │ - Relationships │
└─────────────────┘                  └─────────────────┘             └─────────────────┘
                                              │
                                              │ PayOS API
                                              ▼
                                    ┌─────────────────┐
                                    │   PAYOS         │
                                    │   PAYMENT       │
                                    │   GATEWAY       │
                                    └─────────────────┘
```

### 3.2 Luồng dữ liệu chính
```
USER REGISTRATION/LOGIN
┌─────────────┐    POST /api/auth/register    ┌─────────────┐    INSERT    ┌─────────────┐
│   Client    │ ──────────────────────────► │   Server    │ ──────────► │  Database   │
│             │ ◄────────────────────────── │             │ ◄────────── │             │
└─────────────┘    JWT Token Response       └─────────────┘    User Data  └─────────────┘

PRODUCT BROWSING
┌─────────────┐    GET /api/products         ┌─────────────┐    SELECT    ┌─────────────┐
│   Client    │ ──────────────────────────► │   Server    │ ──────────► │  Database   │
│             │ ◄────────────────────────── │             │ ◄────────── │             │
└─────────────┘    Product List JSON        └─────────────┘   Products   └─────────────┘

ORDER PROCESSING
┌─────────────┐    POST /api/orders          ┌─────────────┐    INSERT    ┌─────────────┐
│   Client    │ ──────────────────────────► │   Server    │ ──────────► │  Database   │
│             │                             │             │             │             │
│             │    PayOS Payment Link       │             │    PayOS     │             │
│             │ ◄────────────────────────── │             │ ──────────► │   PayOS     │
└─────────────┘                             └─────────────┘             └─────────────┘
```

---

## 4. CHỨC NĂNG HỆ THỐNG

### 4.1 Chức năng người dùng (Customer)

#### **4.1.1 Quản lý tài khoản**
- **Đăng ký**: Tạo tài khoản mới với email, mật khẩu
- **Đăng nhập**: Xác thực bằng email/password
- **Quản lý thông tin**: Cập nhật họ tên, số điện thoại
- **Quản lý địa chỉ**: Thêm/sửa/xóa địa chỉ giao hàng

#### **4.1.2 Mua sắm**
- **Xem sản phẩm**: Duyệt danh mục, tìm kiếm, xem chi tiết
- **Giỏ hàng**: Thêm/xóa/cập nhật số lượng sản phẩm
- **Danh sách yêu thích**: Lưu sản phẩm quan tâm
- **So sánh sản phẩm**: Xem thông tin nhiều sản phẩm

#### **4.1.3 Đặt hàng và thanh toán**
- **Checkout**: Xác nhận đơn hàng, chọn địa chỉ giao hàng
- **Thanh toán COD**: Thanh toán khi nhận hàng
- **Thanh toán PayOS**: Chuyển khoản qua cổng thanh toán
- **Áp dụng voucher**: Sử dụng mã giảm giá

#### **4.1.4 Quản lý đơn hàng**
- **Xem đơn hàng**: Danh sách và chi tiết đơn hàng
- **Theo dõi trạng thái**: Chờ xác nhận → Đang giao → Hoàn thành
- **Hủy đơn hàng**: Hủy khi chờ xác nhận
- **Xác nhận nhận hàng**: Xác nhận đã nhận được hàng

#### **4.1.5 Đánh giá và phản hồi**
- **Đánh giá sản phẩm**: Cho điểm và viết nhận xét
- **Xem đánh giá**: Đọc đánh giá của người khác
- **Hỗ trợ khách hàng**: Gửi yêu cầu hỗ trợ

### 4.2 Chức năng quản trị (Admin)

#### **4.2.1 Dashboard và thống kê**
- **Tổng quan**: Doanh thu, đơn hàng, người dùng, sản phẩm
- **Biểu đồ doanh thu**: Theo ngày, tháng, năm
- **Thống kê đơn hàng**: Theo trạng thái, phương thức thanh toán
- **Hoạt động gần đây**: Nhật ký hệ thống

#### **4.2.2 Quản lý sản phẩm**
- **CRUD sản phẩm**: Thêm/sửa/xóa/ẩn sản phẩm
- **Quản lý danh mục**: Tạo và sắp xếp danh mục
- **Upload hình ảnh**: Thêm nhiều ảnh cho sản phẩm
- **Quản lý tồn kho**: Cập nhật số lượng tồn kho
- **Product Sections**: Quản lý sản phẩm sale, featured

#### **4.2.3 Quản lý đơn hàng**
- **Xem tất cả đơn hàng**: Lọc theo trạng thái, ngày tháng
- **Xác nhận đơn hàng**: Chuyển từ "Chờ xác nhận" → "Đang giao"
- **Cập nhật trạng thái**: Theo dõi quá trình giao hàng
- **Hủy đơn hàng**: Hủy đơn và hoàn tồn kho
- **In hóa đơn**: Xuất hóa đơn PDF

#### **4.2.4 Quản lý người dùng**
- **Danh sách người dùng**: Xem thông tin tất cả user
- **Khóa/mở khóa tài khoản**: Quản lý trạng thái tài khoản
- **Xem lịch sử mua hàng**: Chi tiết đơn hàng của từng user
- **Phân quyền**: Gán quyền admin cho user

#### **4.2.5 Quản lý khuyến mãi**
- **Tạo voucher**: Mã giảm giá theo % hoặc số tiền cố định
- **Cài đặt điều kiện**: Đơn hàng tối thiểu, thời hạn sử dụng
- **Giới hạn sử dụng**: Số lần sử dụng tối đa
- **Theo dõi sử dụng**: Xem ai đã dùng voucher nào

#### **4.2.6 Hỗ trợ khách hàng**
- **Ticket system**: Nhận và xử lý yêu cầu hỗ trợ
- **Trả lời đánh giá**: Phản hồi đánh giá sản phẩm
- **Quản lý trạng thái**: Pending → Processing → Resolved

---

## 5. LUỒNG HOẠT ĐỘNG CHI TIẾT

### 5.1 Quy trình đăng ký và đăng nhập

#### **Đăng ký người dùng mới**
```
1. User nhập thông tin (email, password, họ tên, SĐT)
2. Frontend validate dữ liệu
3. POST /api/auth/register
4. Backend kiểm tra email đã tồn tại chưa
5. Mã hóa password bằng bcrypt
6. INSERT vào bảng nguoidung
7. Trả về thông tin user (không có password)
8. Frontend chuyển đến trang đăng nhập
```

#### **Đăng nhập**
```
1. User nhập email/password
2. POST /api/auth/login
3. Backend tìm user theo email
4. Kiểm tra password bằng bcrypt.compare()
5. Kiểm tra trạng thái tài khoản (có bị khóa không)
6. Trả về thông tin user
7. Frontend lưu user info vào localStorage/sessionStorage
8. Chuyển đến trang chủ hoặc trang trước đó
```

### 5.2 Quy trình mua hàng

#### **Thêm sản phẩm vào giỏ hàng**
```
1. User click "Thêm vào giỏ hàng"
2. Kiểm tra đăng nhập
3. POST /api/cart/add với {userId, productId, quantity, price}
4. Backend tìm/tạo giỏ hàng cho user
5. Kiểm tra sản phẩm đã có trong giỏ chưa
6. Nếu có: UPDATE số lượng
7. Nếu chưa: INSERT mới vào chitiet_giohang
8. Trả về thông tin giỏ hàng mới
9. Frontend cập nhật UI và badge số lượng
```

#### **Quy trình checkout**
```
1. User chọn sản phẩm trong giỏ hàng
2. Click "Thanh toán"
3. Chuyển đến trang checkout
4. Hiển thị sản phẩm đã chọn và địa chỉ giao hàng
5. User chọn phương thức thanh toán (COD/PayOS)
6. Nhập mã voucher (nếu có)
7. Xác nhận đặt hàng
```

#### **Xử lý đơn hàng**
```
1. POST /api/orders với thông tin đơn hàng
2. Backend tạo mã đơn hàng (DH + timestamp)
3. INSERT vào bảng donhang
4. INSERT chi tiết sản phẩm vào chitiet_donhang
5. UPDATE tồn kho sản phẩm (giảm số lượng)
6. Xử lý voucher (nếu có):
   - Giảm số lượng sử dụng
   - INSERT vào voucher_sudung
7. Xóa sản phẩm đã đặt khỏi giỏ hàng
8. Trả về orderId và orderCode
```

#### **Thanh toán PayOS**
```
1. Nếu chọn PayOS, gọi POST /api/payment/create
2. Backend tạo orderCode unique
3. Gọi PayOS API để tạo payment link
4. INSERT vào payment_transactions với status 'pending'
5. Trả về paymentUrl cho frontend
6. User được chuyển đến trang PayOS
7. Sau khi thanh toán, PayOS redirect về payment-success.html
8. Webhook từ PayOS cập nhật trạng thái thanh toán
9. UPDATE donhang.trangthai = 'cho_xacnhan'
```

### 5.3 Quy trình quản lý đơn hàng (Admin)

#### **Xác nhận đơn hàng**
```
1. Admin vào trang quản lý đơn hàng
2. Xem danh sách đơn hàng có trạng thái 'cho_xacnhan'
3. Click "Xác nhận" trên đơn hàng
4. PUT /api/orders/{orderId}/confirm
5. Backend UPDATE donhang.trangthai = 'dang_giao'
6. Ghi log vào activity_log
7. Frontend cập nhật trạng thái hiển thị
```

#### **Hủy đơn hàng**
```
1. Admin/User click "Hủy đơn hàng"
2. Kiểm tra điều kiện hủy (chỉ khi 'cho_xacnhan')
3. POST /api/orders/{orderId}/cancel
4. Backend UPDATE donhang.trangthai = 'huy'
5. Hoàn lại tồn kho:
   - Lấy danh sách sản phẩm từ chitiet_donhang
   - UPDATE sanpham.tonkho += soluong
6. Hoàn lại voucher (nếu có)
7. Ghi log hoạt động
```

### 5.4 Quy trình đánh giá sản phẩm

#### **Tạo đánh giá**
```
1. User vào trang "Đơn hàng của tôi"
2. Click "Đánh giá" trên đơn hàng đã hoàn thành
3. Chọn sản phẩm và cho điểm sao (0-5)
4. Viết nhận xét
5. POST /api/reviews với {orderId, productId, rating, content}
6. Backend kiểm tra:
   - Đơn hàng đã hoàn thành chưa
   - User có quyền đánh giá không
   - Sản phẩm có trong đơn hàng không
7. INSERT/UPDATE vào danhgia_sanpham
8. Trả về kết quả thành công
```

#### **Admin trả lời đánh giá**
```
1. Admin xem danh sách đánh giá sản phẩm
2. Click "Trả lời" trên đánh giá
3. Viết nội dung trả lời
4. POST /api/reviews/{reviewId}/reply
5. Backend kiểm tra quyền admin
6. INSERT/UPDATE vào traloi_danhgia
7. Frontend hiển thị trả lời dưới đánh giá
```

---

## 6. API ENDPOINTS

### 6.1 Authentication APIs
```
POST   /api/auth/register     - Đăng ký người dùng mới
POST   /api/auth/login        - Đăng nhập
GET    /api/auth/users        - Lấy danh sách người dùng (Admin)
PUT    /api/auth/users/:id    - Cập nhật thông tin người dùng
```

### 6.2 Product APIs
```
GET    /api/products          - Lấy danh sách sản phẩm
GET    /api/products/:id      - Lấy chi tiết sản phẩm
POST   /api/products          - Tạo sản phẩm mới (Admin)
PUT    /api/products/:id      - Cập nhật sản phẩm (Admin)
DELETE /api/products/:id      - Xóa sản phẩm (Admin)
GET    /api/categories        - Lấy danh sách danh mục
GET    /api/sections/:code    - Lấy sản phẩm theo section
```

### 6.3 Cart APIs
```
GET    /api/cart/:userId      - Lấy giỏ hàng của user
POST   /api/cart/add          - Thêm sản phẩm vào giỏ hàng
PUT    /api/cart/update       - Cập nhật số lượng sản phẩm
DELETE /api/cart/remove       - Xóa sản phẩm khỏi giỏ hàng
```

### 6.4 Order APIs
```
POST   /api/orders            - Tạo đơn hàng mới
GET    /api/orders            - Lấy danh sách đơn hàng
GET    /api/orders/:id        - Lấy chi tiết đơn hàng
PUT    /api/orders/:id/confirm - Xác nhận đơn hàng (Admin)
PUT    /api/orders/:id/cancel  - Hủy đơn hàng
PUT    /api/orders/:id/complete - Hoàn thành đơn hàng
```

### 6.5 Payment APIs
```
POST   /api/payment/create    - Tạo link thanh toán PayOS
POST   /api/payment/webhook   - Webhook từ PayOS
GET    /api/payment/status/:code - Kiểm tra trạng thái thanh toán
```

### 6.6 Other APIs
```
GET    /api/wishlist/:userId  - Danh sách yêu thích
POST   /api/wishlist/add      - Thêm vào yêu thích
GET    /api/vouchers          - Danh sách voucher khả dụng
POST   /api/vouchers/check    - Kiểm tra mã giảm giá
GET    /api/reviews/:productId - Đánh giá sản phẩm
POST   /api/reviews           - Tạo đánh giá
POST   /api/support           - Gửi yêu cầu hỗ trợ
```

---

## 7. BẢO MẬT VÀ XÁC THỰC

### 7.1 Mã hóa mật khẩu
- Sử dụng bcrypt với salt rounds = 10
- Không lưu trữ mật khẩu dạng plain text
- Hash password trước khi lưu vào database

### 7.2 Phân quyền
- **nguoidung**: Quyền cơ bản (mua hàng, đánh giá)
- **admin**: Toàn quyền quản lý hệ thống

### 7.3 Validation
- Frontend: Validate form trước khi submit
- Backend: Validate tất cả input từ client
- Database: Constraints và foreign keys

### 7.4 Bảo mật thanh toán
- Tích hợp PayOS SDK chính thức
- Không lưu trữ thông tin thẻ tín dụng
- Sử dụng HTTPS cho tất cả giao dịch

---

## 8. TRIỂN KHAI VÀ VẬN HÀNH

### 8.1 Yêu cầu hệ thống
- **Server**: Node.js 16+, MySQL 8.0+
- **Client**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Network**: HTTPS, Port 3000 (Backend), Port 8080 (Frontend)

### 8.2 Cài đặt và chạy
```bash
# Backend
cd Goojodoq_Backend
npm install
npm start

# Frontend
cd Goojodoq_Frontend
npm install
node server.js
```

### 8.3 Cấu hình môi trường
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=goojodoq_db

# PayOS
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key
```

### 8.4 Backup và bảo trì
- Backup database hàng ngày
- Monitor logs và performance
- Cập nhật security patches định kỳ

---

## 9. TÍNH NĂNG NÂNG CAO

### 9.1 Activity Log
- Ghi lại tất cả hoạt động quan trọng
- Theo dõi thay đổi sản phẩm, đơn hàng
- Hỗ trợ audit và debugging

### 9.2 Product Sections
- Quản lý sản phẩm theo section (sale, featured)
- Tùy chỉnh giá và mô tả cho từng section
- Sắp xếp thứ tự hiển thị

### 9.3 Review System
- Đánh giá sao và nhận xét
- Admin có thể trả lời đánh giá
- Thống kê điểm đánh giá trung bình

### 9.4 Support Ticket
- Hệ thống hỗ trợ khách hàng
- Quản lý trạng thái ticket
- Phân loại loại yêu cầu

---

## 10. KẾT LUẬN

Hệ thống GOOJODOQ được thiết kế với kiến trúc rõ ràng, dễ bảo trì và mở rộng. Với 19 bảng cơ sở dữ liệu và hơn 30 API endpoints, hệ thống cung cấp đầy đủ chức năng cho một cửa hàng thương mại điện tử hiện đại.

Các tính năng chính bao gồm:
- ✅ Quản lý sản phẩm và danh mục
- ✅ Giỏ hàng và đặt hàng
- ✅ Thanh toán COD và PayOS
- ✅ Quản lý đơn hàng và tồn kho
- ✅ Hệ thống đánh giá và hỗ trợ
- ✅ Admin dashboard và thống kê
- ✅ Mã giảm giá và khuyến mãi

Hệ thống sẵn sàng cho việc triển khai thương mại và có thể mở rộng thêm nhiều tính năng khác trong tương lai.
│  QUẢN LÝ    │ ───────────────────────► │  QUẢN LÝ    │
│  GIỎ HÀNG   │                          │  ĐỚN HÀNG   │
└─────────────┘                          └─────────────┘
```

---

## 4. SƠ ĐỒ LỚP (CLASS DIAGRAM)

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│    NguoiDung    │         │    SanPham      │         │    DonHang      │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ + id_nguoidung  │         │ + id_sanpham    │         │ + id_donhang    │
│ + email         │         │ + ma_sku        │         │ + ma_donhang    │
│ + matkhau       │         │ + ten_sanpham   │         │ + trangthai     │
│ + hoten         │         │ + gia           │         │ + tong_tien     │
│ + sdt           │         │ + gia_goc       │         │ + ngay_tao      │
│ + quyen         │         │ + tonkho        │         └─────────────────┘
│ + trangthai     │         │ + hien_thi      │                 │
└─────────────────┘         └─────────────────┘                 │
         │                           │                          │
         │                           │                          │
         │ 1:n                       │ 1:n                      │ 1:n
         ▼                           ▼                          ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│    DiaChi       │         │   AnhSanPham    │         │ ChiTietDonHang  │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ + id_diachi     │         │ + id_anh        │         │ + id_chitiet    │
│ + ten_nguoinhan │         │ + duongdan_anh  │         │ + soluong       │
│ + sdt           │         │ + mo_ta         │         │ + gia_donvi     │
│ + diachi_chitiet│         │ + thu_tu        │         │ + thanh_tien    │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

---

## 5. SƠ ĐỒ USE CASE

```
                    ┌────────────────────────────────────┐
                    │         HỆ THỐNG GOOJODOQ          │
                    │                                    │
┌──────────┐        │  ┌─────────────┐ ┌─────────────┐   │
│          │        │  │ Đăng ký     │ │ Đăng nhập   │   │
│  KHÁCH   │◄──────►│  │             │ │             │   │
│  HÀNG    │        │  └─────────────┘ └─────────────┘   │
│          │        │                                    │
└──────────┘        │  ┌─────────────┐ ┌─────────────┐   │
                    │  │ Xem sản     │ │ Tìm kiếm    │   │
                    │  │ phẩm        │ │ sản phẩm    │   │
                    │  └─────────────┘ └─────────────┘   │
                    │                                    │
                    │  ┌─────────────┐ ┌─────────────┐   │
                    │  │ Thêm giỏ    │ │ Đặt hàng    │   │
                    │  │ hàng        │ │             │   │
                    │  └─────────────┘ └─────────────┘   │
                    │                                    │
                    │  ┌─────────────┐ ┌─────────────┐   │
┌──────────┐        │  │ Quản lý     │ │ Quản lý     │   │
│          │        │  │ sản phẩm    │ │ đơn hàng    │   │
│  ADMIN   │◄──────►│  │             │ │             │   │
│          │        │  └─────────────┘ └─────────────┘   │
└──────────┘        │                                    │
                    │  ┌─────────────┐ ┌─────────────┐   │
                    │  │ Quản lý     │ │ Thống kê    │   │
                    │  │ người dùng  │ │ doanh thu   │   │
                    │  └─────────────┘ └─────────────┘   │
                    └────────────────────────────────────┘
```

---

## 6. SƠ ĐỒ TRÌNH TỰ (SEQUENCE DIAGRAM)

### 6.1 Quy trình đặt hàng
```
Khách hàng    Frontend     Backend      Database
    │             │           │            │
    │Chọn sản phẩm│           │            │
    ├────────────►│           │            │
    │             │ GET /api/products/{id} │
    │             ├──────────►│            │
    │             │           │ SELECT ... │
    │             │           ├───────────►│
    │             │           │◄───────────┤
    │             │◄──────────┤            │
    │◄────────────┤           │            │
    │             │           │            │
    │Thêm giỏ hàng│           │            │
    ├────────────►│           │            │
    │             │ POST /api/cart/add     │
    │             ├──────────►│            │
    │             │           │ INSERT ... │
    │             │           ├───────────►│
    │             │           │◄───────────┤
    │             │◄──────────┤            │
    │◄────────────┤           │            │
    │             │           │            │
    │ Đặt hàng    │           │            │
    ├────────────►│           │            │
    │             │ POST /api/orders       │
    │             ├──────────►│            │
    │             │           │ INSERT ... │
    │             │           ├───────────►│
    │             │           │◄───────────┤
    │             │◄──────────┤            │
    │◄────────────┤           │            │
```

---

## 7. SƠ ĐỒ HOẠT ĐỘNG (ACTIVITY DIAGRAM)

### 7.1 Quy trình mua hàng
```
    [Bắt đầu]
        │
        ▼
    ┌─────────┐
    │ Đăng    │
    │ nhập    │
    └────┬────┘
         │
         ▼
    ┌─────────┐      Không      ┌─────────┐
    │ Đã đăng │ ──────────────► │ Đăng    │
    │ nhập?   │                 │ nhập    │
    └────┬────┘                 └─────────┘
         │ Có
         ▼
    ┌─────────┐
    │ Xem     │
    │ sản phẩm│
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │ Thêm vào│
    │ giỏ hàng│
    └────┬────┘
         │
         ▼
    ┌─────────┐      Không      ┌─────────┐
    │ Tiếp tục│ ──────────────► │ Thanh   │
    │ mua?    │                 │ toán    │
    └────┬────┘                 └────┬────┘
         │ Có                        │
         │                           ▼
         └──────────────────► ┌─────────┐
                              │ Hoàn    │
                              │ thành   │
                              └─────────┘
                                   │
                                   ▼
                               [Kết thúc]
```

---

## 8. SƠ ĐỒ CSDL (ERD - ENTITY RELATIONSHIP DIAGRAM)

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│    nguoidung    │         │    danhmuc      │         │    sanpham      │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ PK id_nguoidung │         │ PK id_danhmuc   │         │ PK id_sanpham   │
│    email        │         │    ten_danhmuc  │         │    ma_sku       │
│    matkhau      │         │    duongdan     │         │    ten_sanpham  │
│    hoten        │         │    mo_ta        │         │ FK id_danhmuc   │
│    sdt          │         │    thu_tu       │         │    gia          │
│    quyen        │         │    hien_thi     │         │    gia_goc      │
│    trangthai    │         └─────────────────┘         │    tonkho       │
└─────────────────┘                   │                 │    hien_thi     │
         │                            │                 └─────────────────┘
         │ 1:n                        │ 1:n                      │
         ▼                            ▼                          │ 1:n
┌─────────────────┐         ┌─────────────────┐                 ▼
│     diachi      │         │  anh_sanpham    │         ┌─────────────────┐
├─────────────────┤         ├─────────────────┤         │    giohang      │
│ PK id_diachi    │         │ PK id_anh       │         ├─────────────────┤
│ FK id_nguoidung │         │ FK id_sanpham   │         │ PK id_giohang   │
│    ten_nguoinhan│         │    duongdan_anh │         │ FK id_nguoidung │
│    sdt          │         │    mo_ta        │         │    ngay_tao     │
│    diachi_chitiet│        │    thu_tu       │         └─────────────────┘
│    thanhpho     │         └─────────────────┘                 │
│    quanhuyen    │                                             │ 1:n
│    macdinh      │                                             ▼
└─────────────────┘                                   ┌─────────────────┐
         │                                            │ chitiet_giohang │
         │ 1:n                                        ├─────────────────┤
         ▼                                            │ PK id_chitiet   │
┌─────────────────┐         ┌─────────────────┐       │ FK id_giohang   │
│    donhang      │         │payment_transactions│    │ FK id_sanpham   │
├─────────────────┤         ├─────────────────┤       │    soluong      │
│ PK id_donhang   │         │PK id_transaction│       │    gia_donvi    │
│ FK id_nguoidung │ ◄──────►│ FK id_donhang   │       └─────────────────┘
│ FK id_diachi    │         │   order_code    │
│    ma_donhang   │         │   amount        │       ┌─────────────────┐
│    trangthai    │         │   payment_method│       │sanpham_yeuthich │
│    tong_tien    │         │   status        │       ├─────────────────┤
│    ngay_tao     │         │   payment_url   │       │ PK id           │
└─────────────────┘         └─────────────────┘       │ FK id_nguoidung │
         │                                            │ FK id_sanpham   │
         │ 1:n                                        │    ngay_them    │
         ▼                                            └─────────────────┘
┌─────────────────┐         ┌─────────────────┐
│ chitiet_donhang │         │ danhgia_sanpham │       ┌─────────────────┐
├─────────────────┤         ├─────────────────┤       │   magiamgia     │
│ PK id_chitiet   │         │ PK id_danhgia   │       ├─────────────────┤
│ FK id_donhang   │         │ FK id_donhang   │       │ PK id_magiamgia │
│ FK id_sanpham   │         │ FK id_sanpham   │       │   ma            │
│    soluong      │         │ FK id_nguoidung │       │   mo_ta         │
│    gia_donvi    │         │    so_sao       │       │   loai_giam     │
│    thanh_tien   │         │    noidung      │       │   giatri_giam   │
└─────────────────┘         └─────────────────┘       │   gioihan_sudung│
                                     │                └─────────────────┘
                                     │ 1:n
                                     ▼
                            ┌─────────────────┐       ┌─────────────────┐
                            │ traloi_danhgia  │       │ yeucau_hotro    │
                            ├─────────────────┤       ├─────────────────┤
                            │ PK id_traloi    │       │ PK id_yeucau    │
                            │ FK id_danhgia   │       │ FK id_nguoidung │
                            │ FK id_admin     │       │    hoten        │
                            │    noidung      │       │    email        │
                            └─────────────────┘       │    chude        │
                                                      │    trangthai    │
                                                      └─────────────────┘
```

---

## 9. SƠ ĐỒ GIAO DIỆN NGƯỜI DÙNG (UI/UX)

### 9.1 Cấu trúc trang web
```
┌─────────────────────────────────────────────────────────┐
│                    HEADER                               │
│  Logo | Menu | Search | Cart | Login/Profile            │
├─────────────────────────────────────────────────────────┤
│                    HERO BANNER                          │
│              Slideshow với 3 slides                     │
├─────────────────────────────────────────────────────────┤
│                SALE PRODUCTS SECTION                    │
│           Carousel sản phẩm đang giảm giá               │
├─────────────────────────────────────────────────────────┤
│              FEATURED PRODUCTS SECTION                  │
│              Grid 3x4 sản phẩm nổi bật                  │
├─────────────────────────────────────────────────────────┤
│                    FOOTER                               │
│    Chính sách | Hỗ trợ | Về GOOJODOQ | Social           │
└─────────────────────────────────────────────────────────┘
```

### 9.2 Responsive Design
- **Desktop**: Layout 3 cột cho sản phẩm
- **Tablet**: Layout 2 cột
- **Mobile**: Layout 1 cột, menu hamburger

### 9.3 Các trang chính
1. **Trang chủ** (index.html) - Hiển thị sản phẩm nổi bật
2. **Cửa hàng** (shop.html) - Danh sách tất cả sản phẩm
3. **Chi tiết sản phẩm** (product-detail.html) - Thông tin chi tiết
4. **Giỏ hàng** (cart.html) - Quản lý giỏ hàng
5. **Thanh toán** (checkout.html) - Quy trình đặt hàng
6. **Tài khoản** (profile.html) - Thông tin cá nhân
7. **Admin Dashboard** - Quản lý hệ thống

---

## 10. API ENDPOINTS

### 10.1 Authentication APIs
```
POST /api/auth/register              - Đăng ký tài khoản
POST /api/auth/login                 - Đăng nhập
GET  /api/auth/user/:id              - Lấy thông tin user
GET  /api/auth/users                 - Lấy danh sách user (Admin)
DELETE /api/auth/user/:id            - Xóa user (Admin)
PUT  /api/auth/user/:id/toggle-status - Khóa/Mở khóa user (Admin)
```

### 10.2 Product APIs
```
GET    /api/products                    - Lấy danh sách sản phẩm
GET    /api/products/:id                - Lấy chi tiết sản phẩm
POST   /api/products                    - Thêm sản phẩm (Admin)
PUT    /api/products/:id                - Cập nhật sản phẩm (Admin)
DELETE /api/products/:id                - Xóa sản phẩm (Admin)
GET    /api/products/best-selling       - Top sản phẩm bán chạy (chỉ tính đơn hoàn thành)
GET    /api/products/slow-selling       - Top sản phẩm bán ế
GET    /api/products/featured           - Sản phẩm nổi bật
```

### 10.3 Cart APIs
```
GET    /api/cart/:userId          - Lấy giỏ hàng
POST   /api/cart/add              - Thêm vào giỏ hàng
PUT    /api/cart/item/:itemId     - Cập nhật số lượng
DELETE /api/cart/item/:itemId     - Xóa khỏi giỏ hàng
```

### 10.4 Order APIs
```
GET  /api/orders/user/:userId     - Lấy đơn hàng của user
GET  /api/orders/detail/:orderId  - Chi tiết đơn hàng
POST /api/orders                  - Tạo đơn hàng mới
PUT  /api/orders/:id/cancel       - Hủy đơn hàng
PUT  /api/orders/:id/received     - Xác nhận đã nhận hàng
PUT  /api/orders/:id/confirm      - Admin xác nhận đơn hàng
GET  /api/orders/revenue          - Thống kê doanh thu (Admin)
```

### 10.5 Payment APIs
```
POST /api/payment/create          - Tạo link thanh toán PayOS
GET  /api/payment/success         - Xử lý thanh toán thành công
GET  /api/payment/cancel          - Xử lý hủy thanh toán
POST /api/payment/webhook         - Webhook từ PayOS
GET  /api/payment/status/:orderCode - Kiểm tra trạng thái thanh toán
```

### 10.6 Wishlist APIs
```
GET    /api/wishlist/:userId           - Lấy danh sách yêu thích
POST   /api/wishlist                   - Thêm vào yêu thích
DELETE /api/wishlist/:userId/:productId - Xóa khỏi yêu thích
GET    /api/wishlist/:userId/:productId/check - Kiểm tra trạng thái yêu thích
```

### 10.7 Voucher APIs
```
POST /api/vouchers/check          - Kiểm tra mã giảm giá
GET  /api/vouchers/available      - Lấy mã giảm giá khả dụng
POST /api/vouchers/use            - Sử dụng mã giảm giá
```

### 10.8 Review APIs
```
GET  /api/reviews/product/:productId        - Lấy đánh giá sản phẩm
GET  /api/reviews/product/:productId/stats  - Thống kê đánh giá
GET  /api/reviews/order/:orderId/products   - Sản phẩm có thể đánh giá
POST /api/reviews                           - Tạo đánh giá
POST /api/reviews/:reviewId/reply           - Admin trả lời đánh giá
DELETE /api/reviews/reply/:replyId          - Xóa trả lời đánh giá
```

---

## 11. BẢO MẬT VÀ HIỆU SUẤT

### 11.1 Bảo mật
- Mã hóa mật khẩu bằng bcrypt
- **Kiểm tra trạng thái tài khoản khi đăng nhập**
- **Chức năng khóa/mở khóa tài khoản cho Admin**
- **Thông báo rõ ràng khi tài khoản bị khóa**
- Validation dữ liệu đầu vào
- SQL Injection prevention
- CORS configuration

### 11.2 Logic Nghiệp vụ
- **Quản lý tồn kho thông minh:**
  - Giảm tồn kho ngay khi đặt hàng
  - Hoàn lại tồn kho khi hủy đơn (chỉ cho phép hủy khi trạng thái "chờ xác nhận")
- **Tính số lượt bán chính xác:**
  - CHỈ tính từ đơn hàng đã hoàn thành (khách hàng đã xác nhận nhận hàng)
  - Không tính đơn hàng bị hủy hoặc chưa hoàn thành
- **Quy trình đơn hàng:**
  1. Đặt hàng → Trạng thái "chờ xác nhận" + Giảm tồn kho
  2. Admin xác nhận → Trạng thái "đang giao"
  3. Khách nhận hàng → Trạng thái "hoàn thành" + Tính vào số lượt bán

### 11.2 Hiệu suất
- Database indexing
- Image optimization
- Lazy loading
- Caching strategies

---

## 12. TRIỂN KHAI VÀ VẬN HÀNH

### 12.1 Yêu cầu hệ thống
- Node.js 16+
- MySQL 8.0+
- RAM: 2GB+
- Storage: 10GB+

### 12.2 Cấu hình môi trường
```
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=password
DB_NAME=goojodoq_db
DB_PORT=3306
PORT=3000
```

---

## 13. KẾT LUẬN

Hệ thống GOOJODOQ được thiết kế với kiến trúc hiện đại, dễ bảo trì và mở rộng. Với đầy đủ các chức năng cơ bản của một website thương mại điện tử, hệ thống có thể đáp ứng nhu cầu kinh doanh và có khả năng phát triển trong tương lai.

### Các tính năng chính:
- ✅ **Quản lý sản phẩm đa dạng** với sections (sale, featured, all)
- ✅ **Hệ thống giỏ hàng thông minh** với quản lý tồn kho
- ✅ **Quy trình đặt hàng hoàn chỉnh** với nhiều trạng thái
- ✅ **Tích hợp thanh toán PayOS** - Cổng thanh toán trực tuyến
- ✅ **Admin dashboard mạnh mẽ** với thống kê doanh thu
- ✅ **Quản lý người dùng** với khóa/mở khóa tài khoản
- ✅ **Bảo mật đăng nhập** với kiểm tra trạng thái tài khoản
- ✅ **Hệ thống đánh giá sản phẩm** với trả lời từ admin
- ✅ **Danh sách yêu thích** (wishlist) cho khách hàng
- ✅ **Hệ thống mã giảm giá** (voucher) linh hoạt
- ✅ **Hỗ trợ khách hàng** với ticket system
- ✅ **Thống kê số lượt bán chính xác** (chỉ tính đơn hoàn thành)
- ✅ **Responsive design** tương thích mọi thiết bị
- ✅ **RESTful API architecture** chuẩn công nghiệp
- ✅ **Database được tối ưu hóa** với 16 bảng quan hệ

---

*Tài liệu được tạo tự động từ phân tích mã nguồn dự án GOOJODOQ*