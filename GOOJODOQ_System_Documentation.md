# TÀI LIỆU HỆ THỐNG GOOJODOQ
## Cửa hàng phụ kiện điện tử trực tuyến

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1 Mô tả dự án
GOOJODOQ là hệ thống thương mại điện tử chuyên bán phụ kiện điện tử như quạt mini, loa Bluetooth, tai nghe và các phụ kiện điện thoại. Hệ thống được xây dựng với kiến trúc Client-Server, sử dụng công nghệ web hiện đại.

### 1.2 Công nghệ sử dụng
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
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

## 2. SƠ ĐỒ HỆ THỐNG (SYSTEM ARCHITECTURE)

```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐    MySQL    ┌─────────────────┐
│                 │ ◄──────────────► │                 │ ◄─────────► │                 │
│   FRONTEND      │                  │    BACKEND      │             │    DATABASE     │
│   (Client)      │                  │   (Server)      │             │    (MySQL)      │
│                 │                  │                 │             │                 │
│ - HTML/CSS/JS   │                  │ - Node.js       │             │ - goojodoq_db   │
│ - Bootstrap     │                  │ - Express.js    │             │ - 15+ Tables    │
│ - Responsive    │                  │ - RESTful API   │             │ - Relationships │
└─────────────────┘                  └─────────────────┘             └─────────────────┘
```

---

## 3. SƠ ĐỒ LUỒNG DỮ LIỆU (DATA FLOW DIAGRAM)

### 3.1 DFD Mức 0 (Context Diagram)
```
                    ┌─────────────────┐
                    │                 │
        ┌──────────►│   HỆ THỐNG      │◄──────────┐
        │           │   GOOJODOQ      │           │
        │           │                 │           │
        │           └─────────────────┘           │
        │                                         │
   ┌────▼────┐                               ┌────▼────┐
   │         │                               │         │
   │ KHÁCH   │                               │  ADMIN  │
   │ HÀNG    │                               │         │
   │         │                               │         │
   └─────────┘                               └─────────┘
```

### 3.2 DFD Mức 1 (Level 1)
```
┌─────────────┐    Đăng ký/Đăng nhập     ┌─────────────┐
│   KHÁCH     │ ───────────────────────► │  QUẢN LÝ    │
│   HÀNG      │                          │  NGƯỜI DÙNG │
└─────────────┘                          └─────────────┘
       │                                        │
       │ Xem sản phẩm                           │ Thông tin user
       ▼                                        ▼
┌─────────────┐                          ┌─────────────┐
│  QUẢN LÝ    │ ◄────── Thêm/Sửa ────────│    ADMIN    │
│  SẢN PHẨM   │                          │             │
└─────────────┘                          └─────────────┘
       │                                        │
       │ Thêm giỏ hàng                          │ Quản lý đơn hàng
       ▼                                        ▼
┌─────────────┐       Đặt hàng           ┌─────────────┐
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