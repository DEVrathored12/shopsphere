import { body, param, query } from "express-validator";

export const createReviewValidator = [
  body("shopId").notEmpty().withMessage("shopId is required").isMongoId().withMessage("Invalid shop id"),
  body("rating").notEmpty().withMessage("Rating is required").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").optional({ values: "falsy" }).trim().isLength({ max: 1000 }),
];

export const updateReviewValidator = [
  body("rating").optional().isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").optional({ values: "falsy" }).trim().isLength({ max: 1000 }),
];

export const listReviewsValidator = [query("shopId").notEmpty().withMessage("shopId is required").isMongoId().withMessage("Invalid shop id")];

export const reviewIdValidator = [param("id").isMongoId().withMessage("Invalid review id")];
