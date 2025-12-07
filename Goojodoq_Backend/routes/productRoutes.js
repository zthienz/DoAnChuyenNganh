import express from "express";
import { 
  getAllProducts, 
  createProduct, 
  getProductById, 
  deleteProduct, 
  toggleProductVisibility,
  updateProduct,
  getBestSellingProducts,
  getSlowSellingProducts,
  getFeaturedProducts
} from "../controllers/productController.js";
import {
  getProductsBySection,
  getAllProductsInSection,
  addProductToSection,
  removeProductFromSection,
  toggleProductInSection,
  updateProductInSection,
  updateProductOrder,
  getAvailableProducts
} from "../controllers/productSectionController.js";

const router = express.Router();

// Statistics routes - PHẢI ĐẶT TRƯỚC các routes có tham số động
router.get("/stats/best-selling", getBestSellingProducts); // Top 10 sản phẩm bán chạy
router.get("/stats/slow-selling", getSlowSellingProducts); // Top 10 sản phẩm bán ế
router.get("/stats/featured", getFeaturedProducts); // Top 12 sản phẩm nổi bật

// Product section routes - PHẢI ĐẶT TRƯỚC /:id
router.get("/sections/:sectionCode", getProductsBySection); // Public: Get visible products in section
router.get("/sections/:sectionCode/all", getAllProductsInSection); // Admin: Get all products (including hidden)
router.get("/sections/:sectionCode/available", getAvailableProducts); // Admin: Get products not in section
router.post("/sections/:sectionCode/products", addProductToSection); // Admin: Add product to section
router.delete("/sections/:sectionCode/products/:productId", removeProductFromSection); // Admin: Remove from section
router.patch("/sections/:sectionCode/products/:productId/toggle", toggleProductInSection); // Admin: Hide/show in section
router.put("/sections/:sectionCode/products/:productId", updateProductInSection); // Admin: Update custom info
router.put("/sections/:sectionCode/order", updateProductOrder); // Admin: Update product order

// Original product routes - Đặt sau để tránh conflict
router.get("/", getAllProducts);
router.post("/", createProduct);
router.get("/:id", getProductById); // Route này phải đặt cuối cùng
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.patch("/:id/visibility", toggleProductVisibility)

export default router;
