import { body } from "express-validator";

const exactlyOneTarget = (value, { req }) => {
  const hasShop = Boolean(req.body.shopId);
  const hasProduct = Boolean(req.body.productId);
  if (hasShop === hasProduct) {
    throw new Error("Provide exactly one of shopId or productId");
  }
  return true;
};

export const favoriteTargetValidator = [
  body("shopId").optional().isMongoId().withMessage("Invalid shop id"),
  body("productId").optional().isMongoId().withMessage("Invalid product id"),
  body("shopId").custom(exactlyOneTarget),
];
