import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDeviceSession extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  deviceFingerprint: string;
  deviceType: "desktop" | "mobile" | "tablet";
  deviceBrand: string;
  os: string;
  browser: string;
  ipAddress: string;
  location?: {
    city?: string;
    country?: string;
    coordinates?: { lat: number; lng: number };
  };
  isActive: boolean;
  lastActivityAt: Date;
  loginAt: Date;
  logoutAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DeviceSessionSchema = new Schema<IDeviceSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deviceFingerprint: {
      type: String,
      required: true,
    },
    deviceType: {
      type: String,
      enum: ["desktop", "mobile", "tablet"],
      default: "desktop",
    },
    deviceBrand: { type: String, default: "Unknown" },
    os: { type: String, default: "Unknown" },
    browser: { type: String, default: "Unknown" },
    ipAddress: {
      type: String,
      required: true,
    },
    location: {
      city: { type: String, default: "" },
      country: { type: String, default: "" },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    loginAt: {
      type: Date,
      default: Date.now,
    },
    logoutAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

DeviceSessionSchema.index({ userId: 1, isActive: 1 });
DeviceSessionSchema.index({ userId: 1, deviceFingerprint: 1 });
DeviceSessionSchema.index({ ipAddress: 1 });
DeviceSessionSchema.index({ lastActivityAt: -1 });

const DeviceSession: Model<IDeviceSession> =
  mongoose.models.DeviceSession ||
  mongoose.model<IDeviceSession>("DeviceSession", DeviceSessionSchema);

export default DeviceSession;