import { Router } from "express";
import { getReviews, createReview, updateReview, deleteReview } from "../controllers/review.controller.js";
import { createReviewValidator, updateReviewValidator, listReviewsValidator, reviewIdValidator } from "../validators/review.validators.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";

const router = Router();

router.get("/", listReviewsValidator, validate, getReviews);
router.post("/", protect, authorize("customer"), createReviewValidator, validate, createReview);
router.put("/:id", protect, authorize("customer"), reviewIdValidator, updateReviewValidator, validate, updateReview);
router.delete("/:id", protect, reviewIdValidator, validate, deleteReview);

export default router;
