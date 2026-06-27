import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReferral extends Document {
  _id: mongoose.Types.ObjectId;
  referrerId: mongoose.Types.ObjectId;
  referredId?: mongoose.Types.ObjectId;
  referralCode: string;
  status: "pending" | "completed" | "expired";
  rewardAmount: number;
  rewardType: "subscription_days" | "credits" | "discount";
  rewardClaimed: boolean;
  rewardClaimedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    referrerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referredId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "expired"],
      default: "pending",
    },
    rewardAmount: {
      type: Number,
      default: 30, // 30 days free premium
    },
    rewardType: {
      type: String,
      enum: ["subscription_days", "credits", "discount"],
      default: "subscription_days",
    },
    rewardClaimed: {
      type: Boolean,
      default: false,
    },
    rewardClaimedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

ReferralSchema.index({ referrerId: 1 });
ReferralSchema.index({ referredId: 1 });
ReferralSchema.index({ status: 1, expiresAt: 1 });

const Referral: Model<IReferral> =
  mongoose.models.Referral ||
  mongoose.model<IReferral>("Referral", ReferralSchema);

export default Referral;