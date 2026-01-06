import PayOS from "@payos/node";
import { pool } from "../config/db.js";

// PayOS configuration
const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

// Tạo link thanh toán PayOS
export const createPaymentLink = async (req, res) => {
  try {
    const { orderId, amount, description, returnUrl, cancelUrl } = req.body;

    console.log('🏦 Creating PayOS payment link:', { orderId, amount, description });

    // Validate input
    if (!orderId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Thông tin đơn hàng không hợp lệ'
      });
    }

    // Validate PayOS credentials
    if (!process.env.PAYOS_CLIENT_ID || !process.env.PAYOS_API_KEY || !process.env.PAYOS_CHECKSUM_KEY) {
      console.error('❌ Missing PayOS credentials');
      return res.status(500).json({
        success: false,
        error: 'Cấu hình PayOS chưa đầy đủ'
      });
    }

    // Kiểm tra đơn hàng có tồn tại không
    const [orders] = await pool.query(
      'SELECT * FROM donhang WHERE id_donhang = ?',
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy đơn hàng'
      });
    }

    const order = orders[0];

    // Tạo orderCode unique và đảm bảo là số nguyên dương
    const timestamp = Date.now();
    const orderCode = parseInt(`${timestamp}`.slice(-8) + `${orderId}`.padStart(2, '0')); // 8 số từ timestamp + 2 số từ orderId

    console.log('🔢 Generated orderCode:', orderCode);

    // Validate amount (PayOS yêu cầu amount >= 2000 VND)
    const paymentAmount = parseInt(amount);
    if (paymentAmount < 2000) {
      return res.status(400).json({
        success: false,
        error: 'Số tiền thanh toán tối thiểu là 2,000 VND'
      });
    }

    // Tạo payment data theo đúng format PayOS API v2
    // PayOS yêu cầu description tối đa 25 ký tự
    const shortDescription = description && description.length <= 25 
      ? description 
      : `DH${orderId}`;
    
    const paymentData = {
      orderCode: orderCode,
      amount: paymentAmount,
      description: shortDescription,
      items: [
        {
          name: `DH${order.ma_donhang}`,
          quantity: 1,
          price: paymentAmount
        }
      ],
      returnUrl: returnUrl || `http://localhost:8080/payment-success.html?orderId=${orderId}`,
      cancelUrl: cancelUrl || `http://localhost:8080/payment-cancel.html?orderId=${orderId}`
    };

    console.log('💳 PayOS payment data:', JSON.stringify(paymentData, null, 2));

    // Tạo payment link
    const paymentLinkResponse = await payOS.createPaymentLink(paymentData);

    console.log('✅ PayOS response:', paymentLinkResponse);

    // Lưu thông tin payment vào database
    await pool.query(
      `INSERT INTO payment_transactions 
       (id_donhang, order_code, amount, payment_method, status, payment_url, created_at) 
       VALUES (?, ?, ?, 'payos', 'pending', ?, NOW())`,
      [orderId, orderCode, paymentAmount, paymentLinkResponse.checkoutUrl]
    );

    res.json({
      success: true,
      paymentUrl: paymentLinkResponse.checkoutUrl,
      orderCode: orderCode,
      qrCode: paymentLinkResponse.qrCode || null
    });

  } catch (error) {
    console.error('❌ PayOS error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data || 'No response data'
    });
    
    res.status(500).json({
      success: false,
      error: `Lỗi tạo link thanh toán: ${error.message}`
    });
  }
};

// Xử lý webhook từ PayOS
export const handlePayOSWebhook = async (req, res) => {
  try {
    console.log('🔔 PayOS webhook received:', req.body);

    const webhookData = req.body;
    
    // Verify webhook signature (optional but recommended)
    // const isValidSignature = payOS.verifyPaymentWebhookData(webhookData);
    // if (!isValidSignature) {
    //   return res.status(400).json({ error: 'Invalid signature' });
    // }

    const { orderCode, code, desc, success } = webhookData;

    if (!orderCode) {
      return res.status(400).json({ error: 'Missing orderCode' });
    }

    // Tìm transaction
    const [transactions] = await pool.query(
      'SELECT * FROM payment_transactions WHERE order_code = ?',
      [orderCode]
    );

    if (transactions.length === 0) {
      console.log('⚠️ Transaction not found:', orderCode);
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = transactions[0];
    const orderId = transaction.id_donhang;

    // Cập nhật trạng thái transaction
    const newStatus = success ? 'completed' : 'failed';
    await pool.query(
      `UPDATE payment_transactions 
       SET status = ?, response_code = ?, response_desc = ?, updated_at = NOW() 
       WHERE order_code = ?`,
      [newStatus, code, desc, orderCode]
    );

    // Nếu thanh toán thành công, cập nhật trạng thái đơn hàng
    if (success) {
      console.log('🔄 Updating order payment status for orderId:', orderId);
      
      const updateResult = await pool.query(
        `UPDATE donhang 
         SET trangthai_thanhtoan = 'da_tt', phuongthuc_thanhtoan = 'bank_transfer', 
             ngay_capnhat = NOW() 
         WHERE id_donhang = ?`,
        [orderId]
      );

      console.log('✅ Payment successful for order:', orderId);
      console.log('📊 Update result:', updateResult);
      
      // Kiểm tra lại trạng thái sau khi cập nhật
      const [updatedOrder] = await pool.query(
        'SELECT trangthai, trangthai_thanhtoan, phuongthuc_thanhtoan FROM donhang WHERE id_donhang = ?',
        [orderId]
      );
      console.log('🔍 Order status after update:', updatedOrder[0]);
      
    } else {
      console.log('❌ Payment failed for order:', orderId, 'Reason:', desc);
    }

    res.json({ success: true });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Kiểm tra trạng thái thanh toán
export const checkPaymentStatus = async (req, res) => {
  try {
    const { orderCode } = req.params;

    console.log('🔍 Checking payment status for:', orderCode);

    // Lấy thông tin từ PayOS
    const paymentInfo = await payOS.getPaymentLinkInformation(orderCode);

    // Cập nhật database
    const status = paymentInfo.status === 'PAID' ? 'completed' : 
                   paymentInfo.status === 'CANCELLED' ? 'cancelled' : 'pending';

    await pool.query(
      `UPDATE payment_transactions 
       SET status = ?, updated_at = NOW() 
       WHERE order_code = ?`,
      [status, orderCode]
    );

    // Nếu thanh toán thành công, cập nhật đơn hàng
    if (status === 'completed') {
      const [transactions] = await pool.query(
        'SELECT id_donhang FROM payment_transactions WHERE order_code = ?',
        [orderCode]
      );

      if (transactions.length > 0) {
        await pool.query(
          `UPDATE donhang 
           SET trangthai = 'cho_xacnhan', phuongthuc_thanhtoan = 'payos' 
           WHERE id_donhang = ?`,
          [transactions[0].id_donhang]
        );
      }
    }

    res.json({
      success: true,
      status: status,
      paymentInfo: paymentInfo
    });

  } catch (error) {
    console.error('❌ Check payment status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Hủy thanh toán
export const cancelPayment = async (req, res) => {
  try {
    const { orderCode } = req.params;
    const { reason } = req.body;

    console.log('❌ Cancelling payment:', orderCode, 'Reason:', reason);

    // Hủy payment link trên PayOS
    const cancelResult = await payOS.cancelPaymentLink(orderCode, reason);

    // Cập nhật database
    await pool.query(
      `UPDATE payment_transactions 
       SET status = 'cancelled', response_desc = ?, updated_at = NOW() 
       WHERE order_code = ?`,
      [reason || 'Cancelled by user', orderCode]
    );

    res.json({
      success: true,
      message: 'Đã hủy thanh toán thành công'
    });

  } catch (error) {
    console.error('❌ Cancel payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};