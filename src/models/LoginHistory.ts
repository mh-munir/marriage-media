import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILoginHistory extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: string;
  deviceType: "desktop" | "mobile" | "tablet";
  deviceBrand: string;
  os: string;
  browser: string;
  location?: {
    city?: string;
    country?: string;
    coordinates?: { lat: number; lng: number };
  };
  status: "success" | "failed" | "blocked";
  failureReason?: string;
  isSuspicious: boolean;
  createdAt: Date;
}

const LoginHistorySchema = new Schema<ILoginHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      default: "",
    },
    deviceFingerprint: {
      type: String,
      default: "",
    },
    deviceType: {
      type: String,
      enum: ["desktop", "mobile", "tablet"],
      default: "desktop",
    },
    deviceBrand: { type: String, default: "Unknown" },
    os: { type: String, default: "Unknown" },
    browser: { type: String, default: "Unknown" },
    location: {
      city: { type: String, default: "" },
      country: { type: String, default: "" },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    status: {
      type: String,
      enum: ["success", "failed", "blocked"],
      required: true,
    },
    failureReason: { type: String, default: "" },
    isSuspicious: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

LoginHistorySchema.index({ userId: 1, createdAt: -1 });
LoginHistorySchema.index({ ipAddress: 1 });
LoginHistorySchema.index({ status: 1, isSuspicious: 1 });
LoginHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

const LoginHistory: Model<ILoginHistory> =
  mongoose.models.LoginHistory ||
  mongoose.model<ILoginHistory>("LoginHistory", LoginHistorySchema);

export default LoginHistory;