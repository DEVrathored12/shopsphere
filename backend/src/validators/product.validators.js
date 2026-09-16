import { body, param } from "express-validator";

const PRICE_TYPES = ["fixed", "starting_from", "contact_shop"];
const AVAILABILITY_VALUES = ["available", "out_of_stock"];

export const createProductValidator = [
  body("shopId").notEmpty().withMessage("shopId is required").isMongoId().withMessage("Invalid shop id"),
  body("name").trim().notEmpty().withMessage("Product name is required").isLength({ max: 150 }),
  body("categoryId").notEmpty().withMessage("categoryId is required").isMongoId().withMessage("Invalid category id"),
  body("description").optional({ values: "falsy" }).trim().isLength({ max: 1000 }),
  body("priceType").optional().isIn(PRICE_TYPES).withMessage(`priceType must be one of ${PRICE_TYPES.join(", ")}`),
  body("price")
    .if(body("priceType").not().equals("contact_shop"))
    .notEmpty().withMessage("price is required unless priceType is contact_shop")
    .bail()
    .isFloat({ min: 0 }).withMessage("price must be a non-negative number"),
  body("images").optional().isArray().withMessage("images must be an array"),
  body("sizes").optional().isArray().withMessage("sizes must be an array"),
  body("colors").optional().isArray().withMessage("colors must be an array"),
  body("availability").optional().isIn(AVAILABILITY_VALUES).withMessage(`availability must be one of ${AVAILABILITY_VALUES.join(", ")}`),
];

export const updateProductValidator = [
  param("id").isMongoId().withMessage("Invalid product id"),
  body("name").optional().trim().notEmpty().withMessage("Product name cannot be empty").isLength({ max: 150 }),
  body("categoryId").optional().isMongoId().withMessage("Invalid category id"),
  body("description").optional({ values: "falsy" }).trim().isLength({ max: 1000 }),
  body("priceType").optional().isIn(PRICE_TYPES).withMessage(`priceType must be one of ${PRICE_TYPES.join(", ")}`),
  body("price").optional().isFloat({ min: 0 }).withMessage("price must be a non-negative number"),
  body("images").optional().isArray().withMessage("images must be an array"),
  body("sizes").optional().isArray().withMessage("sizes must be an array"),
  body("colors").optional().isArray().withMessage("colors must be an array"),
  body("availability").optional().isIn(AVAILABILITY_VALUES).withMessage(`availability must be one of ${AVAILABILITY_VALUES.join(", ")}`),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
];

export const productIdValidator = [param("id").isMongoId().withMessage("Invalid product id")];

export const PRICE_TYPE_VALUES = PRICE_TYPES;
export const AVAILABILITY_QUERY_VALUES = AVAILABILITY_VALUES;
