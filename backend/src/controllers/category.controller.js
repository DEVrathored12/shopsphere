import Category from "../models/Category.js";
import Shop from "../models/Shop.js";
import Product from "../models/Product.js";
import { sendSuccess, ApiError } from "../utils/apiResponse.js";
import { generateUniqueSlug } from "../utils/slug.js";

/**
 * GET /api/categories
 * Public. Returns active categories by default. An authenticated
 * admin can pass ?all=true to also see deactivated categories.
 */
export const getCategories = async (req, res, next) => {
  try {
    const filter = {};
    const wantsAll = req.query.all === "true" && req.user?.role === "admin";
    if (!wantsAll) filter.isActive = true;

    const categories = await Category.find(filter).sort({ name: 1 });

    // Attach real, freshly-counted shop/product totals per category —
    // never a hardcoded or stale number. The category list is small
    // (a handful of top-level categories), so one count pair per
    // category is cheap.
    const withCounts = await Promise.all(
      categories.map(async (category) => {
        const [shopCount, productCount] = await Promise.all([
          Shop.countDocuments({ categoryId: category._id, isActive: true }),
          Product.countDocuments({ categoryId: category._id, isActive: true }),
        ]);
        return { ...category.toObject(), shopCount, productCount };
      })
    );

    return sendSuccess(res, { data: { categories: withCounts } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/categories/:id
 * Public.
 */
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category || (!category.isActive && req.user?.role !== "admin")) {
      throw new ApiError(404, "Category not found");
    }

    const [shopCount, productCount] = await Promise.all([
      Shop.countDocuments({ categoryId: category._id, isActive: true }),
      Product.countDocuments({ categoryId: category._id, isActive: true }),
    ]);

    return sendSuccess(res, { data: { category: { ...category.toObject(), shopCount, productCount } } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/categories
 * Admin only.
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, description = "", icon = "", image = "", isActive = true } = req.body;

    const existing = await Category.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existing) {
      throw new ApiError(409, "A category with this name already exists");
    }

    const slug = await generateUniqueSlug(Category, name);

    const category = await Category.create({
      name,
      slug,
      description,
      icon,
      image,
      isActive,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: "Category created",
      data: { category },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/categories/:id
 * Admin only.
 */
export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) throw new ApiError(404, "Category not found");

    const { name, description, icon, image, isActive } = req.body;

    if (name !== undefined && name.trim() !== category.name) {
      const existing = await Category.findOne({
        _id: { $ne: category._id },
        name: new RegExp(`^${name.trim()}$`, "i"),
      });
      if (existing) throw new ApiError(409, "A category with this name already exists");

      category.name = name.trim();
      category.slug = await generateUniqueSlug(Category, name.trim(), category._id);
    }

    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    return sendSuccess(res, { message: "Category updated", data: { category } });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/categories/:id
 * Admin only. Refuses to delete a category still referenced by shops
 * or products — deactivate it instead so existing listings don't break.
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) throw new ApiError(404, "Category not found");

    const [shopCount, productCount] = await Promise.all([
      Shop.countDocuments({ categoryId: category._id }),
      Product.countDocuments({ categoryId: category._id }),
    ]);

    if (shopCount > 0 || productCount > 0) {
      throw new ApiError(
        409,
        "This category is still in use by shops or products. Deactivate it instead of deleting it."
      );
    }

    await category.deleteOne();

    return sendSuccess(res, { message: "Category deleted" });
  } catch (err) {
    next(err);
  }
};
