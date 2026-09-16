import { body, param } from "express-validator";

const PHONE_REGEX = /^[0-9+\-\s]{7,15}$/;
const PINCODE_REGEX = /^[0-9]{4,10}$/;

export const createShopValidator = [
  body("shopName").trim().notEmpty().withMessage("Shop name is required").isLength({ max: 120 }),
  body("category").notEmpty().withMessage("Category is required").isMongoId().withMessage("Invalid category id"),
  body("description").trim().notEmpty().withMessage("Description is required").isLength({ max: 1000 }),
  body("phone").trim().notEmpty().withMessage("Phone is required").matches(PHONE_REGEX).withMessage("Provide a valid phone number"),
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("state").trim().notEmpty().withMessage("State is required"),
  body("pincode").trim().notEmpty().withMessage("Pincode is required").matches(PINCODE_REGEX).withMessage("Provide a valid pincode"),

  body("whatsapp").optional({ values: "falsy" }).trim().matches(PHONE_REGEX).withMessage("Provide a valid WhatsApp number"),
  body("instagram").optional({ values: "falsy" }).trim(),
  body("website").optional({ values: "falsy" }).trim().isURL().withMessage("Provide a valid website URL"),
  body("area").optional({ values: "falsy" }).trim(),
  body("openingHours").optional().isObject().withMessage("openingHours must be an object"),
  body("location").optional().isObject().withMessage("location must be a GeoJSON Point"),
  body("location.coordinates")
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage("location.coordinates must be [longitude, latitude]"),
  body("coverImage").optional({ values: "falsy" }).trim(),
  body("galleryImages").optional().isArray().withMessage("galleryImages must be an array"),
];

export const updateShopValidator = [
  param("id").isMongoId().withMessage("Invalid shop id"),
  body("shopName").optional().trim().notEmpty().withMessage("Shop name cannot be empty").isLength({ max: 120 }),
  body("category").optional().isMongoId().withMessage("Invalid category id"),
  body("description").optional().trim().isLength({ max: 1000 }),
  body("phone").optional().trim().matches(PHONE_REGEX).withMessage("Provide a valid phone number"),
  body("whatsapp").optional({ values: "falsy" }).trim().matches(PHONE_REGEX).withMessage("Provide a valid WhatsApp number"),
  body("instagram").optional({ values: "falsy" }).trim(),
  body("website").optional({ values: "falsy" }).trim().isURL().withMessage("Provide a valid website URL"),
  body("address").optional().trim().notEmpty().withMessage("Address cannot be empty"),
  body("area").optional({ values: "falsy" }).trim(),
  body("city").optional().trim().notEmpty().withMessage("City cannot be empty"),
  body("state").optional().trim().notEmpty().withMessage("State cannot be empty"),
  body("pincode").optional().trim().matches(PINCODE_REGEX).withMessage("Provide a valid pincode"),
  body("openingHours").optional().isObject().withMessage("openingHours must be an object"),
  body("location").optional().isObject().withMessage("location must be a GeoJSON Point"),
  body("coverImage").optional({ values: "falsy" }).trim(),
  body("galleryImages").optional().isArray().withMessage("galleryImages must be an array"),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
  body("isVerified").optional().isBoolean().withMessage("isVerified must be a boolean"),
];

export const shopIdValidator = [param("id").isMongoId().withMessage("Invalid shop id")];
