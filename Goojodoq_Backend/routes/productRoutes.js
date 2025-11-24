import express from "express";
import { 
  getAllProducts, 
  createProduct, 
  getProductById, 
  deleteProduct, 
  toggleProductVisibility,
  updateProduct 
} from "../controllers/productController.js";
const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.patch("/:id/visibility", toggleProductVisibility);

export default router;
