# BÁO CÁO DỰ ÁN GOOJODOQ
## Hệ thống thương mại điện tử bán phụ kiện điện tử

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Giới thiệu
**GOOJODOQ** là hệ thống thương mại điện tử chuyên bán phụ kiện điện tử như quạt mini, loa Bluetooth, tai nghe và các phụ kiện điện thoại. Hệ thống được xây dựng với kiến trúc Client-Server, sử dụng công nghệ web hiện đại.

### 1.2 Mục tiêu dự án
- Xây dựng website bán hàng trực tuyến hoàn chỉnh
- Tích hợp thanh toán trực tuyến qua PayOS
- Cung cấp giao diện quản trị cho admin
- Hỗ trợ đánh giá sản phẩm và chăm sóc khách hàng

### 1.3 Công nghệ sử dụng

| Thành phần | Công nghệ |
|------------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript ES6+, Bootstrap 5 |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL 8.0 |
| **Authentication** | bcrypt (mã hóa mật khẩu) |
| **Payment Gateway** | PayOS SDK (@payos/node) |
| **API** | RESTful API với CORS |
| **Thư viện khác** | mysql2, dotenv, node-fetch |

### 1.4 Cấu trúc dự án
```
GOOJODOQ/
├── Goojodoq_Backend/           # Backend API Server
│   ├── config/                 # Cấu hình database
│   ├── controllers/            # 13 module xử lý logic
│   ├── routes/                 # 8 file định tuyến API
│   ├── migrations/             # Script migration database
│   ├── scripts/                # Script tiện ích
│   ├── server.js               # File server chính
│   └── package.json            # Dependencies
├── Goojodoq_Frontend/          # Frontend Web Application
│   ├── css/                    # 8 file stylesheet
│   ├── js/                     # 23 module JavaScript
│   ├── images/                 # Hình ảnh tĩnh
│   ├── components/             # Component tái sử dụng
│   ├── *.html                  # 30+ trang HTML
│   └── server.js               # Frontend Express server
├── goojodoq_db.sql             # Schema database hoàn chỉnh
└── Doc/                        # Tài liệu dự án
```

---

## 2. CƠ SỞ DỮ LIỆU

### 2.1 Sơ đồ quan hệ (ERD)
```
nguoidung (1) ────────> (n) diachi
    │                        │
    │                        │
    ▼                        ▼
giohang (1) ────────> (n) donhang
    │                        │
    ▼                        ▼
chitiet_giohang         chitiet_donhang
    │                        │
    ▼                        ▼
sanpham <──────────> anh_sanpham
    │                        │
    ▼                        ▼
danhmuc              danhgia_sanpham
    │                        │
    ▼                        ▼
product_sections     traloi_danhgia
    │
    ▼
product_section_items
```

### 2.2 Danh sách 19 bảng dữ liệu

#### Nhóm Người dùng & Quyền:
| Bảng | Mô tả |
|------|-------|
| `nguoidung` | Thông tin người dùng và admin |
| `diachi` | Địa chỉ giao hàng |

#### Nhóm Sản phẩm:
| Bảng | Mô tả |
|------|-------|
| `danhmuc` | Danh mục sản phẩm |
| `sanpham` | Thông tin sản phẩm |
| `anh_sanpham` | Hình ảnh sản phẩm |
| `product_sections` | Quản lý section (sale, featured, all) |
| `product_section_items` | Sản phẩm trong từng section |

#### Nhóm Giỏ hàng & Đơn hàng:
| Bảng | Mô tả |
|------|-------|
| `giohang` | Giỏ hàng của người dùng |
| `chitiet_giohang` | Chi tiết sản phẩm trong giỏ |
| `donhang` | Thông tin đơn hàng |
| `chitiet_donhang` | Chi tiết sản phẩm trong đơn |

#### Nhóm Thanh toán & Khuyến mãi:
| Bảng | Mô tả |
|------|-------|
| `payment_transactions` | Giao dịch thanh toán PayOS |
| `magiamgia` | Mã giảm giá/voucher |
| `voucher_sudung` | Lịch sử sử dụng voucher |

#### Nhóm Tương tác:
| Bảng | Mô tả |
|------|-------|
| `yeuthich` | Danh sách yêu thích |
| `danhgia_sanpham` | Đánh giá sản phẩm (0-5 sao) |
| `traloi_danhgia` | Admin trả lời đánh giá |
| `yeucau_hotro` | Yêu cầu hỗ trợ khách hàng |
| `activity_log` | Nhật ký hoạt động hệ thống |

---

## 3. CHỨC NĂNG HỆ THỐNG

### 3.1 Chức năng dành cho Khách hàng

#### 🔐 Quản lý tài khoản:
- Đăng ký tài khoản với email/mật khẩu
- Đăng nhập với xác thực bcrypt
- Quản lý thông tin cá nhân (tên, SĐT, email)
- Quản lý nhiều địa chỉ giao hàng
- Đặt địa chỉ mặc định

#### 🛒 Mua sắm:
- Duyệt sản phẩm theo danh mục
- Tìm kiếm với gợi ý real-time
- Xem chi tiết sản phẩm với hình ảnh
- Thêm vào giỏ hàng với số lượng
- Quản lý danh sách yêu thích (wishlist)

#### 💳 Thanh toán:
- Quy trình checkout nhiều bước
- Chọn/quản lý địa chỉ giao hàng
- Áp dụng mã giảm giá (voucher)
- 2 phương thức thanh toán:
  - **COD** (Thanh toán khi nhận hàng)
  - **PayOS** (Chuyển khoản qua QR code)
- Tóm tắt đơn hàng với giá chi tiết

#### 📦 Quản lý đơn hàng:
- Xem lịch sử đơn hàng
- Theo dõi trạng thái: Chờ xác nhận → Đã xác nhận → Đang giao → Hoàn thành/Hủy
- Hủy đơn hàng (khi còn chờ xác nhận)
- Xác nhận đã nhận hàng
- Tải hóa đơn

#### ⭐ Đánh giá & Hỗ trợ:
- Đánh giá sản phẩm (0-5 sao) sau khi nhận hàng
- Viết nhận xét chi tiết
- Xem đánh giá của khách hàng khác
- Gửi yêu cầu hỗ trợ

### 3.2 Chức năng dành cho Admin

#### 📊 Dashboard:
- Thống kê real-time (người dùng, đơn hàng, doanh thu, sản phẩm)
- Biểu đồ doanh thu theo thời gian (ngày, tháng, năm)
- Phân bố trạng thái đơn hàng
- Nhật ký hoạt động gần đây
- Thống kê yêu cầu hỗ trợ

#### 📦 Quản lý sản phẩm:
- CRUD sản phẩm (Thêm, Sửa, Xóa, Xem)
- Quản lý danh mục
- Upload nhiều hình ảnh với nén tự động
- Theo dõi tồn kho
- Ẩn/hiện sản phẩm
- Quản lý section sản phẩm (sale, featured)
- Tùy chỉnh giá theo section
- Sắp xếp thứ tự hiển thị

#### 🛍️ Quản lý đơn hàng:
- Xem tất cả đơn hàng với bộ lọc
- Cập nhật trạng thái đơn hàng
- Hủy đơn hàng (hoàn lại tồn kho)
- Xem chi tiết đơn hàng
- Xuất hóa đơn
- Theo dõi trạng thái thanh toán

#### 👥 Quản lý khách hàng:
- Xem danh sách người dùng
- Khóa/mở khóa tài khoản
- Xem lịch sử mua hàng
- Theo dõi hoạt động

#### 🎫 Quản lý khuyến mãi:
- Tạo/sửa/xóa voucher
- Loại giảm giá: phần trăm hoặc số tiền cố định
- Đặt đơn hàng tối thiểu
- Giới hạn số lần sử dụng
- Đặt thời hạn hiệu lực
- Theo dõi lịch sử sử dụng

#### 🎧 Quản lý hỗ trợ:
- Hệ thống ticket hỗ trợ
- Theo dõi trạng thái (chờ xử lý, đang xử lý, đã giải quyết, đóng)
- Trả lời đánh giá khách hàng
- Phân loại yêu cầu hỗ trợ

---

## 4. LUỒNG HOẠT ĐỘNG HỆ THỐNG

### 4.1 Luồng Đăng ký & Đăng nhập
```
┌─────────────────────────────────────────────────────────────┐
│ 1. Người dùng điền form đăng ký (email, mật khẩu, tên, SĐT) │
│ 2. Frontend validate dữ liệu                                 │
│ 3. POST /api/auth/register                                   │
│ 4. Backend kiểm tra email trùng lặp                          │
│ 5. Mã hóa mật khẩu với bcrypt (10 salt rounds)               │
│ 6. Lưu vào database                                          │
│ 7. Chuyển hướng đến trang đăng nhập                          │
│ 8. Đăng nhập với email/mật khẩu                              │
│ 9. Backend xác thực thông tin                                │
│ 10. Lưu thông tin user vào localStorage/sessionStorage       │
│ 11. Chuyển hướng về trang chủ                                │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Luồng Mua hàng & Thanh toán
```
┌─────────────────────────────────────────────────────────────┐
│ 1. Duyệt sản phẩm → GET /api/products                       │
│ 2. Xem chi tiết → GET /api/products/:id                     │
│ 3. Thêm vào giỏ → POST /api/cart/add                        │
│ 4. Xem giỏ hàng → GET /api/cart/:userId                     │
│ 5. Chọn sản phẩm để thanh toán                              │
│ 6. Chuyển đến trang checkout                                │
│ 7. Chọn/xác nhận địa chỉ giao hàng                          │
│ 8. Áp dụng voucher → POST /api/vouchers/check               │
│ 9. Chọn phương thức thanh toán (COD hoặc PayOS)             │
│ 10. Tạo đơn hàng → POST /api/orders                         │
│ 11. Nếu PayOS: Tạo link thanh toán → POST /api/payment/create│
│ 12. Người dùng quét QR và thanh toán                        │
│ 13. PayOS webhook xác nhận thanh toán                       │
│ 14. Cập nhật trạng thái đơn hàng thành "đã xác nhận"        │
│ 15. Chuyển hướng đến trang thành công                       │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Luồng Quản lý đơn hàng
```
┌─────────────────────────────────────────────────────────────┐
│ KHÁCH HÀNG:                                                 │
│ 1. Xem đơn hàng → GET /api/orders/user/:userId              │
│ 2. Xem chi tiết → GET /api/orders/detail/:orderId           │
│ 3. Hủy đơn (nếu chờ xác nhận) → PUT /api/orders/:id/cancel  │
│ 4. Xác nhận nhận hàng → PUT /api/orders/:id/received        │
│ 5. Đánh giá sản phẩm → POST /api/reviews                    │
├─────────────────────────────────────────────────────────────┤
│ ADMIN:                                                      │
│ 1. Xem tất cả đơn hàng → GET /api/orders                    │
│ 2. Lọc theo trạng thái                                      │
│ 3. Xác nhận đơn hàng → PUT /api/orders/:id/confirm          │
│ 4. Cập nhật trạng thái giao hàng                            │
│ 5. Xem thống kê doanh thu → GET /api/orders/revenue         │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Luồng Đánh giá sản phẩm
```
┌─────────────────────────────────────────────────────────────┐
│ 1. Người dùng hoàn thành đơn hàng                           │
│ 2. Trạng thái đơn chuyển thành "hoàn thành"                 │
│ 3. Người dùng có thể đánh giá sản phẩm                      │
│ 4. GET /api/reviews/order/:orderId/products                 │
│ 5. Người dùng chấm điểm (0-5 sao) và viết nhận xét          │
│ 6. POST /api/reviews                                        │
│ 7. Đánh giá được lưu vào database                           │
│ 8. Admin có thể trả lời → POST /api/reviews/:id/reply       │
│ 9. Phản hồi hiển thị dưới đánh giá                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. TÍCH HỢP THANH TOÁN PAYOS

### 5.1 Thông tin tích hợp
- **SDK**: @payos/node v1.0.7
- **Phương thức**: Chuyển khoản qua QR code
- **Cấu hình**: PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY

### 5.2 Quy trình thanh toán
```
┌─────────────────────────────────────────────────────────────┐
│ 1. Tạo đơn hàng trong database                              │
│ 2. Tạo orderCode duy nhất (timestamp + orderId)             │
│ 3. Gọi PayOS API với amount, description, return URLs       │
│ 4. Nhận payment link với QR code                            │
│ 5. Người dùng quét QR và chuyển tiền                        │
│ 6. PayOS gửi webhook xác nhận                               │
│ 7. Cập nhật trạng thái đơn hàng thành "đã xác nhận"         │
│ 8. Cập nhật bảng payment_transactions                       │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Trạng thái thanh toán
| Trạng thái | Mô tả |
|------------|-------|
| `pending` | Đã tạo link thanh toán, chờ thanh toán |
| `completed` | Thanh toán thành công |
| `failed` | Thanh toán thất bại |
| `cancelled` | Người dùng hủy thanh toán |

---

## 6. API ENDPOINTS (30+ endpoints)

### 6.1 Authentication (6 endpoints)
```
POST   /api/auth/register              - Đăng ký
POST   /api/auth/login                 - Đăng nhập
GET    /api/auth/user/:userId          - Lấy thông tin user
GET    /api/auth/users                 - Admin: Danh sách users
DELETE /api/auth/user/:userId          - Admin: Xóa user
PUT    /api/auth/user/:userId/toggle-status - Admin: Khóa/mở khóa
```

### 6.2 Products (10+ endpoints)
```
GET    /api/products                   - Danh sách sản phẩm
GET    /api/products/:id               - Chi tiết sản phẩm
POST   /api/products                   - Admin: Tạo sản phẩm
PUT    /api/products/:id               - Admin: Cập nhật sản phẩm
DELETE /api/products/:id               - Admin: Xóa sản phẩm
PATCH  /api/products/:id/visibility    - Admin: Ẩn/hiện
GET    /api/products/stats/best-selling - Top 10 bán chạy
GET    /api/products/stats/slow-selling - Top 10 bán chậm
GET    /api/products/stats/featured    - Top 12 nổi bật
```

### 6.3 Cart (5 endpoints)
```
GET    /api/cart/:userId               - Lấy giỏ hàng
POST   /api/cart/add                   - Thêm vào giỏ
PUT    /api/cart/item/:itemId          - Cập nhật số lượng
DELETE /api/cart/item/:itemId          - Xóa sản phẩm
DELETE /api/cart/clear/:userId         - Xóa toàn bộ giỏ
```

### 6.4 Orders (9 endpoints)
```
POST   /api/orders                     - Tạo đơn hàng
GET    /api/orders                     - Admin: Tất cả đơn hàng
GET    /api/orders/user/:userId        - Đơn hàng của user
GET    /api/orders/detail/:orderId     - Chi tiết đơn hàng
PUT    /api/orders/:orderId/confirm    - Admin: Xác nhận đơn
PUT    /api/orders/:orderId/cancel     - Hủy đơn hàng
PUT    /api/orders/:orderId/received   - Xác nhận nhận hàng
GET    /api/orders/revenue             - Admin: Thống kê doanh thu
GET    /api/orders/revenue-chart       - Admin: Biểu đồ doanh thu
```

### 6.5 Payment (4 endpoints)
```
POST   /api/payment/create             - Tạo link thanh toán PayOS
POST   /api/payment/webhook            - PayOS webhook callback
GET    /api/payment/status/:code       - Kiểm tra trạng thái
POST   /api/payment/cancel/:code       - Hủy thanh toán
```

### 6.6 Vouchers (7 endpoints)
```
POST   /api/vouchers/check             - Kiểm tra mã giảm giá
GET    /api/vouchers/available         - Voucher khả dụng
POST   /api/vouchers/use               - Áp dụng voucher
GET    /api/vouchers/admin/all         - Admin: Tất cả voucher
POST   /api/vouchers/admin             - Admin: Tạo voucher
PUT    /api/vouchers/admin/:id         - Admin: Cập nhật voucher
DELETE /api/vouchers/admin/:id         - Admin: Xóa voucher
```

### 6.7 Reviews (6 endpoints)
```
GET    /api/reviews/product/:id        - Đánh giá sản phẩm
GET    /api/reviews/product/:id/stats  - Thống kê đánh giá
GET    /api/reviews/order/:id/products - Sản phẩm cần đánh giá
POST   /api/reviews                    - Tạo đánh giá
POST   /api/reviews/:id/reply          - Admin: Trả lời đánh giá
DELETE /api/reviews/reply/:id          - Xóa trả lời
```

---

## 7. BẢO MẬT HỆ THỐNG

### 7.1 Bảo mật mật khẩu
- Mã hóa bcrypt với 10 salt rounds
- Không lưu mật khẩu dạng plain text
- Xác thực mật khẩu khi đăng nhập

### 7.2 Phân quyền người dùng
| Vai trò | Quyền hạn |
|---------|-----------|
| `admin` | Toàn quyền hệ thống |
| `nguoidung` | Chỉ truy cập dữ liệu cá nhân |

### 7.3 Bảo mật thanh toán
- PayOS SDK xử lý dữ liệu thanh toán nhạy cảm
- Không lưu thông tin thẻ tín dụng
- HTTPS cho tất cả giao dịch
- Xác thực webhook để xác nhận thanh toán

### 7.4 Validation dữ liệu
- Frontend: Validate form trước khi gửi
- Backend: Validate input trên tất cả endpoints
- Database: Foreign keys và constraints

---

## 8. THỐNG KÊ DỰ ÁN

| Thành phần | Số lượng |
|------------|----------|
| Bảng Database | 19 |
| API Endpoints | 30+ |
| Trang HTML | 30+ |
| Module JavaScript | 23 |
| Backend Controllers | 13 |
| File CSS | 8 |
| Phương thức thanh toán | 2 (COD, PayOS) |
| Trạng thái đơn hàng | 4 |
| Hệ thống đánh giá | 0-5 sao |

---

## 9. ĐIỂM MẠNH CỦA HỆ THỐNG

✅ **Giải pháp E-Commerce hoàn chỉnh** - Đầy đủ tính năng bán hàng online

✅ **Thiết kế Responsive** - Hoạt động tốt trên desktop, tablet, mobile

✅ **Xác thực an toàn** - Mã hóa mật khẩu bcrypt

✅ **Tích hợp thanh toán** - PayOS cho thanh toán online

✅ **Dashboard Admin** - Công cụ quản lý toàn diện

✅ **Hệ thống đánh giá** - Phản hồi và xếp hạng khách hàng

✅ **Quản lý tồn kho** - Theo dõi stock real-time

✅ **Hệ thống khuyến mãi** - Voucher/mã giảm giá linh hoạt

✅ **Ghi log hoạt động** - Audit trail cho admin

✅ **Hệ thống hỗ trợ** - Ticket chăm sóc khách hàng

✅ **Tối ưu hình ảnh** - Nén ảnh phía client

✅ **Tối ưu Database** - Index và quan hệ đúng chuẩn

---

## 10. HƯỚNG PHÁT TRIỂN

- Thông báo email cho đơn hàng và đánh giá
- Thông báo SMS cho trạng thái đơn hàng
- Phân tích và báo cáo nâng cao
- Hệ thống gợi ý sản phẩm dựa trên lịch sử mua
- Hỗ trợ đa ngôn ngữ
- Ứng dụng mobile (React Native/Flutter)
- Chat hỗ trợ real-time
- Cảnh báo tồn kho thấp
- Tích hợp API vận chuyển
- Tìm kiếm nâng cao với Elasticsearch
- Caching layer (Redis) để tăng hiệu suất

---

## 11. CÂU HỎI CÓ THỂ BỊ ĐẶT RA KHI BÁO CÁO

### 11.1 Câu hỏi về Kiến trúc & Công nghệ

#### Q1: Tại sao chọn kiến trúc Client-Server thay vì các kiến trúc khác?
**Trả lời gợi ý:**
- Phân tách rõ ràng giữa Frontend và Backend
- Dễ bảo trì và mở rộng độc lập
- Backend có thể phục vụ nhiều client (web, mobile)
- Phù hợp với quy mô dự án e-commerce vừa và nhỏ

#### Q2: Tại sao chọn Node.js/Express thay vì PHP, Java, hoặc Python?
**Trả lời gợi ý:**
- JavaScript cả frontend và backend → thống nhất ngôn ngữ
- Non-blocking I/O phù hợp với ứng dụng real-time
- NPM ecosystem phong phú
- Hiệu suất cao với các tác vụ I/O-bound
- Dễ học và triển khai nhanh

#### Q3: Tại sao chọn MySQL thay vì MongoDB hoặc PostgreSQL?
**Trả lời gợi ý:**
- Dữ liệu e-commerce có cấu trúc rõ ràng → phù hợp SQL
- Quan hệ giữa các bảng (đơn hàng, sản phẩm, người dùng) cần ACID
- MySQL phổ biến, tài liệu phong phú
- Hỗ trợ tốt cho các truy vấn phức tạp (JOIN, GROUP BY)

#### Q4: Tại sao không sử dụng framework frontend như React, Vue, hoặc Angular?
**Trả lời gợi ý:**
- Vanilla JavaScript đủ cho quy mô dự án
- Giảm độ phức tạp và thời gian học
- Tải trang nhanh hơn (không cần bundle lớn)
- Dễ SEO hơn với HTML tĩnh
- Có thể nâng cấp lên SPA sau này nếu cần

---

### 11.2 Câu hỏi về Cơ sở dữ liệu

#### Q5: Giải thích quan hệ giữa các bảng trong database?
**Trả lời gợi ý:**
- `nguoidung` (1) → (n) `diachi`: Một user có nhiều địa chỉ
- `nguoidung` (1) → (1) `giohang`: Mỗi user có một giỏ hàng
- `giohang` (1) → (n) `chitiet_giohang`: Giỏ hàng chứa nhiều sản phẩm
- `nguoidung` (1) → (n) `donhang`: User có nhiều đơn hàng
- `donhang` (1) → (n) `chitiet_donhang`: Đơn hàng có nhiều sản phẩm
- `sanpham` (1) → (n) `anh_sanpham`: Sản phẩm có nhiều hình ảnh
- `danhmuc` (1) → (n) `sanpham`: Danh mục chứa nhiều sản phẩm

#### Q6: Tại sao tách bảng `chitiet_giohang` và `chitiet_donhang` riêng?
**Trả lời gợi ý:**
- Chuẩn hóa database (3NF)
- Tránh dư thừa dữ liệu
- Dễ quản lý số lượng và giá từng sản phẩm
- Hỗ trợ nhiều sản phẩm trong một giỏ/đơn hàng

#### Q7: Làm sao xử lý khi sản phẩm bị xóa nhưng đã có trong đơn hàng?
**Trả lời gợi ý:**
- Sử dụng `ON DELETE SET NULL` cho foreign key
- Lưu thông tin sản phẩm (tên, giá) trực tiếp trong `chitiet_donhang`
- Không xóa cứng sản phẩm, chỉ ẩn (`hien_thi = 0`)

#### Q8: Giải thích cách đánh index trong database?
**Trả lời gợi ý:**
- Index trên `email` trong `nguoidung` → tìm kiếm nhanh khi đăng nhập
- Index trên `id_danhmuc` trong `sanpham` → lọc theo danh mục
- Index trên `trangthai` trong `donhang` → lọc đơn hàng theo trạng thái
- Index trên `ngay_tao` → sắp xếp theo thời gian

---

### 11.3 Câu hỏi về Bảo mật

#### Q9: Làm sao bảo mật mật khẩu người dùng?
**Trả lời gợi ý:**
- Sử dụng bcrypt với 10 salt rounds
- Không lưu mật khẩu dạng plain text
- Salt được tạo ngẫu nhiên cho mỗi mật khẩu
- Khi đăng nhập, so sánh hash thay vì mật khẩu gốc

#### Q10: Làm sao ngăn chặn SQL Injection?
**Trả lời gợi ý:**
- Sử dụng Prepared Statements với mysql2
- Parameterized queries: `pool.query('SELECT * FROM users WHERE id = ?', [userId])`
- Không nối chuỗi trực tiếp vào SQL query
- Validate input trước khi xử lý

#### Q11: Làm sao phân quyền admin và user thường?
**Trả lời gợi ý:**
- Cột `quyen` trong bảng `nguoidung` với giá trị 'admin' hoặc 'nguoidung'
- Kiểm tra quyền ở frontend trước khi hiển thị trang admin
- Kiểm tra quyền ở backend trước khi thực hiện API admin
- Lưu thông tin user trong localStorage/sessionStorage

#### Q12: Làm sao bảo mật thanh toán PayOS?
**Trả lời gợi ý:**
- Sử dụng SDK chính thức của PayOS
- Lưu credentials trong biến môi trường (.env)
- Xác thực webhook bằng checksum key
- Không lưu thông tin thẻ tín dụng
- HTTPS cho tất cả giao dịch

---

### 11.4 Câu hỏi về Chức năng

#### Q13: Giải thích quy trình thanh toán PayOS?
**Trả lời gợi ý:**
1. User chọn thanh toán PayOS
2. Backend tạo đơn hàng với trạng thái "chờ xác nhận"
3. Gọi PayOS API tạo payment link
4. Trả về QR code cho user
5. User quét QR và chuyển tiền
6. PayOS gửi webhook xác nhận
7. Backend cập nhật trạng thái đơn hàng
8. Redirect user đến trang thành công

#### Q14: Làm sao xử lý khi thanh toán thất bại hoặc hủy?
**Trả lời gợi ý:**
- Webhook từ PayOS thông báo trạng thái
- Nếu hủy: Cập nhật đơn hàng thành "hủy", hoàn lại tồn kho
- Nếu thất bại: Cho phép user thử lại hoặc chọn COD
- Timeout: Tự động hủy đơn sau thời gian nhất định

#### Q15: Làm sao quản lý tồn kho khi đặt hàng?
**Trả lời gợi ý:**
- Khi tạo đơn hàng: Giảm tồn kho ngay lập tức
- Khi hủy đơn: Hoàn lại tồn kho
- Kiểm tra tồn kho trước khi thêm vào giỏ
- Hiển thị cảnh báo khi sản phẩm hết hàng

#### Q16: Giải thích hệ thống voucher/mã giảm giá?
**Trả lời gợi ý:**
- Bảng `magiamgia` lưu thông tin voucher
- Hỗ trợ 2 loại: phần trăm và số tiền cố định
- Kiểm tra điều kiện: đơn tối thiểu, thời hạn, số lần sử dụng
- Bảng `voucher_sudung` theo dõi lịch sử sử dụng
- Validate voucher trước khi áp dụng

#### Q17: Làm sao xử lý đánh giá sản phẩm?
**Trả lời gợi ý:**
- Chỉ cho phép đánh giá sau khi đơn hàng "hoàn thành"
- Mỗi user chỉ đánh giá 1 lần cho mỗi sản phẩm trong đơn
- Lưu số sao (0-5) và nội dung đánh giá
- Admin có thể trả lời đánh giá
- Tính trung bình sao để hiển thị

---

### 11.5 Câu hỏi về Hiệu suất & Tối ưu

#### Q18: Làm sao tối ưu hiệu suất database?
**Trả lời gợi ý:**
- Đánh index trên các cột thường xuyên query
- Sử dụng connection pool thay vì tạo connection mới
- Pagination cho danh sách dài
- Chỉ SELECT các cột cần thiết
- Sử dụng JOIN thay vì nhiều query riêng lẻ

#### Q19: Làm sao xử lý upload hình ảnh?
**Trả lời gợi ý:**
- Nén ảnh phía client trước khi upload (max 800x800px, quality 0.8)
- Encode base64 để gửi qua API
- Lưu đường dẫn ảnh trong database
- Sử dụng lazy loading cho hình ảnh
- Fallback image khi ảnh không tồn tại

#### Q20: Làm sao xử lý khi nhiều người cùng mua một sản phẩm?
**Trả lời gợi ý:**
- Kiểm tra tồn kho trước khi tạo đơn
- Sử dụng transaction để đảm bảo tính nhất quán
- Giảm tồn kho ngay khi tạo đơn (không đợi thanh toán)
- Hiển thị thông báo nếu sản phẩm hết hàng

---

### 11.6 Câu hỏi về Triển khai & Vận hành

#### Q21: Làm sao triển khai hệ thống lên production?
**Trả lời gợi ý:**
- Backend: Deploy lên VPS hoặc cloud (AWS, Heroku, DigitalOcean)
- Frontend: Deploy lên static hosting (Netlify, Vercel) hoặc cùng server
- Database: MySQL trên cloud (AWS RDS, PlanetScale)
- Cấu hình biến môi trường cho production
- Sử dụng PM2 để quản lý Node.js process
- Cấu hình HTTPS với SSL certificate

#### Q22: Làm sao xử lý lỗi và logging?
**Trả lời gợi ý:**
- Try-catch cho tất cả async operations
- Bảng `activity_log` ghi lại hoạt động quan trọng
- Console.log với emoji để dễ debug
- Trả về error message rõ ràng cho frontend
- Không expose stack trace cho user

#### Q23: Làm sao backup và restore database?
**Trả lời gợi ý:**
- Sử dụng mysqldump để backup định kỳ
- Lưu backup trên cloud storage (S3, Google Cloud)
- Có script restore từ backup
- Test restore định kỳ để đảm bảo backup hoạt động

---

### 11.7 Câu hỏi về Mở rộng & Cải tiến

#### Q24: Nếu có thêm thời gian, bạn sẽ cải tiến gì?
**Trả lời gợi ý:**
- Thêm authentication với JWT token
- Implement caching với Redis
- Thêm email notification
- Tích hợp API vận chuyển (GHN, GHTK)
- Xây dựng mobile app
- Thêm chat support real-time
- Implement recommendation system

#### Q25: Làm sao scale hệ thống khi traffic tăng?
**Trả lời gợi ý:**
- Horizontal scaling: Thêm server và load balancer
- Database replication: Master-slave setup
- Caching layer: Redis cho session và data thường xuyên truy cập
- CDN cho static files (images, CSS, JS)
- Microservices architecture cho các module độc lập

#### Q26: Làm sao thêm tính năng đa ngôn ngữ?
**Trả lời gợi ý:**
- Tạo file JSON chứa translations
- Thêm cột ngôn ngữ trong database cho content động
- Detect ngôn ngữ từ browser hoặc user preference
- Sử dụng i18n library cho frontend

---

### 11.8 Câu hỏi về Testing & Quality

#### Q27: Bạn đã test hệ thống như thế nào?
**Trả lời gợi ý:**
- Manual testing cho tất cả user flows
- Test trên nhiều trình duyệt (Chrome, Firefox, Safari)
- Test responsive trên mobile devices
- Test các edge cases (giỏ hàng trống, hết hàng, voucher hết hạn)
- Test thanh toán với PayOS sandbox

#### Q28: Làm sao đảm bảo code quality?
**Trả lời gợi ý:**
- Tổ chức code theo modules (controllers, routes)
- Đặt tên biến và function rõ ràng
- Comment cho logic phức tạp
- Sử dụng ES6+ syntax
- Consistent coding style

---

### 11.9 Câu hỏi Tình huống

#### Q29: Nếu server bị crash giữa lúc thanh toán, xử lý thế nào?
**Trả lời gợi ý:**
- PayOS webhook sẽ retry nếu không nhận được response
- Đơn hàng đã được tạo trong database với trạng thái "chờ xác nhận"
- Khi server restart, webhook tiếp theo sẽ cập nhật trạng thái
- User có thể kiểm tra trạng thái đơn hàng trong tài khoản

#### Q30: Nếu có bug trong production, xử lý thế nào?
**Trả lời gợi ý:**
- Kiểm tra logs để xác định nguyên nhân
- Rollback về version trước nếu cần
- Hotfix và deploy nhanh
- Thông báo cho user nếu ảnh hưởng lớn
- Post-mortem để tránh lặp lại

#### Q31: Làm sao xử lý khi khách hàng khiếu nại đơn hàng?
**Trả lời gợi ý:**
- Hệ thống ticket hỗ trợ (`yeucau_hotro`)
- Admin xem chi tiết đơn hàng và lịch sử thanh toán
- Kiểm tra logs hoạt động
- Liên hệ PayOS nếu liên quan đến thanh toán
- Cập nhật trạng thái ticket và phản hồi khách hàng

---

### 11.10 Câu hỏi về Kinh nghiệm & Học hỏi

#### Q32: Khó khăn lớn nhất khi làm dự án là gì?
**Trả lời gợi ý:**
- Tích hợp PayOS và xử lý webhook
- Đồng bộ trạng thái giữa frontend và backend
- Xử lý các edge cases trong checkout flow
- Tối ưu hiệu suất với nhiều sản phẩm
- Thiết kế database phù hợp

#### Q33: Bạn học được gì từ dự án này?
**Trả lời gợi ý:**
- Xây dựng hệ thống e-commerce hoàn chỉnh
- Tích hợp payment gateway
- Thiết kế RESTful API
- Quản lý state và authentication
- Tối ưu database và queries
- Xử lý các tình huống thực tế trong e-commerce

---

## 12. HƯỚNG DẪN CHẠY DỰ ÁN

### 12.1 Yêu cầu hệ thống
- Node.js >= 16.x
- MySQL >= 8.0
- NPM hoặc Yarn

### 12.2 Cài đặt Database
```bash
mysql -u root -p < goojodoq_db.sql
```

### 12.3 Cấu hình Backend
```bash
cd Goojodoq_Backend
npm install

# Tạo file .env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=goojodoq_db
DB_PORT=3306
PAYOS_CLIENT_ID=xxx
PAYOS_API_KEY=xxx
PAYOS_CHECKSUM_KEY=xxx
PORT=3001

# Chạy server
npm start
```

### 12.4 Cấu hình Frontend
```bash
cd Goojodoq_Frontend
npm install
node server.js  # Chạy trên port 8080
```

### 12.5 Truy cập
- Frontend: http://localhost:8080
- Backend API: http://localhost:3001/api
- Admin: http://localhost:8080/admin-login.html

---

*Tài liệu được tạo tự động từ phân tích mã nguồn dự án GOOJODOQ*
