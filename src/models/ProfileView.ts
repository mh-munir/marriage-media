import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProfileView extends Document {
  _id: mongoose.Types.ObjectId;
  viewerId: mongoose.Types.ObjectId;
  viewedId: mongoose.Types.ObjectId;
  viewCount: number;
  lastViewedAt: Date;
  createdAt: Date;
}

const ProfileViewSchema = new Schema<IProfileView>(
  {
    viewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewedId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewCount: {
      type: Number,
      default: 1,
    },
    lastViewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

ProfileViewSchema.index({ viewerId: 1, viewedId: 1 }, { unique: true });
ProfileViewSchema.index({ viewedId: 1, lastViewedAt: -1 });

const ProfileView: Model<IProfileView> =
  mongoose.models.ProfileView ||
  mongoose.model<IProfileView>("ProfileView", ProfileViewSchema);

export default ProfileView;