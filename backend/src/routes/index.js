import { Router } from "express";

import authRoutes from "./auth.routes.js";
import userRoutes from "./users.routes.js";
import shopRoutes from "./shops.routes.js";
import productRoutes from "./products.routes.js";
import categoryRoutes from "./categories.routes.js";
import favoriteRoutes from "./favorites.routes.js";
import reviewRoutes from "./reviews.routes.js";
import adminRoutes from "./admin.routes.js";
import uploadRoutes from "./upload.routes.js";
import requestRoutes from "./requests.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ShopSphere API is running",
  });
});

// ONE-TIME seed route — remove after use
router.get("/seed-categories", async (req, res) => {
  const secret = req.query.secret;
  if (secret !== "shopsphere-seed-2024") return res.status(403).json({ success: false, message: "Forbidden" });
  try {
    const { default: Category } = await import("../models/Category.js");
    const { default: slugify } = await import("slugify");
    const CATS = ["Food & Grocery", "Fashion", "Electronics", "Jewellery", "Beauty", "Home & Furniture", "Gifts", "Services"];
    const results = [];
    for (const name of CATS) {
      const exists = await Category.findOne({ name });
      if (exists) { results.push(`skipped: ${name}`); continue; }
      await Category.create({ name, slug: slugify(name, { lower: true, strict: true }) });
      results.push(`created: ${name}`);
    }
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/shops", shopRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/reviews", reviewRoutes);
router.use("/admin", adminRoutes);
router.use("/upload", uploadRoutes);
router.use("/requests", requestRoutes);

export default router;
