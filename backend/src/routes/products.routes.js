import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import {
  createProductValidator,
  updateProductValidator,
  productIdValidator,
} from "../validators/product.validators.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
import { authorize } from "../middleware/role.js";

const router = Router();

router.get("/", optionalAuth, getProducts);
router.get("/:id", optionalAuth, productIdValidator, validate, getProductById);

router.post("/", protect, authorize("shop_owner", "admin"), createProductValidator, validate, createProduct);
router.put("/:id", protect, updateProductValidator, validate, updateProduct);
router.delete("/:id", protect, productIdValidator, validate, deleteProduct);

export default router;
