import { Router } from "express";

import authRoutes from "./auth.routes.js";
import userRoutes from "./users.routes.js";
import shopRoutes from "./shops.routes.js";
import productRoutes from "./products.routes.js";
import categoryRoutes from "./categories.routes.js";
import favoriteRoutes from "./favorites.routes.js";
import reviewRoutes from "./reviews.routes.js";
import adminRoutes from "./admin.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ShopSphere API is running",
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/shops", shopRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/reviews", reviewRoutes);
router.use("/admin", adminRoutes);

export default router;
