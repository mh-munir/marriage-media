import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICoupon extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxDiscountAmount?: number;
  minPurchaseAmount: number;
  applicablePlans: string[];
  usageLimit?: number;
  usedCount: number;
  perUserLimit: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  usedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: [0, "Discount cannot be negative"],
    },
    maxDiscountAmount: {
      type: Number,
      min: [0, "Max discount cannot be negative"],
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
    },
    applicablePlans: [
      { type: String },
    ],
    usageLimit: {
      type: Number,
      min: [0, "Usage limit cannot be negative"],
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    usedBy: [
      { type: Schema.Types.ObjectId, ref: "User" },
    ],
  },
  { timestamps: true }
);

CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
CouponSchema.index({ createdBy: 1 });

const Coupon: Model<ICoupon> =
  mongoose.models.Coupon ||
  mongoose.model<ICoupon>("Coupon", CouponSchema);

export default Coupon;