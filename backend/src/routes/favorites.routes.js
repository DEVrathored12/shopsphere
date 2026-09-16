import { Router } from "express";
import { getFavorites, addFavorite, removeFavorite } from "../controllers/favorite.controller.js";
import { favoriteTargetValidator } from "../validators/favorite.validators.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getFavorites);
router.post("/", protect, favoriteTargetValidator, validate, addFavorite);
router.delete("/", protect, favoriteTargetValidator, validate, removeFavorite);

export default router;
