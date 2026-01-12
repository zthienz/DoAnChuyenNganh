# Scripts

## Tạo dữ liệu đơn hàng mẫu

Để test trang tổng doanh thu, bạn có thể chạy script tạo dữ liệu mẫu:

```bash
cd Goojodoq_Backend
node scripts/seed-orders.js
```

Script này sẽ tạo 30 đơn hàng mẫu với:
- 70% đơn hàng hoàn thành
- 10% đơn hàng bị hủy
- 10% đơn hàng đang giao
- 10% đơn hàng chờ xác nhận
- Ngày tạo random trong 3 tháng gần đây

## Lưu ý

- Đảm bảo database đã có dữ liệu người dùng và sản phẩm
- Script sẽ tự động tạo địa chỉ nếu chưa có
