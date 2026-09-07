import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPushSubscription {
  type: "fcm" | "webpush";
  token?: string;
  endpoint?: string;
  keys?: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  createdAt: Date;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  role: "user" | "admin" | "superadmin";
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  isActive: boolean;
  isBlocked: boolean;
  blockedUsers: mongoose.Types.ObjectId[];
  profileCompleted: number;
  lastLoginAt?: Date;
  // Phone
  phone?: string;
  phoneCountryCode?: string;
  isPhoneVerified: boolean;
  // Push notifications
  pushSubscriptions: IPushSubscription[];
  lastPushRegistrationAt?: Date;
  // WhatsApp
  whatsappNumber?: string;
  whatsappOptIn: boolean;
  // Account lockout fields
  failedLoginAttempts: number;
  lockedUntil?: Date;
  lastFailedLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpiry: {
      type: Date,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpiry: {
      type: Date,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    phoneCountryCode: {
      type: String,
      default: "+880",
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    pushSubscriptions: [
      {
        type: { type: String, enum: ["fcm", "webpush"] },
        token: { type: String },
        endpoint: { type: String },
        keys: {
          p256dh: { type: String },
          auth: { type: String },
        },
        userAgent: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    lastPushRegistrationAt: {
      type: Date,
    },
    whatsappNumber: {
      type: String,
      default: "",
    },
    whatsappOptIn: {
      type: Boolean,
      default: false,
    },
    profileCompleted: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastLoginAt: {
      type: Date,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockedUntil: {
      type: Date,
    },
    lastFailedLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ isEmailVerified: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;