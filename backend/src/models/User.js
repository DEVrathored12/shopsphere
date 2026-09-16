import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

const USER_ROLES = ["customer", "shop_owner", "admin"];
const SALT_ROUNDS = 10;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false, // never returned by default queries
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9+\-\s]{7,15}$/, "Please provide a valid phone number"],
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "customer",
    },
    avatar: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const ROLES = USER_ROLES;
export default mongoose.model("User", userSchema);
