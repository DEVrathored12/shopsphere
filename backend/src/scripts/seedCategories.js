import "dotenv/config";
import mongoose from "mongoose";
import slugify from "slugify";
import connectDB from "../config/db.js";
import Category from "../models/Category.js";

/**
 * Idempotent seed for the platform's default categories. Safe to run
 * multiple times — existing categories (matched by name) are left
 * untouched.
 *
 * Usage:
 *   npm run seed:categories
 */
const DEFAULT_CATEGORIES = [
  "Food & Grocery",
  "Fashion",
  "Electronics",
  "Jewellery",
  "Beauty",
  "Home & Furniture",
  "Gifts",
  "Services",
];

const run = async () => {
  await connectDB();

  for (const name of DEFAULT_CATEGORIES) {
    // eslint-disable-next-line no-await-in-loop
    const existing = await Category.findOne({ name });
    if (existing) {
      console.log(`Category "${name}" already exists. Skipped.`);
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    await Category.create({
      name,
      slug: slugify(name, { lower: true, strict: true }),
    });
    console.log(`Created category "${name}".`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("Failed to seed categories:", err);
  process.exit(1);
});
