import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmailTemplate extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  category: "transactional" | "marketing" | "notification" | "security" | "system";
  isActive: boolean;
  lastUsedAt?: Date;
  usageCount: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmailTemplateSchema = new Schema<IEmailTemplate>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
    },
    htmlContent: {
      type: String,
      required: true,
    },
    textContent: {
      type: String,
      default: "",
    },
    variables: [{ type: String }],
    category: {
      type: String,
      enum: ["transactional", "marketing", "notification", "security", "system"],
      default: "notification",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsedAt: {
      type: Date,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

EmailTemplateSchema.index({ slug: 1 }, { unique: true });
EmailTemplateSchema.index({ category: 1 });
EmailTemplateSchema.index({ isActive: 1 });

const EmailTemplate: Model<IEmailTemplate> =
  mongoose.models.EmailTemplate ||
  mongoose.model<IEmailTemplate>("EmailTemplate", EmailTemplateSchema);

export default EmailTemplate;