import mongoose from "mongoose";
import slugify from "slugify";

const { Schema } = mongoose;

const PRICE_TYPES = ["fixed", "starting_from", "contact_shop"];
const AVAILABILITY_STATUSES = ["available", "out_of_stock"];

const productSchema = new Schema(
  {
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: [true, "Product must belong to a shop"],
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product must belong to a category"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    price: {
      type: Number,
      min: 0,
      required: function requiredUnlessContactShop() {
        return this.priceType !== "contact_shop";
      },
    },
    priceType: {
      type: String,
      enum: PRICE_TYPES,
      default: "fixed",
    },
    images: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    availability: {
      type: String,
      enum: AVAILABILITY_STATUSES,
      default: "available",
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });
productSchema.index({ shopId: 1, isActive: 1 });
productSchema.index({ categoryId: 1, availability: 1, isActive: 1 });

productSchema.pre("validate", function generateSlug() {
  if (this.name && (!this.slug || this.isModified("name"))) {
    this.slug = `${slugify(this.name, { lower: true, strict: true })}-${Date.now()
      .toString(36)}`;
  }
});

export const PRICE_TYPE_VALUES = PRICE_TYPES;
export const AVAILABILITY_VALUES = AVAILABILITY_STATUSES;
export default mongoose.model("Product", productSchema);
