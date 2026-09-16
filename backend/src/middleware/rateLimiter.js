import rateLimit from "express-rate-limit";

/**
 * General-purpose rate limiter applied to all /api routes.
 * Tighter limiters (e.g. for auth endpoints) can be layered on
 * top of this in later phases.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
    errors: [],
  },
});
