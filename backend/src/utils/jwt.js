import jwt from "jsonwebtoken";

const EXPIRES_IN = "7d";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in the environment.");
  }
  return secret;
};

/**
 * Signs a JWT carrying only the minimal payload needed to identify and
 * authorize the user: userId and role. Never embed the password hash
 * or other sensitive fields in the token.
 */
export const generateToken = ({ userId, role }) => {
  return jwt.sign({ userId, role }, getSecret(), { expiresIn: EXPIRES_IN });
};

/**
 * Verifies a JWT and returns its decoded payload.
 * Throws (JsonWebTokenError / TokenExpiredError) on invalid/expired tokens —
 * callers should let this propagate to the centralized error handler.
 */
export const verifyToken = (token) => {
  return jwt.verify(token, getSecret());
};
