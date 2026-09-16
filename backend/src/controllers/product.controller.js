import Product from "../models/Product.js";
import Shop from "../models/Shop.js";
import Category from "../models/Category.js";
import { sendSuccess, ApiError } from "../utils/apiResponse.js";
import { isOwnerOrAdmin } from "../utils/ownership.js";
import { parsePagination, buildPaginationMeta, parseSort, escapeRegex } from "../utils/queryHelpers.js";
import { shouldCountView } from "../utils/viewTracker.js";
import { haversineKm, parseCoords } from "../utils/geo.js";
import { isShopOpenNow } from "../utils/shopHours.js";

const PRODUCT_SORT_FIELDS = ["createdAt", "price", "views", "name"];
const MAX_GEO_SCAN = 1000; // safety cap for the in-memory distance/openNow pass, see getProducts
const SHOP_PREVIEW_FIELDS = "shopName slug city area isActive location openingHours";

const OWNER_EDITABLE_FIELDS = [
  "name",
  "categoryId",
  "description",
  "price",
  "priceType",
  "images",
  "sizes",
  "colors",
  "availability",
  "isActive",
];

/**
 * GET /api/products
 * Public (optionalAuth). Supports shopId, categoryId, search,
 * availability, pagination, and sorting.
 *
 * By default only active products belonging to active shops are
 * returned. If ?shopId is given and the requester is that shop's
 * owner (or an admin), inactive products/shops are included too, so
 * an owner can manage their own catalog through the same endpoint.
 */
export const getProducts = async (req, res, next) => {
  try {
    const { shopId, categoryId, search, availability, sort, minPrice, maxPrice, openNow, radius } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const coords = parseCoords(req.query);
    const wantsOpenNow = openNow === "true";
    const radiusKm = parseFloat(radius);
    // Distance/open-now depend on the populated shop, not on the Product
    // collection itself, so (like getShops) they're resolved with a
    // bounded in-memory pass rather than a DB-level query — see getShops
    // for the fuller rationale. Only relevant when browsing without a
    // fixed shopId (a single shop's own catalog has no "distance").
    const needsInMemoryPass = !shopId && (Boolean(coords) || wantsOpenNow);

    const filter = {};
    let includeInactive = false;

    if (shopId) {
      const shop = await Shop.findById(shopId);
      if (!shop) throw new ApiError(404, "Shop not found");

      includeInactive = isOwnerOrAdmin(req.user, shop.ownerId);
      if (!shop.isActive && !includeInactive) {
        // Inactive shop, viewed by a stranger: no products, not an error.
        return sendSuccess(res, {
          data: { products: [], pagination: buildPaginationMeta({ page, limit, total: 0 }) },
        });
      }

      filter.shopId = shopId;
    }

    if (categoryId) filter.categoryId = categoryId;
    if (availability) filter.availability = availability;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ name: regex }, { description: regex }];
    }

    if (!includeInactive) filter.isActive = true;

    const sortSpec = parseSort(sort, PRODUCT_SORT_FIELDS, { createdAt: -1 });

    if (!needsInMemoryPass) {
      let productsQuery = Product.find(filter)
        .populate("categoryId", "name slug")
        .sort(sortSpec)
        .skip(skip)
        .limit(limit);

      // When browsing without a shopId filter, also hide products whose
      // shop happens to be inactive.
      if (!shopId) {
        productsQuery = productsQuery.populate({
          path: "shopId",
          select: SHOP_PREVIEW_FIELDS,
          match: { isActive: true },
        });
      } else {
        productsQuery = productsQuery.populate("shopId", SHOP_PREVIEW_FIELDS);
      }

      let [products, total] = await Promise.all([productsQuery, Product.countDocuments(filter)]);
      if (!shopId) products = products.filter((p) => p.shopId !== null);

      return sendSuccess(res, {
        data: { products, pagination: buildPaginationMeta({ page, limit, total }) },
      });
    }

    // --- In-memory pass: distance and/or open-now requested ---
    let products = await Product.find(filter)
      .populate("categoryId", "name slug")
      .populate({ path: "shopId", select: SHOP_PREVIEW_FIELDS, match: { isActive: true } })
      .sort(sortSpec)
      .limit(MAX_GEO_SCAN);

    products = products.filter((p) => p.shopId !== null).map((p) => p.toObject());

    if (coords) {
      products = products.map((p) => ({
        ...p,
        distanceKm: haversineKm(
          coords.latitude,
          coords.longitude,
          p.shopId?.location?.coordinates?.[1],
          p.shopId?.location?.coordinates?.[0]
        ),
      }));
      if (Number.isFinite(radiusKm)) {
        products = products.filter((p) => p.distanceKm !== null && p.distanceKm <= radiusKm);
      }
    }

    if (wantsOpenNow) {
      products = products.filter((p) => isShopOpenNow(p.shopId?.openingHours) === true);
    }

    if (sort === "distance" && coords) {
      products.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }

    const total = products.length;
    const paged = products.slice(skip, skip + limit);

    return sendSuccess(res, {
      data: { products: paged, pagination: buildPaginationMeta({ page, limit, total }) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/products/:id
 * Public (optionalAuth). Hidden if the product or its shop is
 * inactive, unless the requester owns the shop or is an admin.
 * Increments the view counter, debounced per visitor.
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categoryId", "name slug")
      .populate(
        "shopId",
        "shopName slug city area address isActive ownerId phone whatsapp location coverImage rating totalReviews"
      );

    if (!product || !product.shopId) throw new ApiError(404, "Product not found");

    const shop = product.shopId;
    const viewerIsOwnerOrAdmin = isOwnerOrAdmin(req.user, shop.ownerId);

    if ((!product.isActive || !shop.isActive) && !viewerIsOwnerOrAdmin) {
      throw new ApiError(404, "Product not found");
    }

    const visitorKey = req.user ? `user:${req.user._id}` : `ip:${req.ip}`;
    if (shouldCountView(visitorKey, product._id.toString())) {
      product.views += 1;
      await product.save();
    }

    const coords = parseCoords(req.query);
    const distanceKm = coords
      ? haversineKm(coords.latitude, coords.longitude, shop.location?.coordinates?.[1], shop.location?.coordinates?.[0])
      : null;

    return sendSuccess(res, { data: { product, distanceKm } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/products
 * Shop owner (or admin). shopId is required in the body but is
 * verified against the authenticated user's own shop — it is never
 * trusted blindly.
 */
export const createProduct = async (req, res, next) => {
  try {
    const { shopId, name, categoryId, description, price, priceType, images, sizes, colors, availability } =
      req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) throw new ApiError(404, "Shop not found");

    if (!isOwnerOrAdmin(req.user, shop.ownerId)) {
      throw new ApiError(403, "You can only add products to your own shop");
    }

    const category = await Category.findById(categoryId);
    if (!category) throw new ApiError(400, "Invalid category");

    const product = await Product.create({
      shopId,
      categoryId,
      name,
      description,
      price,
      priceType,
      images,
      sizes,
      colors,
      availability,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: "Product created",
      data: { product },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/products/:id
 * Owner of the product's shop, or admin.
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, "Product not found");

    const shop = await Shop.findById(product.shopId);
    if (!shop || !isOwnerOrAdmin(req.user, shop.ownerId)) {
      throw new ApiError(403, "You can only edit products in your own shop");
    }

    if (req.body.categoryId) {
      const category = await Category.findById(req.body.categoryId);
      if (!category) throw new ApiError(400, "Invalid category");
    }

    for (const field of OWNER_EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    }

    // shopId is never client-writable — a product cannot be moved
    // between shops via this endpoint.
    await product.save();

    return sendSuccess(res, { message: "Product updated", data: { product } });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/products/:id
 * Owner of the product's shop, or admin.
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, "Product not found");

    const shop = await Shop.findById(product.shopId);
    if (!shop || !isOwnerOrAdmin(req.user, shop.ownerId)) {
      throw new ApiError(403, "You can only delete products in your own shop");
    }

    await product.deleteOne();

    return sendSuccess(res, { message: "Product deleted" });
  } catch (err) {
    next(err);
  }
};
