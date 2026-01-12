# HƯỚNG DẪN THIẾT LẬP WEBHOOK PAYOS

## 🚨 VẤN ĐỀ

Webhook PayOS không hoạt động tự động, khiến đơn hàng thanh toán thành công vẫn hiển thị "Chờ thanh toán" thay vì "Đã thanh toán".

## ✅ GIẢI PHÁP

### 1. Cấu hình Webhook URL

**Development:**
```
http://localhost:3000/api/payment/webhook
```

**Production:**
```
https://yourdomain.com/api/payment/webhook
```

### 2. Sử dụng ngrok cho Development

```bash
# Cài đặt ngrok
npm install -g ngrok

# Chạy ngrok
ngrok http 3000

# Sử dụng URL ngrok trong PayOS Dashboard
# Ví dụ: https://abc123.ngrok.io/api/payment/webhook
```

### 3. Cấu hình PayOS Dashboard

1. Đăng nhập PayOS Dashboard
2. Vào Settings > Webhook
3. Thêm Webhook URL
4. Chọn events: Payment Success, Payment Failed

### 4. Kiểm tra Webhook

**Endpoint:** `POST /api/payment/webhook`

**Payload mẫu:**
```json
{
  "orderCode": 1234567890,
  "success": true,
  "code": "00",
  "desc": "Thành công"
}
```

## 🔧 KHẮC PHỤC TẠM THỜI

Nếu webhook chưa hoạt động và khách hàng đã thanh toán thành công:

1. **Kiểm tra đơn hàng:**
```bash
node -e "
import { pool } from './config/db.js';
const [orders] = await pool.query('SELECT * FROM donhang WHERE ma_donhang = ?', ['DH_ORDER_CODE']);
console.log(orders[0]);
await pool.end();
"
```

2. **Cập nhật trạng thái thủ công:**
```bash
node -e "
import { pool } from './config/db.js';
await pool.query('UPDATE donhang SET trangthai_thanhtoan = \"da_tt\" WHERE ma_donhang = ?', ['DH_ORDER_CODE']);
await pool.query('UPDATE payment_transactions SET status = \"completed\" WHERE id_donhang = (SELECT id_donhang FROM donhang WHERE ma_donhang = ?)', ['DH_ORDER_CODE']);
console.log('Updated successfully');
await pool.end();
"
```

## 📋 KẾT QUẢ MONG MUỐN

Sau khi webhook hoạt động đúng:
- 🟡 **Chờ xác nhận** (badge vàng)
- 🔵 **Chuyển khoản QR** (badge xanh dương)  
- 🟢 **Đã thanh toán** (badge xanh lá)
- 🚫 **Nút hủy bị làm mờ** (không thể click)

## 🔍 DEBUG

**Kiểm tra logs server khi thanh toán:**
```bash
# Trong terminal chạy server
console.log('🔔 PayOS webhook received:', req.body);
```

**Test webhook thủ công:**
```bash
curl -X POST http://localhost:3000/api/payment/webhook \
  -H "Content-Type: application/json" \
  -d '{"orderCode": 1234567890, "success": true, "code": "00", "desc": "Thành công"}'
```