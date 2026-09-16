import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/apiResponse.js";
import User from "../models/User.js";

/**
 * Verifies the Authorization: Bearer <token> header, loads the
 * corresponding user, and attaches it to req.user. Rejects missing,
 * malformed, or invalid tokens, and rejects deactivated accounts.
 *
 * Any thrown ApiError (or JWT error) is forwarded to the centralized
 * error handler via next(err).
 */
export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new ApiError(401, "Authentication token missing or malformed");
    }

    // Throws JsonWebTokenError / TokenExpiredError on invalid tokens,
    // which the centralized error handler translates to a 401.
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new ApiError(401, "User for this token no longer exists");
    }

    if (!user.isActive) {
      throw new ApiError(403, "This account has been deactivated");
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
