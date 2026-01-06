// =============================================
// INVOICE FUNCTIONS - Xuất hóa đơn GOOJODOQ
// =============================================

console.log('📄 Invoice.js loaded successfully');

// Xuất hóa đơn cho 1 đơn hàng
async function exportOrderInvoice(orderId) {
    try {
        console.log('📄 Exporting invoice for order:', orderId);
        
        // Ensure API_BASE_URL is available
        const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api';
        console.log('🔗 Using API_BASE_URL:', API_BASE_URL);
        
        const response = await fetch(`${API_BASE_URL}/invoice/order/${orderId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const invoiceData = await response.json();
        console.log('✅ Invoice data loaded:', invoiceData);
        
        // Tạo HTML hóa đơn
        const invoiceHTML = generateOrderInvoiceHTML(invoiceData);
        
        // Mở cửa sổ mới để in
        const printWindow = window.open('', '_blank');
        printWindow.document.write(invoiceHTML);
        printWindow.document.close();
        
        // Tự động in sau khi load xong
        printWindow.onload = function() {
            printWindow.print();
        };
        
        showNotification('Đã tạo hóa đơn thành công!', 'success');
        
    } catch (error) {
        console.error('❌ Error exporting invoice:', error);
        showNotification('Không thể xuất hóa đơn. Vui lòng thử lại!', 'error');
    }
}

// Xuất hóa đơn tổng hợp theo khoảng thời gian
async function exportPeriodInvoice(fromDate, toDate) {
    try {
        console.log('📊 Exporting period invoice:', { fromDate, toDate });
        
        // Ensure API_BASE_URL is available
        const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api';
        console.log('🔗 Using API_BASE_URL:', API_BASE_URL);
        
        const response = await fetch(`${API_BASE_URL}/invoice/period?fromDate=${fromDate}&toDate=${toDate}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const invoiceData = await response.json();
        console.log('✅ Period invoice data loaded:', invoiceData);
        
        // Tạo HTML hóa đơn tổng hợp
        const invoiceHTML = generatePeriodInvoiceHTML(invoiceData);
        
        // Mở cửa sổ mới để in
        const printWindow = window.open('', '_blank');
        printWindow.document.write(invoiceHTML);
        printWindow.document.close();
        
        // Tự động in sau khi load xong
        printWindow.onload = function() {
            printWindow.print();
        };
        
        showNotification('Đã tạo báo cáo doanh thu thành công!', 'success');
        
    } catch (error) {
        console.error('❌ Error exporting period invoice:', error);
        showNotification('Không thể xuất báo cáo. Vui lòng thử lại!', 'error');
    }
}

// Tạo HTML cho hóa đơn đơn hàng
function generateOrderInvoiceHTML(data) {
    const { order, items, payment, company } = data;
    
    // Format ngày tháng
    const orderDate = new Date(order.ngay_tao).toLocaleDateString('vi-VN');
    const currentDate = new Date().toLocaleDateString('vi-VN');
    
    // Trạng thái đơn hàng
    const statusMap = {
        'cho_xacnhan': { text: 'Chờ xác nhận', class: 'pending' },
        'dang_giao': { text: 'Đang giao', class: 'shipping' },
        'hoanthanh': { text: 'Hoàn thành', class: 'completed' },
        'huy': { text: 'Đã hủy', class: 'cancelled' }
    };
    
    const paymentStatusMap = {
        'chua_tt': { text: 'Chưa thanh toán', class: 'unpaid' },
        'da_tt': { text: 'Đã thanh toán', class: 'paid' }
    };
    
    const paymentMethodMap = {
        'cod': 'Thanh toán khi nhận hàng',
        'bank_transfer': 'Chuyển khoản ngân hàng',
        'momo': 'Ví MoMo',
        'vnpay': 'VNPay',
        'payos': 'PayOS'
    };
    
    const orderStatus = statusMap[order.trangthai] || { text: order.trangthai, class: 'pending' };
    const paymentStatus = paymentStatusMap[order.trangthai_thanhtoan] || { text: order.trangthai_thanhtoan, class: 'unpaid' };
    
    // Tạo danh sách sản phẩm
    let itemsHTML = '';
    let subtotal = 0;
    
    items.forEach((item, index) => {
        const itemTotal = item.soluong * item.gia_donvi;
        subtotal += itemTotal;
        
        itemsHTML += `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td>
                    <strong>${item.ten_sanpham}</strong><br>
                    <small class="text-muted">SKU: ${item.ma_sku}</small>
                </td>
                <td class="text-center">${item.soluong}</td>
                <td class="text-right">${formatCurrency(item.gia_donvi)}</td>
                <td class="text-right">${formatCurrency(itemTotal)}</td>
            </tr>
        `;
    });
    
    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hóa đơn #${order.ma_donhang}</title>
        <link href="/css/invoice.css" rel="stylesheet">
        <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <!-- Header -->
            <div class="invoice-header">
                <div class="company-info">
                    <h1>${company.name}</h1>
                    <p>${company.address}</p>
                    <p>Điện thoại: ${company.phone}</p>
                    <p>Email: ${company.email}</p>
                    <p>Website: ${company.website}</p>
                </div>
                <div class="invoice-title">
                    <h2>HÓA ĐƠN BÁN HÀNG</h2>
                    <p class="invoice-number">Số: ${order.ma_donhang}</p>
                    <p>Ngày: ${currentDate}</p>
                </div>
            </div>
            
            <!-- Chi tiết hóa đơn -->
            <div class="invoice-details">
                <div class="bill-to">
                    <h4>THÔNG TIN KHÁCH HÀNG</h4>
                    <p><strong>Họ tên:</strong> ${order.ten_nguoinhan || order.ten_nguoidung}</p>
                    <p><strong>Email:</strong> ${order.email_nguoidung}</p>
                    <p><strong>Điện thoại:</strong> ${order.sdt}</p>
                    <p><strong>Địa chỉ:</strong> ${order.diachi_chitiet}</p>
                    <p><strong>Thành phố:</strong> ${order.thanhpho}, ${order.quanhuyen}</p>
                </div>
                <div class="invoice-info">
                    <h4>THÔNG TIN ĐƠN HÀNG</h4>
                    <p><strong>Mã đơn hàng:</strong> ${order.ma_donhang}</p>
                    <p><strong>Ngày đặt:</strong> ${orderDate}</p>
                    <p><strong>Trạng thái:</strong> 
                        <span class="order-status ${orderStatus.class}">${orderStatus.text}</span>
                    </p>
                    <p><strong>Thanh toán:</strong> 
                        <span class="payment-status ${paymentStatus.class}">${paymentStatus.text}</span>
                    </p>
                    <p><strong>Phương thức:</strong> ${paymentMethodMap[order.phuongthuc_thanhtoan] || order.phuongthuc_thanhtoan}</p>
                    ${order.ghichu ? `<p><strong>Ghi chú:</strong> ${order.ghichu}</p>` : ''}
                </div>
            </div>
            
            <!-- Bảng sản phẩm -->
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th class="text-center" width="5%">STT</th>
                        <th width="40%">Sản phẩm</th>
                        <th class="text-center" width="10%">SL</th>
                        <th class="text-right" width="20%">Đơn giá</th>
                        <th class="text-right" width="25%">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
            
            <!-- Tổng cộng -->
            <div class="invoice-summary">
                <table class="summary-table">
                    <tr>
                        <td>Tạm tính:</td>
                        <td class="text-right">${formatCurrency(subtotal)}</td>
                    </tr>
                    <tr>
                        <td>Phí vận chuyển:</td>
                        <td class="text-right">0 ₫</td>
                    </tr>
                    <tr>
                        <td><strong>TỔNG CỘNG:</strong></td>
                        <td class="text-right"><strong>${formatCurrency(order.tong_tien)}</strong></td>
                    </tr>
                </table>
            </div>
            
            <!-- Footer -->
            <div class="invoice-footer">
                <p>Cảm ơn quý khách đã mua hàng tại ${company.name}!</p>
                <p>Hóa đơn được tạo tự động bởi hệ thống vào ${new Date().toLocaleString('vi-VN')}</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

// Tạo HTML cho hóa đơn tổng hợp
function generatePeriodInvoiceHTML(data) {
    const { period, summary, completedOrders, paymentStats, topProducts, company } = data;
    
    const fromDate = new Date(period.fromDate).toLocaleDateString('vi-VN');
    const toDate = new Date(period.toDate).toLocaleDateString('vi-VN');
    const currentDate = new Date().toLocaleDateString('vi-VN');
    
    // Tạo bảng đơn hàng hoàn thành
    let ordersHTML = '';
    completedOrders.forEach((order, index) => {
        const orderDate = new Date(order.ngay_tao).toLocaleDateString('vi-VN');
        ordersHTML += `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td>${order.ma_donhang}</td>
                <td>${order.ten_nguoidung || 'N/A'}</td>
                <td>${order.thanhpho || 'N/A'}</td>
                <td class="text-center">${orderDate}</td>
                <td class="text-right">${formatCurrency(order.tong_tien)}</td>
            </tr>
        `;
    });
    
    // Tạo bảng thống kê thanh toán
    let paymentStatsHTML = '';
    paymentStats.forEach(stat => {
        const paymentMethodMap = {
            'cod': 'Thanh toán khi nhận hàng',
            'bank_transfer': 'Chuyển khoản ngân hàng',
            'momo': 'Ví MoMo',
            'vnpay': 'VNPay',
            'payos': 'PayOS'
        };
        
        paymentStatsHTML += `
            <tr>
                <td>${paymentMethodMap[stat.phuongthuc_thanhtoan] || stat.phuongthuc_thanhtoan}</td>
                <td class="text-center">${stat.so_donhang}</td>
                <td class="text-right">${formatCurrency(stat.tong_tien)}</td>
            </tr>
        `;
    });
    
    // Tạo bảng top sản phẩm
    let topProductsHTML = '';
    topProducts.forEach((product, index) => {
        topProductsHTML += `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td>${product.ten_sanpham}</td>
                <td class="text-center">${product.ma_sku}</td>
                <td class="text-center">${product.tong_soluong}</td>
                <td class="text-right">${formatCurrency(product.gia_trungbinh)}</td>
                <td class="text-right">${formatCurrency(product.tong_doanhthu)}</td>
            </tr>
        `;
    });
    
    const successRate = summary.tong_donhang > 0 ? 
        ((summary.donhang_hoanthanh / summary.tong_donhang) * 100).toFixed(1) : 0;
    
    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Báo cáo doanh thu ${fromDate} - ${toDate}</title>
        <link href="/css/invoice.css" rel="stylesheet">
        <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        </style>
    </head>
    <body>
        <div class="invoice-container period-invoice">
            <!-- Header -->
            <div class="invoice-header">
                <div class="company-info">
                    <h1>${company.name}</h1>
                    <p>${company.address}</p>
                    <p>Điện thoại: ${company.phone}</p>
                    <p>Email: ${company.email}</p>
                </div>
                <div class="invoice-title">
                    <h2>BÁO CÁO DOANH THU</h2>
                    <p>Từ ${fromDate} đến ${toDate}</p>
                    <p>Ngày tạo: ${currentDate}</p>
                </div>
            </div>
            
            <!-- Tổng quan -->
            <div class="summary-cards">
                <div class="summary-card">
                    <h5>Tổng đơn hàng</h5>
                    <p class="value">${summary.tong_donhang}</p>
                </div>
                <div class="summary-card">
                    <h5>Đơn hoàn thành</h5>
                    <p class="value">${summary.donhang_hoanthanh}</p>
                </div>
                <div class="summary-card">
                    <h5>Đơn bị hủy</h5>
                    <p class="value">${summary.donhang_huy}</p>
                </div>
                <div class="summary-card">
                    <h5>Tỷ lệ thành công</h5>
                    <p class="value">${successRate}%</p>
                </div>
                <div class="summary-card">
                    <h5>Tổng doanh thu</h5>
                    <p class="value">${formatCurrency(summary.tong_doanhthu || 0)}</p>
                </div>
                <div class="summary-card">
                    <h5>Đơn hàng TB</h5>
                    <p class="value">${formatCurrency(summary.doanhthu_trungbinh || 0)}</p>
                </div>
            </div>
            
            <!-- Thống kê theo phương thức thanh toán -->
            <h3 class="section-title">Thống kê theo phương thức thanh toán</h3>
            <table class="stats-table">
                <thead>
                    <tr>
                        <th>Phương thức</th>
                        <th class="text-center">Số đơn hàng</th>
                        <th class="text-right">Tổng tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${paymentStatsHTML}
                </tbody>
            </table>
            
            <!-- Top sản phẩm bán chạy -->
            <h3 class="section-title">Top 10 sản phẩm bán chạy</h3>
            <table class="stats-table">
                <thead>
                    <tr>
                        <th class="text-center">STT</th>
                        <th>Tên sản phẩm</th>
                        <th class="text-center">SKU</th>
                        <th class="text-center">Số lượng bán</th>
                        <th class="text-right">Giá TB</th>
                        <th class="text-right">Doanh thu</th>
                    </tr>
                </thead>
                <tbody>
                    ${topProductsHTML}
                </tbody>
            </table>
            
            <!-- Chi tiết đơn hàng hoàn thành -->
            <h3 class="section-title">Chi tiết đơn hàng hoàn thành (${summary.donhang_hoanthanh} đơn)</h3>
            <table class="stats-table">
                <thead>
                    <tr>
                        <th class="text-center">STT</th>
                        <th>Mã đơn hàng</th>
                        <th>Khách hàng</th>
                        <th>Thành phố</th>
                        <th class="text-center">Ngày đặt</th>
                        <th class="text-right">Tổng tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${ordersHTML}
                </tbody>
            </table>
            
            <!-- Footer -->
            <div class="invoice-footer">
                <p>Báo cáo được tạo tự động bởi hệ thống ${company.name}</p>
                <p>Thời gian tạo: ${new Date().toLocaleString('vi-VN')}</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

// Format tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}