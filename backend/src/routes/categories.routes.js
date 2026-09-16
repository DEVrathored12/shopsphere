import { Router } from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import {
  createCategoryValidator,
  updateCategoryValidator,
  categoryIdValidator,
} from "../validators/category.validators.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
import { authorize } from "../middleware/role.js";

const router = Router();

router.get("/", optionalAuth, getCategories);
router.get("/:id", optionalAuth, categoryIdValidator, validate, getCategoryById);

router.post("/", protect, authorize("admin"), createCategoryValidator, validate, createCategory);
router.put("/:id", protect, authorize("admin"), updateCategoryValidator, validate, updateCategory);
router.delete("/:id", protect, authorize("admin"), categoryIdValidator, validate, deleteCategory);

export default router;
