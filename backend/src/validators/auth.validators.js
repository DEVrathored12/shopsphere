import { body } from "express-validator";

const ALLOWED_PUBLIC_ROLES = ["customer", "shop_owner"];

export const registerValidator = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }),
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Provide a valid email"),
  body("phone")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^[0-9+\-\s]{7,15}$/)
    .withMessage("Provide a valid phone number"),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("confirmPassword")
    .notEmpty().withMessage("Please confirm your password")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
  body("role")
    .optional()
    .isIn(ALLOWED_PUBLIC_ROLES)
    .withMessage("role must be either customer or shop_owner"),
];

export const loginValidator = [
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const ALLOWED_PUBLIC_ROLES_VALUES = ALLOWED_PUBLIC_ROLES;
