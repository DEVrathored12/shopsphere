import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import { sendSuccess, ApiError } from "../utils/apiResponse.js";

const ALLOWED_PUBLIC_ROLES = ["customer", "shop_owner"];

/**
 * Strips fields that must never leave the server in an API response.
 */
const toSafeUser = (userDoc) => {
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  delete user.password;
  return user;
};

/**
 * POST /api/auth/register
 * Public registration for customers and shop owners only.
 * Admin accounts can never be created through this endpoint.
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Defense in depth: even though the validator restricts `role`,
    // never allow "admin" to slip through from this public endpoint.
    const requestedRole = role || "customer";
    if (!ALLOWED_PUBLIC_ROLES.includes(requestedRole)) {
      throw new ApiError(403, "You cannot register with this role");
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new ApiError(409, "An account with this email already exists");
    }

    const user = await User.create({
      name,
      email,
      phone,
      password, // hashed automatically by the User model's pre-save hook
      role: requestedRole,
    });

    const token = generateToken({ userId: user._id, role: user.role });

    return sendSuccess(res, {
      statusCode: 201,
      message: "Registration successful",
      data: { user: toSafeUser(user), token },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // .select("+password") because the schema excludes it by default.
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    if (!user.isActive) {
      throw new ApiError(403, "This account has been deactivated");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = generateToken({ userId: user._id, role: user.role });

    return sendSuccess(res, {
      message: "Login successful",
      data: { user: toSafeUser(user), token },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Requires the `protect` middleware to have already attached req.user.
 */
export const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, { data: { user: toSafeUser(req.user) } });
  } catch (err) {
    next(err);
  }
};
