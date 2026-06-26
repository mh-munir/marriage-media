import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVerification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: "photo" | "identity" | "phone" | "email" | "social";
  documentUrl: string;
  documentPublicId: string;
  documentType?: string;
  selfieUrl?: string;
  selfiePublicId?: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationSchema = new Schema<IVerification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["photo", "identity", "phone", "email", "social"],
      required: true,
    },
    documentUrl: {
      type: String,
      required: true,
    },
    documentPublicId: {
      type: String,
      default: "",
    },
    documentType: {
      type: String,
      default: "",
    },
    selfieUrl: {
      type: String,
      default: "",
    },
    selfiePublicId: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

VerificationSchema.index({ userId: 1, type: 1 });
VerificationSchema.index({ status: 1 });
VerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Verification: Model<IVerification> =
  mongoose.models.Verification ||
  mongoose.model<IVerification>("Verification", VerificationSchema);

export default Verification;