import { Router } from "express";
import { updateMe, changePassword } from "../controllers/user.controller.js";
import { updateProfileValidator, changePasswordValidator } from "../validators/user.validators.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.put("/me", protect, updateProfileValidator, validate, updateMe);
router.put("/me/password", protect, changePasswordValidator, validate, changePassword);

export default router;
