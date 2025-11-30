import express from "express";
import { 
  getAllProducts, 
  createProduct, 
  getProductById, 
  deleteProduct, 
  toggleProductVisibility,
  updateProduct 
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

// Original product routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.patch("/:id/visibility", toggleProductVisibility);

// Product section routes
router.get("/sections/:sectionCode", getProductsBySection); // Public: Get visible products in section
router.get("/sections/:sectionCode/all", getAllProductsInSection); // Admin: Get all products (including hidden)
router.get("/sections/:sectionCode/available", getAvailableProducts); // Admin: Get products not in section
router.post("/sections/:sectionCode/products", addProductToSection); // Admin: Add product to section
router.delete("/sections/:sectionCode/products/:productId", removeProductFromSection); // Admin: Remove from section
router.patch("/sections/:sectionCode/products/:productId/toggle", toggleProductInSection); // Admin: Hide/show in section
router.put("/sections/:sectionCode/products/:productId", updateProductInSection); // Admin: Update custom info
router.put("/sections/:sectionCode/order", updateProductOrder); // Admin: Update product order

export default router;
