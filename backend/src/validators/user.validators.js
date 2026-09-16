import { body } from "express-validator";

export const updateProfileValidator = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty").isLength({ max: 100 }),
  body("phone")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^[0-9+\-\s]{7,15}$/)
    .withMessage("Provide a valid phone number"),
  body("avatar").optional({ values: "falsy" }).trim().isURL().withMessage("Avatar must be a valid image URL"),
];

export const changePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("confirmNewPassword")
    .notEmpty()
    .withMessage("Please confirm your new password")
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage("Passwords do not match"),
];
