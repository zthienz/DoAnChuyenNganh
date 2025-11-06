# GOOJODOQ Database Schema

## Tổng quan
Database được thiết kế cho website thương mại điện tử bán phụ kiện điện tử Goojodoq với đầy đủ chức năng:

## Cấu trúc Database

### 1. Bảng chính (Core Tables)
- **users**: Quản lý người dùng (khách hàng & admin)
- **categories**: Danh mục sản phẩm
- **products**: Thông tin sản phẩm
- **product_images**: Hình ảnh sản phẩm

### 2. Bảng thương mại (Commerce Tables)
- **cart**: Giỏ hàng
- **orders**: Đơn hàng
- **order_items**: Chi tiết đơn hàng
- **coupons**: Mã giảm giá
- **coupon_usage**: Lịch sử sử dụng coupon

### 3. Bảng tương tác (Interaction Tables)
- **reviews**: Đánh giá sản phẩm
- **wishlist**: Danh sách yêu thích
- **newsletter_subscriptions**: Đăng ký nhận tin

### 4. Bảng hỗ trợ (Support Tables)
- **contact_messages**: Tin nhắn liên hệ
- **blog_posts**: Bài viết blog
- **website_settings**: Cài đặt website

## Tính năng chính

### Quản lý người dùng
- Đăng ký/đăng nhập
- Phân quyền (customer/admin)
- Xác thực email
- Quản lý thông tin cá nhân

### Quản lý sản phẩm
- Danh mục sản phẩm
- Hình ảnh đa phương tiện
- Quản lý kho
- SEO-friendly URLs
- Sản phẩm nổi bật

### Hệ thống đặt hàng
- Giỏ hàng
- Checkout process
- Nhiều phương thức thanh toán
- Theo dõi trạng thái đơn hàng
- Lịch sử mua hàng

### Tính năng nâng cao
- Hệ thống đánh giá 5 sao
- Wishlist
- Mã giảm giá
- Newsletter
- Blog system
- Contact form

## Cài đặt

1. Tạo database:
```sql
CREATE DATABASE goojodoq_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Import schema:
```bash
mysql -u username -p goojodoq_db < goojodoq_database.sql
```

3. Tài khoản admin mặc định:
- Email: admin@goojodoq.com
- Password: password (cần đổi ngay)

## Tối ưu hóa
- Indexes được tạo cho các truy vấn thường dùng
- Views cho các query phức tạp
- Stored procedures cho business logic
- Triggers đảm bảo tính nhất quán dữ liệu

## Bảo mật
- Mã hóa mật khẩu
- Xác thực email
- Phân quyền người dùng
- Ràng buộc dữ liệu
- Foreign key constraints