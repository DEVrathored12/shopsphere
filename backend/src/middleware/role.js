import { ApiError } from "../utils/apiResponse.js";

/**
 * Restricts a route to one or more roles. Must be used after `protect`,
 * since it relies on req.user being already populated.
 *
 * Usage:
 *   router.post("/", protect, authorize("shop_owner"), handler)
 *   router.get("/", protect, authorize("admin", "shop_owner"), handler)
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(403, "You do not have permission to perform this action")
      );
    }

    next();
  };
};
