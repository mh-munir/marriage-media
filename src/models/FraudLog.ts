import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFraudLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: "fake_profile" | "scam_attempt" | "catfishing" | "suspicious_payment" | "harassment_pattern" | "bot_behavior" | "duplicate_account" | "other";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  evidence: {
    type: string;
    data: string;
  }[];
  riskScore: number; // 0-100
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  status: "detected" | "investigating" | "confirmed" | "false_positive" | "resolved";
  actionTaken?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  metadata?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const FraudLogSchema = new Schema<IFraudLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["fake_profile", "scam_attempt", "catfishing", "suspicious_payment", "harassment_pattern", "bot_behavior", "duplicate_account", "other"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    evidence: [
      {
        type: { type: String, default: "" },
        data: { type: String, default: "" },
      },
    ],
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    deviceFingerprint: { type: String, default: "" },
    status: {
      type: String,
      enum: ["detected", "investigating", "confirmed", "false_positive", "resolved"],
      default: "detected",
    },
    actionTaken: { type: String, default: "" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

FraudLogSchema.index({ userId: 1 });
FraudLogSchema.index({ type: 1, severity: 1 });
FraudLogSchema.index({ status: 1 });
FraudLogSchema.index({ riskScore: -1 });
FraudLogSchema.index({ ipAddress: 1 });

const FraudLog: Model<IFraudLog> =
  mongoose.models.FraudLog ||
  mongoose.model<IFraudLog>("FraudLog", FraudLogSchema);

export default FraudLog;