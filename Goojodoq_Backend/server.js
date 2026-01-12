import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { pool } from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import { getProfile, updateProfile, updateAddress, checkAddress } from "./controllers/profileController.js";
import { createOrder, getAllOrders, getOrders, getOrderDetail, cancelOrder, confirmReceived, confirmOrder, getRevenueStats, getRevenueByPeriod } from "./controllers/orderController.js";
import { getWishlist, addToWishlist, removeFromWishlist, checkWishlist } from "./controllers/wishlistController.js";
import { checkVoucher, getAvailableVouchers, useVoucher, getAllVouchersAdmin, createVoucher, updateVoucher, deleteVoucher } from "./controllers/voucherController.js";
import { getProductReviews, getProductReviewStats, getOrderProductsForReview, createReview, replyToReview, deleteReviewReply } from "./controllers/reviewController.js";
import { getOrderInvoice, getPeriodInvoice } from "./controllers/invoiceController.js";

dotenv.config();

const app = express();
app.use(cors());
// Tăng giới hạn payload để hỗ trợ upload ảnh base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files (images)
app.use('/images', express.static('../Goojodoq_Frontend/images'));


// Get cart by user ID
app.get("/api/cart/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("🛒 GET cart for user:", userId);

    // Get or create cart
    let [carts] = await pool.query(
      'SELECT id_giohang FROM giohang WHERE id_nguoidung = ?',
      [userId]
    );

    if (carts.length === 0) {
      const [result] = await pool.query(
        'INSERT INTO giohang (id_nguoidung) VALUES (?)',
        [userId]
      );
      return res.json({ cart_id: result.insertId, items: [], total: 0 });
    }

    const cartId = carts[0].id_giohang;

    // Get cart items
    const [items] = await pool.query(`
      SELECT 
        ct.id_chitiet,
        ct.id_sanpham,
        ct.soluong,
        ct.gia_donvi,
        sp.ten_sanpham as product_name,
        sp.ma_sku as sku,
        sp.tonkho as stock,
        (SELECT duongdan_anh FROM anh_sanpham WHERE id_sanpham = sp.id_sanpham ORDER BY thu_tu LIMIT 1) AS image
      FROM chitiet_giohang ct
      JOIN sanpham sp ON ct.id_sanpham = sp.id_sanpham
      WHERE ct.id_giohang = ?
      ORDER BY ct.ngay_them DESC
    `, [cartId]);

    const total = items.reduce((sum, item) => sum + (item.soluong * parseFloat(item.gia_donvi)), 0);

    res.json({ cart_id: cartId, items, total });
  } catch (err) {
    console.error("❌ Error in getCart:", err);
    res.status(500).json({ error: err.message });
  }
});

// Add product to cart
app.post("/api/cart/add", async (req, res) => {
  try {
    const { userId, productId, quantity = 1, price } = req.body;
    console.log("🛒 ADD to cart:", { userId, productId, quantity, price });

    if (!userId || !productId || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get or create cart
    let [carts] = await pool.query(
      'SELECT id_giohang FROM giohang WHERE id_nguoidung = ?',
      [userId]
    );

    let cartId;
    if (carts.length === 0) {
      const [result] = await pool.query(
        'INSERT INTO giohang (id_nguoidung) VALUES (?)',
        [userId]
      );
      cartId = result.insertId;
    } else {
      cartId = carts[0].id_giohang;
    }

    // Check if product already in cart
    const [existing] = await pool.query(
      'SELECT id_chitiet, soluong FROM chitiet_giohang WHERE id_giohang = ? AND id_sanpham = ?',
      [cartId, productId]
    );

    if (existing.length > 0) {
      // Update quantity
      await pool.query(
        'UPDATE chitiet_giohang SET soluong = soluong + ? WHERE id_chitiet = ?',
        [quantity, existing[0].id_chitiet]
      );
    } else {
      // Insert new item
      await pool.query(
        'INSERT INTO chitiet_giohang (id_giohang, id_sanpham, soluong, gia_donvi) VALUES (?, ?, ?, ?)',
        [cartId, productId, quantity, price]
      );
    }

    // Update cart timestamp
    await pool.query(
      'UPDATE giohang SET ngay_capnhat = CURRENT_TIMESTAMP WHERE id_giohang = ?',
      [cartId]
    );

    res.json({ success: true, message: 'Đã thêm vào giỏ hàng' });
  } catch (err) {
    console.error("❌ Error in addToCart:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get cart count
app.get("/api/cart/count/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [carts] = await pool.query(
      'SELECT id_giohang FROM giohang WHERE id_nguoidung = ?',
      [userId]
    );

    if (carts.length === 0) {
      return res.json({ count: 0 });
    }

    const [result] = await pool.query(
      'SELECT SUM(soluong) as total FROM chitiet_giohang WHERE id_giohang = ?',
      [carts[0].id_giohang]
    );

    res.json({ count: result[0].total || 0 });
  } catch (err) {
    console.error("❌ Error in getCartCount:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update cart item quantity
app.put("/api/cart/item/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ error: 'Số lượng phải lớn hơn 0' });
    }

    await pool.query(
      'UPDATE chitiet_giohang SET soluong = ? WHERE id_chitiet = ?',
      [quantity, itemId]
    );

    res.json({ success: true, message: 'Đã cập nhật số lượng' });
  } catch (err) {
    console.error("❌ Error in updateCartItem:", err);
    res.status(500).json({ error: err.message });
  }
});

// Remove item from cart
app.delete("/api/cart/item/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;

    await pool.query('DELETE FROM chitiet_giohang WHERE id_chitiet = ?', [itemId]);

    res.json({ success: true, message: 'Đã xóa sản phẩm khỏi giỏ hàng' });
  } catch (err) {
    console.error("❌ Error in removeFromCart:", err);
    res.status(500).json({ error: err.message });
  }
});

// Clear entire cart
app.delete("/api/cart/clear/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [carts] = await pool.query(
      'SELECT id_giohang FROM giohang WHERE id_nguoidung = ?',
      [userId]
    );

    if (carts.length > 0) {
      await pool.query(
        'DELETE FROM chitiet_giohang WHERE id_giohang = ?',
        [carts[0].id_giohang]
      );
    }

    res.json({ success: true, message: 'Đã xóa toàn bộ giỏ hàng' });
  } catch (err) {
    console.error("❌ Error in clearCart:", err);
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// OTHER ROUTES
// =============================================

// Test route
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT COUNT(*) AS total FROM nguoidung");
    res.json({ message: "Database connected!", result: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Product routes
app.use("/api/products", productRoutes);

// Auth routes
app.use("/api/auth", authRoutes);

// Support routes
app.use("/api/support", supportRoutes);

// Category routes
app.use("/api/categories", categoryRoutes);

// Payment routes
app.use("/api/payment", paymentRoutes);

// Activity routes
app.use("/api/activities", activityRoutes);

// =============================================
// PROFILE API ROUTES
// =============================================
app.get("/api/profile/:userId", getProfile);
app.put("/api/profile/:userId", updateProfile);
app.put("/api/profile/:userId/address", updateAddress);
app.get("/api/profile/:userId/check-address", checkAddress);

// =============================================
// ORDER API ROUTES
// =============================================
app.get("/api/orders/user/:userId", getOrders); // User: Get orders by userId
app.get("/api/orders/detail/:orderId", getOrderDetail);
app.get("/api/orders/revenue", getRevenueStats); // Admin: Get revenue statistics
app.get("/api/orders/revenue-chart", getRevenueByPeriod); // Admin: Get revenue chart data
app.get("/api/orders", getAllOrders); // Admin: Get all orders
app.post("/api/orders", createOrder);
app.put("/api/orders/:orderId/cancel", cancelOrder);
app.put("/api/orders/:orderId/received", confirmReceived);
app.put("/api/orders/:orderId/confirm", confirmOrder);

// =============================================
// WISHLIST API ROUTES
// =============================================
app.get("/api/wishlist/:userId", getWishlist);
app.post("/api/wishlist", addToWishlist);
app.delete("/api/wishlist/:userId/:productId", removeFromWishlist);
app.get("/api/wishlist/:userId/:productId/check", checkWishlist);

// =============================================
// VOUCHER API ROUTES
// =============================================
app.post("/api/vouchers/check", checkVoucher);
app.get("/api/vouchers/available", getAvailableVouchers);
app.post("/api/vouchers/use", useVoucher);

// Admin voucher management
app.get("/api/vouchers/admin/all", getAllVouchersAdmin);
app.post("/api/vouchers/admin", createVoucher);
app.put("/api/vouchers/admin/:id", updateVoucher);
app.delete("/api/vouchers/admin/:id", deleteVoucher);

// =============================================
// REVIEW API ROUTES
// =============================================
// Lấy đánh giá của sản phẩm
app.get("/api/reviews/product/:productId", getProductReviews);

// Lấy thống kê đánh giá
app.get("/api/reviews/product/:productId/stats", getProductReviewStats);

// Lấy sản phẩm trong đơn hàng để đánh giá
app.get("/api/reviews/order/:orderId/products", getOrderProductsForReview);

// Tạo đánh giá
app.post("/api/reviews", createReview);

// Admin trả lời đánh giá
app.post("/api/reviews/:reviewId/reply", replyToReview);

// Xóa trả lời
app.delete("/api/reviews/reply/:replyId", deleteReviewReply);

// =============================================
// INVOICE API ROUTES
// =============================================
// Lấy hóa đơn cho 1 đơn hàng
app.get("/api/invoice/order/:orderId", getOrderInvoice);

// Lấy hóa đơn tổng hợp theo khoảng thời gian
app.get("/api/invoice/period", getPeriodInvoice);

// =============================================
// START SERVER
// =============================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`🛒 Cart API: http://localhost:${PORT}/api/cart`);
  console.log(`💳 Payment API: http://localhost:${PORT}/api/payment`);
});
