import mongoose from "mongoose";

const { Schema } = mongoose;

const favoriteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Favorite must belong to a user"],
      index: true,
    },
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      default: null,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// A favorite must reference exactly one of shopId / productId, never both,
// never neither.
favoriteSchema.pre("validate", function enforceExactlyOneTarget() {
  const hasShop = Boolean(this.shopId);
  const hasProduct = Boolean(this.productId);

  if (hasShop === hasProduct) {
    throw new Error("A favorite must reference exactly one of shopId or productId");
  }
});

// Prevent the same user from favoriting the same shop twice.
favoriteSchema.index(
  { userId: 1, shopId: 1 },
  { unique: true, partialFilterExpression: { shopId: { $type: "objectId" } } }
);

// Prevent the same user from favoriting the same product twice.
favoriteSchema.index(
  { userId: 1, productId: 1 },
  { unique: true, partialFilterExpression: { productId: { $type: "objectId" } } }
);

export default mongoose.model("Favorite", favoriteSchema);
