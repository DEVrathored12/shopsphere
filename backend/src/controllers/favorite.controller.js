import Favorite from "../models/Favorite.js";
import { sendSuccess, ApiError } from "../utils/apiResponse.js";

/**
 * GET /api/favorites
 * Authenticated. Returns the current user's saved shops and products,
 * populated for display, plus flat id arrays so the frontend can build
 * a quick lookup Set without walking the populated docs.
 */
export const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id })
      .populate({
        path: "shopId",
        select: "shopName slug city area coverImage rating totalReviews isActive categoryId",
        populate: { path: "categoryId", select: "name slug" },
      })
      .populate({
        path: "productId",
        select: "name slug price priceType images availability isActive shopId",
        populate: { path: "shopId", select: "shopName slug isActive" },
      })
      .sort({ createdAt: -1 });

    const shops = favorites.filter((f) => f.shopId).map((f) => f.shopId);
    const products = favorites.filter((f) => f.productId).map((f) => f.productId);

    return sendSuccess(res, {
      data: {
        shops,
        products,
        shopIds: shops.map((s) => s._id),
        productIds: products.map((p) => p._id),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/favorites
 * Authenticated. Body: { shopId } XOR { productId }. Idempotent — if
 * the item is already saved, returns success rather than erroring.
 */
export const addFavorite = async (req, res, next) => {
  try {
    const { shopId, productId } = req.body;

    const existing = await Favorite.findOne({
      userId: req.user._id,
      ...(shopId ? { shopId } : { productId }),
    });
    if (existing) {
      return sendSuccess(res, { message: "Already saved", data: { favorite: existing } });
    }

    const favorite = await Favorite.create({
      userId: req.user._id,
      shopId: shopId || null,
      productId: productId || null,
    });

    return sendSuccess(res, { statusCode: 201, message: "Saved", data: { favorite } });
  } catch (err) {
    // A race on the unique index is just a duplicate save — not an error.
    if (err.code === 11000) {
      return sendSuccess(res, { message: "Already saved" });
    }
    next(err);
  }
};

/**
 * DELETE /api/favorites
 * Authenticated. Body: { shopId } XOR { productId }.
 */
export const removeFavorite = async (req, res, next) => {
  try {
    const { shopId, productId } = req.body;

    const result = await Favorite.findOneAndDelete({
      userId: req.user._id,
      ...(shopId ? { shopId } : { productId }),
    });

    if (!result) throw new ApiError(404, "Favorite not found");

    return sendSuccess(res, { message: "Removed" });
  } catch (err) {
    next(err);
  }
};
