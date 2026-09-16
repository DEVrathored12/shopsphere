/**
 * Standardized success response shape used across all controllers.
 */
export const sendSuccess = (res, { statusCode = 200, message, data } = {}) => {
  const body = { success: true };
  if (message) body.message = message;
  if (data !== undefined) body.data = data;
  return res.status(statusCode).json(body);
};

/**
 * Custom error class carrying an HTTP status code and optional
 * field-level error details. Thrown from controllers/middleware and
 * caught by the centralized error handler.
 */
export class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
