import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISiteBranding extends Document {
  key: string;
  headerLogoUrl: string;
  footerLogoUrl: string;
  faviconUrl: string;
  updatedAt: Date;
  createdAt: Date;
}

const SiteBrandingSchema = new Schema<ISiteBranding>(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    headerLogoUrl: { type: String, default: "", trim: true },
    footerLogoUrl: { type: String, default: "", trim: true },
    faviconUrl: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

const SiteBranding: Model<ISiteBranding> =
  mongoose.models.SiteBranding || mongoose.model<ISiteBranding>("SiteBranding", SiteBrandingSchema);

export default SiteBranding;
