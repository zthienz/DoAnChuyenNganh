import express from "express";
import {
  getProductReviews,
  getProductReviewStats,
  getOrderProductsForReview,
  createReview,
  replyToReview,
  deleteReviewReply
} from "../controllers/reviewController.js";

const router = express.Router();

console.log("📝 Review routes module loaded");

// Test route
router.get("/test", (req, res) => {
  console.log("✅ Test route hit!");
  res.json({ message: "Review routes working!" });
});

// Lấy đánh giá của sản phẩm
router.get("/product/:productId", getProductReviews);

// Lấy thống kê đánh giá
router.get("/product/:productId/stats", getProductReviewStats);

// Lấy sản phẩm trong đơn hàng để đánh giá
router.get("/order/:orderId/products", (req, res, next) => {
  console.log("📦 Order products route hit for orderId:", req.params.orderId);
  getOrderProductsForReview(req, res, next);
});

// Tạo đánh giá
router.post("/", createReview);

// Admin trả lời đánh giá
router.post("/:reviewId/reply", replyToReview);

// Xóa trả lời
router.delete("/reply/:replyId", deleteReviewReply);

console.log("📝 Review routes configured");

export default router;
