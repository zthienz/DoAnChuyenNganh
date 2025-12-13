# GitHub Actions Workflows

Dự án GOOJODOQ sử dụng GitHub Actions để tự động hóa các quy trình CI/CD. Dưới đây là mô tả các workflow:

## 🚀 Workflows

### 1. CI/CD Pipeline (`ci-cd.yml`)
**Trigger:** Push to `main`/`develop`, Pull Request to `main`

**Jobs:**
- **Backend Test**: Kiểm tra backend với MySQL test database
- **Frontend Build**: Validate HTML/CSS/JS và build frontend
- **Security Scan**: Quét bảo mật và kiểm tra dependencies
- **Deploy**: Triển khai tự động (chỉ khi push to main)
- **Notify**: Thông báo kết quả

### 2. Pull Request Check (`pr-check.yml`)
**Trigger:** Pull Request to `main`/`develop`

**Chức năng:**
- Kiểm tra syntax JavaScript
- Validate cấu trúc frontend
- Kiểm tra database schema
- Quét dữ liệu nhạy cảm

### 3. Database Backup (`backup.yml`)
**Trigger:** Hàng ngày lúc 2:00 AM UTC, hoặc manual

**Chức năng:**
- Backup database schema
- Lưu trữ với timestamp
- Upload artifact (lưu 90 ngày)

## 🔧 Cấu hình

### Environment Variables (GitHub Secrets)
Cần thiết lập các secrets sau trong repository:

```
# Database
DB_HOST=your_db_host
DB_USER=your_db_user  
DB_PASS=your_db_password
DB_NAME=goojodoq_db
DB_PORT=3306

# Deployment (nếu cần)
HOST=your_server_ip
USERNAME=your_server_user
SSH_KEY=your_private_key

# PayOS (nếu cần test payment)
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key
```

### Cách thiết lập Secrets:
1. Vào repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Thêm từng secret với tên và giá trị tương ứng

## 📋 Status Badges

Thêm vào README.md chính:

```markdown
![CI/CD](https://github.com/your-username/goojodoq/workflows/GOOJODOQ%20CI/CD%20Pipeline/badge.svg)
![PR Check](https://github.com/your-username/goojodoq/workflows/Pull%20Request%20Checks/badge.svg)
```

## 🛠️ Tùy chỉnh

### Thêm test cases:
1. Tạo thư mục `Goojodoq_Backend/test/`
2. Thêm file test với Jest hoặc Mocha
3. Cập nhật `package.json` với script test

### Cấu hình deployment:
1. Uncomment phần deploy trong `ci-cd.yml`
2. Thiết lập SSH keys và server details
3. Cấu hình PM2 trên server

### Thêm notifications:
- Slack: Sử dụng `8398a7/action-slack`
- Discord: Sử dụng `Ilshidur/action-discord`
- Email: Sử dụng `dawidd6/action-send-mail`

## 📊 Monitoring

Workflows sẽ tạo artifacts:
- **Deployment packages**: Lưu 30 ngày
- **Database backups**: Lưu 90 ngày
- **Test reports**: Lưu 7 ngày

## 🔍 Troubleshooting

### Lỗi thường gặp:

1. **MySQL connection failed**
   - Kiểm tra database credentials
   - Đảm bảo MySQL service đang chạy

2. **Node.js version mismatch**
   - Cập nhật version trong workflow
   - Kiểm tra compatibility

3. **Permission denied**
   - Kiểm tra SSH keys
   - Verify server permissions

### Debug workflows:
1. Vào Actions tab trong GitHub
2. Click vào workflow run bị lỗi
3. Xem logs chi tiết của từng step
4. Kiểm tra Environment variables và Secrets