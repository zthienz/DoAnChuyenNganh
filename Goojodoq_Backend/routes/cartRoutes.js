import express from "express";
import { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart,
  getCartCount 
} from "../controllers/cartController.js";

const router = express.Router();

// Thêm sản phẩm vào giỏ
router.post("/add", addToCart);

// Cập nhật số lượng
router.put("/item/:itemId", updateCartItem);

// Xóa sản phẩm
router.delete("/item/:itemId", removeFromCart);

// Đếm số sản phẩm trong giỏ (phải đặt trước /:userId)
router.get("/count/:userId", getCartCount);

// Xóa toàn bộ giỏ hàng
router.delete("/clear/:userId", clearCart);

// Lấy giỏ hàng của user (phải đặt cuối cùng)
router.get("/:userId", getCart);

export default router;
