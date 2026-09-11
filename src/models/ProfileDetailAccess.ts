import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProfileDetailAccess extends Document {
  viewerId: mongoose.Types.ObjectId;
  profileUserId: mongoose.Types.ObjectId;
  paymentId: mongoose.Types.ObjectId;
  expiresAt: Date;
}

const ProfileDetailAccessSchema = new Schema<IProfileDetailAccess>(
  {
    viewerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    profileUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment", required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

ProfileDetailAccessSchema.index({ viewerId: 1, profileUserId: 1, paymentId: 1 }, { unique: true });
ProfileDetailAccessSchema.index({ viewerId: 1, paymentId: 1, expiresAt: 1 });

const ProfileDetailAccess: Model<IProfileDetailAccess> =
  mongoose.models.ProfileDetailAccess || mongoose.model<IProfileDetailAccess>("ProfileDetailAccess", ProfileDetailAccessSchema);

export default ProfileDetailAccess;
