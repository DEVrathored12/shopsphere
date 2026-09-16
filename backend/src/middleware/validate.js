import { validationResult } from "express-validator";
import { ApiError } from "../utils/apiResponse.js";

/**
 * Runs after an express-validator chain array. If any validator failed,
 * forwards a 400 ApiError with the field-level messages; otherwise
 * calls next() to proceed to the controller.
 */
export const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => e.msg);
  next(new ApiError(400, "Validation failed", errors));
};
