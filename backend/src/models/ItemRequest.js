import mongoose from "mongoose";

const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const itemRequestSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    photo: { type: String, default: "" }, // Cloudinary URL
    // null = broadcast to all shops; set to specific shopId if targeted
    shopId: { type: Schema.Types.ObjectId, ref: "Shop", default: null, index: true },
    // per-shop responses: { shopId -> { status, respondedAt } }
    responses: [
      {
        shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
        ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        status: { type: String, enum: ["yes", "no"], required: true },
        respondedAt: { type: Date, default: Date.now },
      },
    ],
    messages: [messageSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("ItemRequest", itemRequestSchema);
