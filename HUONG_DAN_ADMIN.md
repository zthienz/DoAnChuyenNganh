# HƯỚNG DẪN SỬ DỤNG CHỨC NĂNG ADMIN

## 🔐 ĐĂNG NHẬP ADMIN

### Bước 1: Truy cập trang đăng nhập
```
frontend/admin-login.html
```

### Bước 2: Đăng nhập với tài khoản
- **Email:** admin@goojodoq.com
- **Mật khẩu:** password

### Bước 3: Sau khi đăng nhập thành công
- Hệ thống sẽ chuyển về trang chủ
- Góc trên phải sẽ hiển thị nút "Admin Mode: ON" màu đỏ
- Ở cuối mỗi danh sách sản phẩm sẽ xuất hiện ô "Thêm sản phẩm mới"

---

## ➕ THÊM SẢN PHẨM MỚI

### Cách 1: Từ trang chủ (index.html)
1. Đăng nhập với tài khoản admin
2. Cuộn xuống phần "Sản phẩm nổi bật"
3. Click vào ô "Thêm sản phẩm mới" (ô màu tím với icon +)
4. Điền thông tin sản phẩm

### Cách 2: Từ trang Shop (shop.html)
1. Đăng nhập với tài khoản admin
2. Vào trang Shop
3. Ô "Thêm sản phẩm mới" sẽ xuất hiện ở đầu danh sách
4. Click vào để thêm sản phẩm

---

## 📝 ĐIỀN THÔNG TIN SẢN PHẨM

### 1. Hình ảnh sản phẩm (Bắt buộc)
- **Ảnh chính:** Click vào ô lớn để upload (Max: 5MB)
- **Ảnh phụ:** Tối đa 4 ảnh (không bắt buộc)
- **Định dạng:** PNG, JPG
- **Xóa ảnh:** Hover vào ảnh và click nút X

### 2. Thông tin cơ bản (Bắt buộc)
- **Tên sản phẩm:** Tên đầy đủ của sản phẩm
- **SKU:** Mã sản phẩm (tự động tạo nếu để trống)
- **Danh mục:** Chọn từ dropdown
- **Thương hiệu:** Mặc định là GOOJODOQ
- **Mô tả ngắn:** 1-2 câu giới thiệu
- **Mô tả chi tiết:** Thông tin đầy đủ về sản phẩm

### 3. Giá bán (Bắt buộc)
- **Giá gốc:** Giá bán thường (VNĐ)
- **Giá khuyến mãi:** Để trống nếu không giảm giá
- **Số lượng:** Số lượng tồn kho

### 4. Thông số kỹ thuật (Không bắt buộc)
- Trọng lượng (g)
- Kích thước (cm)
- Xuất xứ
- Bảo hành (tháng)

### 5. Trạng thái sản phẩm
- ✅ **Kích hoạt sản phẩm:** Hiển thị trên website
- ⭐ **Sản phẩm nổi bật:** Hiển thị ở trang chủ
- 🆕 **Sản phẩm mới:** Có badge "MỚI"

---

## 💾 LƯU SẢN PHẨM

### Nút "Thêm sản phẩm"
- Kiểm tra tất cả thông tin bắt buộc
- Validate giá, SKU, ảnh
- Lưu vào localStorage (tạm thời)
- Hiển thị thông báo thành công
- Tự động quay lại trang trước đó

### Nút "Hủy"
- Hủy bỏ tất cả thông tin đã nhập
- Quay lại trang trước đó
- Có xác nhận trước khi hủy

---

## 🔍 XEM SẢN PHẨM VỪA THÊM

Sau khi thêm sản phẩm thành công:
1. Hệ thống tự động quay lại trang trước (index.html hoặc shop.html)
2. Sản phẩm mới sẽ hiển thị ngay trong danh sách
3. Có thể thấy ảnh, tên, giá của sản phẩm vừa thêm

---

## 📍 VỊ TRÍ Ô "THÊM SẢN PHẨM"

### Trang chủ (index.html)
- Xuất hiện ở cuối phần "Sản phẩm nổi bật"
- Sau 8 sản phẩm hiện có
- Ô màu tím gradient với icon +

### Trang Shop (shop.html)
- Xuất hiện ở trang đầu tiên (page 1)
- Nằm cùng hàng với các sản phẩm khác
- Chỉ hiển thị khi ở trang 1

---

## 🚪 THOÁT CHẾ độ ADMIN

### Cách 1: Click nút "Admin Mode: ON"
1. Click vào nút màu đỏ ở góc trên phải
2. Xác nhận thoát
3. Trang sẽ reload và trở về chế độ người dùng

### Cách 2: Xóa localStorage
```javascript
localStorage.setItem('isAdminMode', 'false');
localStorage.removeItem('adminEmail');
```

---

## 💡 LƯU Ý QUAN TRỌNG

### 1. Dữ liệu tạm thời
- Hiện tại sản phẩm được lưu vào **localStorage**
- Chỉ tồn tại trên trình duyệt hiện tại
- Xóa cache sẽ mất dữ liệu

### 2. Kết nối Database sau
Để lưu vĩnh viễn, cần:
- Tạo API endpoint POST `/api/products`
- Upload ảnh lên server
- Lưu vào MySQL database
- Cập nhật `add-product.js` để gọi API

### 3. Validation
- SKU phải unique (không trùng)
- Giá khuyến mãi < Giá gốc
- Ảnh chính bắt buộc
- Kích thước ảnh max 5MB

### 4. Tính năng chưa có
- ❌ Sửa sản phẩm
- ❌ Xóa sản phẩm
- ❌ Upload ảnh lên server
- ❌ Quản lý đơn hàng
- ❌ Thống kê doanh thu

---

## 🎯 DEMO FLOW

### Quy trình hoàn chỉnh:

1. **Đăng nhập Admin**
   ```
   admin-login.html
   → Email: admin@goojodoq.com
   → Password: password
   → Click "Đăng nhập"
   ```

2. **Vào trang chủ**
   ```
   index.html
   → Thấy nút "Admin Mode: ON" màu đỏ
   → Cuộn xuống "Sản phẩm nổi bật"
   → Thấy ô "Thêm sản phẩm mới"
   ```

3. **Thêm sản phẩm**
   ```
   Click "Thêm sản phẩm mới"
   → Upload ảnh chính
   → Điền tên: "GOOJODOQ Tai nghe Gaming Pro"
   → SKU: Tự động tạo
   → Danh mục: Tai nghe Bluetooth
   → Giá: 899000
   → Giá KM: 799000
   → Số lượng: 50
   → Mô tả ngắn: "Tai nghe gaming chuyên nghiệp"
   → Mô tả chi tiết: "..."
   → Check "Kích hoạt", "Nổi bật", "Mới"
   → Click "Thêm sản phẩm"
   ```

4. **Xem kết quả**
   ```
   Tự động quay lại index.html
   → Sản phẩm mới xuất hiện trong danh sách
   → Có ảnh, tên, giá, badge "MỚI"
   ```

---

## 🔧 TROUBLESHOOTING

### Không thấy ô "Thêm sản phẩm"?
- Kiểm tra đã đăng nhập admin chưa
- Kiểm tra localStorage: `isAdminMode` = true
- Refresh lại trang

### Không thể upload ảnh?
- Kiểm tra kích thước < 5MB
- Chỉ chấp nhận PNG, JPG
- Thử ảnh khác

### Sản phẩm không hiển thị sau khi thêm?
- Kiểm tra localStorage có key `products`
- Refresh lại trang
- Xóa cache và thử lại

### Lỗi SKU đã tồn tại?
- Đổi SKU khác
- Hoặc để trống để tự động tạo

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Kiểm tra Console (F12) xem có lỗi gì
2. Xóa localStorage và thử lại
3. Đăng nhập lại admin
4. Refresh trang

---

## 🎉 KẾT LUẬN

Chức năng Admin đã hoàn thành:
- ✅ Đăng nhập admin
- ✅ Hiển thị ô "Thêm sản phẩm"
- ✅ Form thêm sản phẩm đầy đủ
- ✅ Upload ảnh (preview)
- ✅ Validation form
- ✅ Lưu vào localStorage
- ✅ Hiển thị sản phẩm mới
- ✅ Hoạt động trên cả index.html và shop.html

**Bước tiếp theo:** Kết nối API và database để lưu vĩnh viễn!