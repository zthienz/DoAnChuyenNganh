import express from "express";
import { 
  createPaymentLink, 
  handlePayOSWebhook, 
  checkPaymentStatus, 
  cancelPayment 
} from "../controllers/paymentController.js";

const router = express.Router();

// Tạo link thanh toán PayOS
router.post("/create", createPaymentLink);

// Webhook từ PayOS
router.post("/webhook", handlePayOSWebhook);

// Kiểm tra trạng thái thanh toán
router.get("/status/:orderCode", checkPaymentStatus);

// Hủy thanh toán
router.post("/cancel/:orderCode", cancelPayment);

export default router;