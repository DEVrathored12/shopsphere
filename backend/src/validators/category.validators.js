import { body, param } from "express-validator";

export const createCategoryValidator = [
  body("name").trim().notEmpty().withMessage("Category name is required").isLength({ max: 60 }),
  body("description").optional({ values: "falsy" }).trim().isLength({ max: 300 }),
  body("icon").optional({ values: "falsy" }).trim(),
  body("image").optional({ values: "falsy" }).trim(),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
];

export const updateCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid category id"),
  body("name").optional().trim().notEmpty().withMessage("Category name cannot be empty").isLength({ max: 60 }),
  body("description").optional({ values: "falsy" }).trim().isLength({ max: 300 }),
  body("icon").optional({ values: "falsy" }).trim(),
  body("image").optional({ values: "falsy" }).trim(),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
];

export const categoryIdValidator = [param("id").isMongoId().withMessage("Invalid category id")];
