import Shop from "../models/Shop.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { sendSuccess, ApiError } from "../utils/apiResponse.js";
import { isOwnerOrAdmin } from "../utils/ownership.js";
import { parsePagination, buildPaginationMeta, parseSort, escapeRegex } from "../utils/queryHelpers.js";
import { haversineKm, parseCoords } from "../utils/geo.js";
import { isShopOpenNow } from "../utils/shopHours.js";

const SHOP_SORT_FIELDS = ["createdAt", "shopName", "rating", "totalReviews"];
const MAX_GEO_SCAN = 1000; // safety cap for the in-memory distance/openNow pass, see getShops

// Fields an owner (non-admin) is allowed to write via update.
const OWNER_EDITABLE_FIELDS = [
  "shopName",
  "description",
  "phone",
  "whatsapp",
  "instagram",
  "website",
  "address",
  "area",
  "city",
  "state",
  "pincode",
  "location",
  "openingHours",
  "coverImage",
  "galleryImages",
  "isActive",
];

// Fields only an admin may write via update, on top of the above.
const ADMIN_ONLY_FIELDS = ["isVerified"];

/**
 * GET /api/shops
 * Public. Supports pagination, category/city/area filters, search,
 * rating/open-now filters, distance filter+sort, and sorting. Only
 * ever returns active shops.
 *
 * Distance and "open now" can't be expressed as a simple Mongo query
 * (open-now depends on the server clock against a per-weekday map;
 * distance needs a haversine calc we also want to hand back to the
 * client for display). When either is requested we fetch a bounded,
 * pre-filtered batch (MAX_GEO_SCAN) and finish filtering/sorting/
 * pagination in memory. Without them, the query stays a single
 * indexed find() with DB-level skip/limit, same as before.
 */
export const getShops = async (req, res, next) => {
  try {
    const { category, city, area, search, sort, minRating, openNow, radius, ownerId } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const coords = parseCoords(req.query);
    const wantsOpenNow = openNow === "true";
    const radiusKm = parseFloat(radius);
    const needsInMemoryPass = Boolean(coords) || wantsOpenNow;

    const filter = { isActive: true };
    if (category) filter.categoryId = category;
    if (city) filter.city = new RegExp(escapeRegex(city), "i");
    if (area) filter.area = new RegExp(escapeRegex(area), "i");
    if (minRating) filter.rating = { $gte: parseFloat(minRating) };
    // ownerId filter: only expose to the owner themselves or an admin
    if (ownerId) {
      const isOwn = req.user && (String(req.user._id) === String(ownerId) || req.user.role === "admin");
      if (isOwn) {
        filter.ownerId = ownerId;
        delete filter.isActive; // owner can see their own inactive shop
      }
    }
    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ shopName: regex }, { description: regex }, { city: regex }, { area: regex }];
    }

    const sortSpec = parseSort(sort, SHOP_SORT_FIELDS, { createdAt: -1 });

    if (!needsInMemoryPass) {
      const [shops, total] = await Promise.all([
        Shop.find(filter).populate("categoryId", "name slug").sort(sortSpec).skip(skip).limit(limit),
        Shop.countDocuments(filter),
      ]);
      return sendSuccess(res, {
        data: { shops, pagination: buildPaginationMeta({ page, limit, total }) },
      });
    }

    // --- In-memory pass: distance and/or open-now requested ---
    let shops = await Shop.find(filter)
      .populate("categoryId", "name slug")
      .sort(sortSpec)
      .limit(MAX_GEO_SCAN);

    shops = shops.map((s) => s.toObject());

    if (coords) {
      shops = shops.map((s) => ({
        ...s,
        distanceKm: haversineKm(
          coords.latitude,
          coords.longitude,
          s.location?.coordinates?.[1],
          s.location?.coordinates?.[0]
        ),
      }));
      if (Number.isFinite(radiusKm)) {
        shops = shops.filter((s) => s.distanceKm !== null && s.distanceKm <= radiusKm);
      }
    }

    if (wantsOpenNow) {
      shops = shops.filter((s) => isShopOpenNow(s.openingHours) === true);
    }

    if (sort === "distance" && coords) {
      shops.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }

    const total = shops.length;
    const paged = shops.slice(skip, skip + limit);

    return sendSuccess(res, {
      data: { shops: paged, pagination: buildPaginationMeta({ page, limit, total }) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/shops/:id
 * Public (optionalAuth). Returns shop info, category, owner-safe
 * info, products, rating, and gallery. Inactive shops are only
 * visible to their owner or an admin.
 */
export const getShopById = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .populate("categoryId", "name slug icon")
      .populate("ownerId", "name avatar");

    if (!shop) throw new ApiError(404, "Shop not found");

    const viewerIsOwnerOrAdmin = isOwnerOrAdmin(req.user, shop.ownerId?._id);

    if (!shop.isActive && !viewerIsOwnerOrAdmin) {
      throw new ApiError(404, "Shop not found");
    }

    const productFilter = { shopId: shop._id };
    if (!viewerIsOwnerOrAdmin) productFilter.isActive = true;

    const products = await Product.find(productFilter)
      .populate("categoryId", "name slug")
      .sort({ createdAt: -1 });

    const coords = parseCoords(req.query);
    const distanceKm = coords
      ? haversineKm(coords.latitude, coords.longitude, shop.location?.coordinates?.[1], shop.location?.coordinates?.[0])
      : null;

    return sendSuccess(res, {
      data: {
        shop,
        category: shop.categoryId,
        owner: shop.ownerId,
        products,
        rating: { average: shop.rating, totalReviews: shop.totalReviews },
        gallery: shop.galleryImages,
        distanceKm,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/shops
 * Authenticated shop owners (or admins) only. ownerId always comes
 * from the JWT — never from the request body.
 */
export const createShop = async (req, res, next) => {
  try {
    const {
      shopName,
      category,
      description,
      phone,
      address,
      city,
      state,
      pincode,
      whatsapp,
      instagram,
      website,
      area,
      openingHours,
      location,
      coverImage,
      galleryImages,
    } = req.body;

    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) throw new ApiError(400, "Invalid category");

    const shop = await Shop.create({
      ownerId: req.user._id, // never trust a client-supplied ownerId
      shopName,
      categoryId: category,
      description,
      phone,
      address,
      city,
      state,
      pincode,
      whatsapp,
      instagram,
      website,
      area,
      openingHours,
      location,
      coverImage,
      galleryImages,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: "Shop created",
      data: { shop },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/shops/:id
 * Owner of the shop, or admin.
 */
export const updateShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) throw new ApiError(404, "Shop not found");

    if (!isOwnerOrAdmin(req.user, shop.ownerId)) {
      throw new ApiError(403, "You can only edit your own shop");
    }

    if (req.body.category) {
      const categoryDoc = await Category.findById(req.body.category);
      if (!categoryDoc) throw new ApiError(400, "Invalid category");
      shop.categoryId = req.body.category;
    }

    for (const field of OWNER_EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) shop[field] = req.body[field];
    }

    if (req.user.role === "admin") {
      for (const field of ADMIN_ONLY_FIELDS) {
        if (req.body[field] !== undefined) shop[field] = req.body[field];
      }
    }

    // ownerId, slug, rating, and totalReviews are never client-writable.
    await shop.save();

    return sendSuccess(res, { message: "Shop updated", data: { shop } });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/shops/:id
 * Owner of the shop, or admin. Cascades to the shop's products so no
 * orphaned products are left behind.
 */
export const deleteShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) throw new ApiError(404, "Shop not found");

    if (!isOwnerOrAdmin(req.user, shop.ownerId)) {
      throw new ApiError(403, "You can only delete your own shop");
    }

    await Product.deleteMany({ shopId: shop._id });
    await shop.deleteOne();

    return sendSuccess(res, { message: "Shop deleted" });
  } catch (err) {
    next(err);
  }
};
