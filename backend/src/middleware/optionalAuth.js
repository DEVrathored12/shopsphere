import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

/**
 * Like `protect`, but never blocks the request. If a valid Bearer
 * token is present, req.user is populated (so e.g. a shop owner can
 * see their own inactive shop on the "public" detail route); if it's
 * missing, malformed, or invalid, the request just proceeds anonymously.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return next();
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (err) {
    // Invalid/expired token on an optional route — proceed anonymously
    // rather than failing the request.
    next();
  }
};
