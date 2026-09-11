import mongoose, { Schema, Document, Model } from "mongoose";

export type VerificationType =
  | "profile"
  | "nid"
  | "passport"
  | "face"
  | "selfie"
  | "phone"
  | "email"
  | "photo"
  | "identity"
  | "social";

export type VerificationStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "expired"
  | "cancelled";

export interface ITimelineEvent {
  status: VerificationStatus;
  timestamp: Date;
  note?: string;
  reviewedBy?: mongoose.Types.ObjectId;
}

export interface IVerification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: VerificationType;

  // Document fields
  documentUrl: string;
  documentPublicId: string;
  documentType?: string;
  documentNumber?: string; // NID number, passport number, etc.

  // Selfie / Face match
  selfieUrl?: string;
  selfiePublicId?: string;
  faceMatchScore?: number; // 0-100 confidence score
  faceMatchedAt?: Date;

  // OTP / Code verification
  verificationCode?: string;
  codeExpiresAt?: Date;
  value?: string; // phone number or email being verified

  // Status
  status: VerificationStatus;
  rejectionReason?: string;

  // Review
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;

  // Timeline
  timeline: ITimelineEvent[];

  // Expiry
  expiresAt: Date;

  // Badge contribution
  contributesToBadge: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface IVerificationBadge {
  isVerified: boolean;
  verifiedTypes: VerificationType[];
  trustScore: number; // 0-100
  verifiedAt?: Date;
}

const TimelineEventSchema = new Schema<ITimelineEvent>(
  {
    status: {
      type: String,
      enum: ["pending", "under_review", "approved", "rejected", "expired", "cancelled"],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: "" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const VerificationSchema = new Schema<IVerification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["profile", "nid", "passport", "face", "selfie", "phone", "email", "photo", "identity", "social"],
      required: true,
    },

    // Document fields
    documentUrl: {
      type: String,
      default: "",
    },
    documentPublicId: {
      type: String,
      default: "",
    },
    documentType: {
      type: String,
      default: "",
    },
    documentNumber: {
      type: String,
      default: "",
    },

    // Selfie / Face match
    selfieUrl: {
      type: String,
      default: "",
    },
    selfiePublicId: {
      type: String,
      default: "",
    },
    faceMatchScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    faceMatchedAt: {
      type: Date,
    },

    // OTP / Code verification
    verificationCode: {
      type: String,
      select: false,
    },
    codeExpiresAt: {
      type: Date,
      select: false,
    },
    value: {
      type: String,
      default: "",
    },

    // Status
    status: {
      type: String,
      enum: ["pending", "under_review", "approved", "rejected", "expired", "cancelled"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },

    // Review
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },

    // Timeline
    timeline: {
      type: [TimelineEventSchema],
      default: [],
    },

    // Expiry
    expiresAt: {
      type: Date,
      required: true,
    },

    // Badge contribution
    contributesToBadge: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

VerificationSchema.index({ userId: 1, type: 1 });
VerificationSchema.index({ status: 1 });
VerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
VerificationSchema.index({ userId: 1, contributesToBadge: 1 });

const Verification: Model<IVerification> =
  mongoose.models.Verification ||
  mongoose.model<IVerification>("Verification", VerificationSchema);

export default Verification;