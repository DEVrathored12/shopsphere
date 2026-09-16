import Review from "../models/Review.js";
import Shop from "../models/Shop.js";
import mongoose from "mongoose";
import { sendSuccess, ApiError } from "../utils/apiResponse.js";
import { isOwnerOrAdmin } from "../utils/ownership.js";
import { parsePagination, buildPaginationMeta } from "../utils/queryHelpers.js";

/**
 * Recomputes a shop's aggregate rating/review count from its actual
 * Review documents. Called after any review create/delete so
 * Shop.rating never drifts from what customers have actually left.
 */
const recalcShopRating = async (shopId) => {
  const id = new mongoose.Types.ObjectId(String(shopId));
  const [agg] = await Review.aggregate([
    { $match: { shopId: id } },
    { $group: { _id: "$shopId", average: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  await Shop.findByIdAndUpdate(
    shopId,
    { rating: agg ? Math.round(agg.average * 10) / 10 : 0, totalReviews: agg ? agg.count : 0 },
    { new: true }
  );
};

/**
 * GET /api/reviews?shopId=&page=&limit=
 * Public. Reviews for one shop, newest first.
 */
export const getReviews = async (req, res, next) => {
  try {
    const { shopId } = req.query;
    const { page, limit, skip } = parsePagination(req.query);

    const shop = await Shop.findById(shopId);
    if (!shop) throw new ApiError(404, "Shop not found");

    const filter = { shopId: new mongoose.Types.ObjectId(String(shopId)) };
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("userId", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      data: { reviews, pagination: buildPaginationMeta({ page, limit, total }) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/reviews
 * Authenticated customers only. One review per user per shop — the
 * model's unique index is the source of truth; this returns a clean
 * 409 rather than a raw duplicate-key error.
 */
export const createReview = async (req, res, next) => {
  try {
    const { shopId, rating, comment } = req.body;

    const shop = await Shop.findById(shopId);
    if (!shop || !shop.isActive) throw new ApiError(404, "Shop not found");

    let review;
    try {
      review = await Review.create({ userId: req.user._id, shopId, rating, comment });
    } catch (err) {
      if (err.code === 11000) {
        throw new ApiError(409, "You have already reviewed this shop");
      }
      throw err;
    }

    await recalcShopRating(shopId);
    await review.populate("userId", "name avatar");

    return sendSuccess(res, { statusCode: 201, message: "Review submitted", data: { review } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/reviews/:id
 * The review's own author only (admins cannot edit someone else's words).
 */
export const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) throw new ApiError(404, "Review not found");

    if (String(review.userId) !== String(req.user._id)) {
      throw new ApiError(403, "You can only edit your own review");
    }

    const { rating, comment } = req.body;
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    await review.save();

    await recalcShopRating(review.shopId);
    await review.populate("userId", "name avatar");

    return sendSuccess(res, { message: "Review updated", data: { review } });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/reviews/:id
 * The review's own author, or an admin.
 */
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) throw new ApiError(404, "Review not found");

    if (!isOwnerOrAdmin(req.user, review.userId)) {
      throw new ApiError(403, "You can only delete your own review");
    }

    const { shopId } = review;
    await review.deleteOne();
    await recalcShopRating(shopId);

    return sendSuccess(res, { message: "Review deleted" });
  } catch (err) {
    next(err);
  }
};
