import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlockedIP extends Document {
  _id: mongoose.Types.ObjectId;
  ip: string;
  type: "blacklist" | "whitelist";
  reason: string;
  addedBy?: string;
  expiresAt?: Date;
  createdAt: Date;
}

const BlockedIPSchema = new Schema<IBlockedIP>(
  {
    ip: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["blacklist", "whitelist"],
      required: true,
    },
    reason: {
      type: String,
      default: "",
    },
    addedBy: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

BlockedIPSchema.index({ ip: 1, type: 1 }, { unique: true });
BlockedIPSchema.index({ type: 1 });
BlockedIPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const BlockedIP: Model<IBlockedIP> =
  mongoose.models.BlockedIP || mongoose.model<IBlockedIP>("BlockedIP", BlockedIPSchema);

export default BlockedIP;