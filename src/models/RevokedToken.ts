import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRevokedToken extends Document {
  _id: mongoose.Types.ObjectId;
  token: string;
  revokedAt: Date;
  createdAt: Date;
}

const RevokedTokenSchema = new Schema<IRevokedToken>(
  {
    token: {
      type: String,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

RevokedTokenSchema.index({ token: 1 }, { unique: true });
RevokedTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // 30 days TTL

const RevokedToken: Model<IRevokedToken> =
  mongoose.models.RevokedToken || mongoose.model<IRevokedToken>("RevokedToken", RevokedTokenSchema);

export default RevokedToken;