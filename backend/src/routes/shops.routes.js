import { Router } from "express";
import {
  getShops,
  getShopById,
  createShop,
  updateShop,
  deleteShop,
} from "../controllers/shop.controller.js";
import {
  createShopValidator,
  updateShopValidator,
  shopIdValidator,
} from "../validators/shop.validators.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
import { authorize } from "../middleware/role.js";

const router = Router();

router.get("/", optionalAuth, getShops);
router.get("/:id", optionalAuth, shopIdValidator, validate, getShopById);

router.post("/", protect, authorize("shop_owner", "admin"), createShopValidator, validate, createShop);
router.put("/:id", protect, updateShopValidator, validate, updateShop);
router.delete("/:id", protect, shopIdValidator, validate, deleteShop);

export default router;
