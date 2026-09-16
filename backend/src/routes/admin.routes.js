import { Router } from "express";
import User from "../models/User.js";
import Shop from "../models/Shop.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import { sendSuccess, ApiError } from "../utils/apiResponse.js";
import { parsePagination, buildPaginationMeta, escapeRegex } from "../utils/queryHelpers.js";

const router = Router();

// All admin routes require authentication + admin role
router.use(protect, authorize("admin"));

/**
 * GET /api/admin/stats
 * Platform-wide counts for the dashboard overview.
 */
router.get("/stats", async (req, res, next) => {
  try {
    const [totalUsers, totalShops, totalProducts, totalReviews, activeShops, pendingShops] =
      await Promise.all([
        User.countDocuments(),
        Shop.countDocuments(),
        Product.countDocuments(),
        Review.countDocuments(),
        Shop.countDocuments({ isActive: true }),
        Shop.countDocuments({ isVerified: false, isActive: true }),
      ]);

    return sendSuccess(res, {
      data: { totalUsers, totalShops, totalProducts, totalReviews, activeShops, pendingShops },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/users
 * Paginated user list with optional search and role filter.
 */
router.get("/users", async (req, res, next) => {
  try {
    const { search, role } = req.query;
    const { page, limit, skip } = parsePagination(req.query);

    const filter = {};
    if (role) filter.role = role;
    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      data: { users, pagination: buildPaginationMeta({ page, limit, total }) },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/users/:id/role
 * Change a user's role. Admins cannot demote themselves.
 */
router.put("/users/:id/role", async (req, res, next) => {
  try {
    const { role } = req.body;
    const VALID_ROLES = ["customer", "shop_owner", "admin"];
    if (!VALID_ROLES.includes(role)) throw new ApiError(400, "Invalid role");

    if (String(req.params.id) === String(req.user._id)) {
      throw new ApiError(400, "You cannot change your own role");
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) throw new ApiError(404, "User not found");

    return sendSuccess(res, { message: "Role updated", data: { user } });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/users/:id/active
 * Activate or deactivate a user account.
 */
router.put("/users/:id/active", async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (String(req.params.id) === String(req.user._id)) {
      throw new ApiError(400, "You cannot deactivate your own account");
    }

    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) throw new ApiError(404, "User not found");

    return sendSuccess(res, { message: `User ${isActive ? "activated" : "deactivated"}`, data: { user } });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/shops
 * Paginated shop list — all shops (active + inactive), with search.
 */
router.get("/shops", async (req, res, next) => {
  try {
    const { search, isVerified, isActive } = req.query;
    const { page, limit, skip } = parsePagination(req.query);

    const filter = {};
    if (isVerified !== undefined) filter.isVerified = isVerified === "true";
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ shopName: regex }, { city: regex }];
    }

    const [shops, total] = await Promise.all([
      Shop.find(filter)
        .populate("ownerId", "name email")
        .populate("categoryId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Shop.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      data: { shops, pagination: buildPaginationMeta({ page, limit, total }) },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/shops/:id/verify
 * Toggle a shop's verified status.
 */
router.put("/shops/:id/verify", async (req, res, next) => {
  try {
    const { isVerified } = req.body;
    const shop = await Shop.findByIdAndUpdate(req.params.id, { isVerified }, { new: true });
    if (!shop) throw new ApiError(404, "Shop not found");
    return sendSuccess(res, { message: `Shop ${isVerified ? "verified" : "unverified"}`, data: { shop } });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/products
 * Paginated product list — all products, with search.
 */
router.get("/products", async (req, res, next) => {
  try {
    const { search } = req.query;
    const { page, limit, skip } = parsePagination(req.query);

    const filter = {};
    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ name: regex }];
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("shopId", "shopName")
        .populate("categoryId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      data: { products, pagination: buildPaginationMeta({ page, limit, total }) },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
