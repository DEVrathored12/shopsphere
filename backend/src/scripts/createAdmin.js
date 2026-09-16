import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

/**
 * Creates (or updates) a single admin account. This is the ONLY
 * supported way to create an admin — there is no public API route
 * for it, by design.
 *
 * Usage:
 *   ADMIN_NAME="Site Admin" \
 *   ADMIN_EMAIL="admin@shopsphere.local" \
 *   ADMIN_PASSWORD="a-strong-password-here" \
 *   node src/scripts/createAdmin.js
 */
const run = async () => {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error(
      "ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD environment variables are all required."
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });

  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
      console.log(`Existing user ${email} promoted to admin.`);
    } else {
      console.log(`Admin account ${email} already exists. No changes made.`);
    }
  } else {
    await User.create({ name, email, password, role: "admin" });
    console.log(`Admin account created for ${email}.`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("Failed to create admin:", err);
  process.exit(1);
});
