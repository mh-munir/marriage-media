import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISitePage extends Document {
  slug: string;
  title: string;
  description: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  isPublished: boolean;
  updatedAt: Date;
  createdAt: Date;
}

const SitePageSchema = new Schema<ISitePage>(
  {
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    content: { type: String, default: "" },
    seoTitle: { type: String, default: "", trim: true },
    seoDescription: { type: String, default: "", trim: true },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const SitePage: Model<ISitePage> = mongoose.models.SitePage || mongoose.model<ISitePage>("SitePage", SitePageSchema);

export default SitePage;
