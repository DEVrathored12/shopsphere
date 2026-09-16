import { ApiError } from "../utils/apiResponse.js";

/**
 * 404 handler — mounted after all routes. Anything that reaches here
 * did not match any registered route.
 */
export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Centralized error handler. Every error in the app (thrown ApiError,
 * Mongoose validation errors, JWT errors, or unexpected exceptions)
 * flows through here and is returned in a consistent JSON shape.
 *
 * Must be registered last, after all routes and other middleware.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";
  let errors = err.errors || [];

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => e.message);
  }

  // Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field
      ? `${field} already exists`
      : "Duplicate value violates a unique constraint";
  }

  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token has expired";
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
