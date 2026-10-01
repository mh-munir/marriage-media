import mongoose, { Schema, Document, Model, Query } from "mongoose";

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
  publicId?: string;
  email: string;
  password: string;
  role: "user" | "admin" | "superadmin";
  roleMutationAllowed?: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  resetPasswordAttempts: number;
  registrationOtpHash?: string;
  registrationOtpExpiry?: Date;
  registrationOtpAttempts: number;
  isActive: boolean;
  isBlocked: boolean;
  isProfileVerificationRejected?: boolean;
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
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  gender?: "Male" | "Female";
  onboardingCompleted: boolean;
  onboardingStep: number;
  onboardingData?: Record<string, unknown>;
  // Account lockout fields
  failedLoginAttempts: number;
  lockedUntil?: Date;
  lastFailedLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    publicId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      required: false,
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
    roleMutationAllowed: {
      type: Boolean,
      default: false,
      select: false,
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
    resetPasswordAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    registrationOtpHash: {
      type: String,
      select: false,
    },
    registrationOtpExpiry: {
      type: Date,
      select: false,
    },
    registrationOtpAttempts: {
      type: Number,
      default: 0,
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
    isProfileVerificationRejected: {
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
      match: [/^01[3-9][0-9]{8}$/, "Mobile number must be exactly 11 digits"],
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
    firstName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
    },
    avatarUrl: { type: String, default: "" },
    avatarPublicId: { type: String, default: "" },
    gender: {
      type: String,
      enum: ["Male", "Female"],
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    onboardingStep: { type: Number, default: 1, min: 1, max: 8 },
    // Keeps each onboarding step safely persisted until the full Profile is created.
    onboardingData: { type: Schema.Types.Mixed, default: {} },
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

function assertRoleMutationAllowed(update: unknown): void {
  if (!update || typeof update !== "object") return;
  const updateRecord = update as Record<string, unknown>;
  const setClause = updateRecord.$set && typeof updateRecord.$set === "object"
    ? updateRecord.$set as Record<string, unknown>
    : updateRecord;
  const requestedRole = typeof setClause.role === "string" ? setClause.role : undefined;
  const mutationAllowed = setClause.roleMutationAllowed === true;

  if (
    requestedRole &&
    (requestedRole === "admin" || requestedRole === "superadmin") &&
    !mutationAllowed
  ) {
    throw new Error("Role changes are restricted to the admin creation flow.");
  }
}

UserSchema.pre("save", function (this: IUser) {
  const requestedRole = this.role;
  const isAdminRole = requestedRole === "admin" || requestedRole === "superadmin";

  if (this.isNew) {
    if (isAdminRole && this.roleMutationAllowed !== true) {
      throw new Error("Admin role assignment is restricted to the admin creation flow.");
    }
    return;
  }

  if (this.isModified("role") && requestedRole !== "user" && this.roleMutationAllowed !== true) {
    throw new Error("Role changes are restricted to the admin creation flow.");
  }
});

UserSchema.pre("findOneAndUpdate", function (this: Query<unknown, IUser>) {
  assertRoleMutationAllowed(this.getUpdate());
});

UserSchema.pre("updateOne", function (this: Query<unknown, IUser>) {
  assertRoleMutationAllowed(this.getUpdate());
});

UserSchema.pre("updateMany", function (this: Query<unknown, IUser>) {
  assertRoleMutationAllowed(this.getUpdate());
});

UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ isEmailVerified: 1 });
UserSchema.index({ email: 1 }, { unique: true, sparse: true });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
