import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlog extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  titleBn?: string;
  titleEn?: string;
  slug: string;
  content: string;
  contentBn?: string;
  contentEn?: string;
  excerpt: string;
  excerptBn?: string;
  excerptEn?: string;
  featuredImage: {
    url: string;
    publicId: string;
  };
  author: mongoose.Types.ObjectId;
  category: string;
  categoryBn?: string;
  categoryEn?: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: Date;
  views: number;
  likes: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    titleBn: { type: String, default: "" },
    titleEn: { type: String, default: "" },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    contentBn: { type: String, default: "" },
    contentEn: { type: String, default: "" },
    excerpt: {
      type: String,
      required: [true, "Excerpt is required"],
      maxlength: [500, "Excerpt cannot exceed 500 characters"],
    },
    excerptBn: { type: String, default: "" },
    excerptEn: { type: String, default: "" },
    featuredImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      default: "General",
    },
    categoryBn: { type: String, default: "" },
    categoryEn: { type: String, default: "" },
    tags: [{ type: String }],
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
  },
  { timestamps: true }
);

BlogSchema.index({ isPublished: 1, publishedAt: -1 });
BlogSchema.index({ author: 1 });
BlogSchema.index({ category: 1 });
BlogSchema.index({ tags: 1 });

const Blog: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);

export default Blog;