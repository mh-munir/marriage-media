import mongoose, { Document, Model, Schema } from "mongoose";
import type { ManualPaymentNumbers, PricingPlan } from "@/lib/pricing";

export interface ISitePage extends Document {
  slug: string;
  title: string;
  titleBn?: string;
  titleEn?: string;
  description: string;
  descriptionBn?: string;
  descriptionEn?: string;
  content: string;
  contentBn?: string;
  contentEn?: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords?: string;
  seoCanonical?: string;
  seoOgImage?: string;
  seoNoIndex?: boolean;
  isPublished: boolean;
  sections?: Array<Record<string, unknown>>;
  pricingPlans?: PricingPlan[];
  paymentNumbers?: ManualPaymentNumbers;
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
    seoKeywords: { type: String, default: "", trim: true },
    seoCanonical: { type: String, default: "", trim: true },
    seoOgImage: { type: String, default: "", trim: true },
    seoNoIndex: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    sections: { type: [Schema.Types.Mixed], default: [] },
    pricingPlans: { type: [Schema.Types.Mixed], default: [] },
    paymentNumbers: {
      bkash: { type: String, default: "" },
      nagad: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

const SitePage: Model<ISitePage> = mongoose.models.SitePage || mongoose.model<ISitePage>("SitePage", SitePageSchema);

export default SitePage;
