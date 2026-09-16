import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import { registerValidator, loginValidator } from "../validators/auth.validators.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.get("/me", protect, getMe);

export default router;
