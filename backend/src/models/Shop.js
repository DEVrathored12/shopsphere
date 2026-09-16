import mongoose from "mongoose";
import slugify from "slugify";

const { Schema } = mongoose;

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const dayHoursSchema = new Schema(
  {
    open: { type: String, default: "" }, // e.g. "09:00"
    close: { type: String, default: "" }, // e.g. "21:00"
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

const buildDefaultOpeningHours = () => {
  const hours = {};
  DAYS.forEach((day) => {
    hours[day] = { open: "", close: "", isClosed: false };
  });
  return hours;
};

const openingHoursSchema = new Schema(
  DAYS.reduce((fields, day) => {
    fields[day] = dayHoursSchema;
    return fields;
  }, {}),
  { _id: false }
);

const shopSchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Shop must belong to an owner"],
      index: true,
    },
    shopName: {
      type: String,
      required: [true, "Shop name is required"],
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Shop must belong to a category"],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
    instagram: {
      type: String,
      trim: true,
      default: "",
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    mapLink: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      required: [true, "Address is required"],
    },
    area: {
      type: String,
      trim: true,
      index: true,
    },
    city: {
      type: String,
      trim: true,
      required: [true, "City is required"],
      index: true,
    },
    state: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },

    openingHours: {
      type: openingHoursSchema,
      default: buildDefaultOpeningHours,
    },

    coverImage: {
      type: String,
      default: "",
    },
    galleryImages: {
      type: [String],
      default: [],
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Geospatial index for "shops near me" queries
shopSchema.index({ location: "2dsphere" });

// Compound/text-search-friendly indexes
shopSchema.index({ shopName: "text" });
shopSchema.index({ categoryId: 1, isActive: 1 });
shopSchema.index({ city: 1, area: 1, isActive: 1 });

shopSchema.pre("validate", function generateSlug() {
  if (this.shopName && (!this.slug || this.isModified("shopName"))) {
    this.slug = `${slugify(this.shopName, { lower: true, strict: true })}-${Date.now()
      .toString(36)}`;
  }
});

export default mongoose.model("Shop", shopSchema);
