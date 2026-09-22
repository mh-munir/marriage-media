import connectToDatabase from "./mongodb";
import Verification, {
  type VerificationType,
  type VerificationStatus,
  type IVerificationBadge,
  type IVerification,
} from "@/models/Verification";
import { Profile, User } from "@/models";
import { createNotification } from "./notifications";
import crypto from "crypto";

// Trust score weights for each supported verification type
const TRUST_SCORE_WEIGHTS: Record<VerificationType, number> = {
  phone: 50,
  profile: 50,
};

// Minimum types needed for verified badge
const MIN_VERIFIED_TYPES_FOR_BADGE = 2;

/**
 * Calculate verification badge status for a user
 */
export async function calculateBadge(
  userId: string
): Promise<IVerificationBadge> {
  await connectToDatabase();

  const approvedVerifications = await Verification.find({
    userId,
    status: "approved",
    contributesToBadge: true,
  }).lean();

  const verifiedTypes = approvedVerifications.map(
    (v) => v.type
  ) as VerificationType[];

  // Calculate trust score
  let trustScore = 0;
  const uniqueTypes = [...new Set(verifiedTypes)];
  for (const type of uniqueTypes) {
    trustScore += TRUST_SCORE_WEIGHTS[type] || 0;
  }
  trustScore = Math.min(trustScore, 100);

  const isVerified = uniqueTypes.length >= MIN_VERIFIED_TYPES_FOR_BADGE;

  // Find earliest verification date
  const verifiedAt =
    approvedVerifications.length > 0
      ? new Date(
          Math.min(
            ...approvedVerifications.map((v) =>
              new Date(v.reviewedAt || v.createdAt).getTime()
            )
          )
        )
      : undefined;

  return {
    isVerified,
    verifiedTypes: uniqueTypes,
    trustScore,
    verifiedAt,
  };
}

/**
 * Update the profile's isVerified badge based on verification status
 */
export async function updateProfileBadge(userId: string): Promise<void> {
  const badge = await calculateBadge(userId);

  await Profile.findOneAndUpdate(
    { userId },
    {
      isVerified: badge.isVerified,
      verifiedAt: badge.verifiedAt,
    }
  );
}

/**
 * Generate a verification OTP code
 */
export function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Generate a 6-digit email verification code
 */
export function generateEmailCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Send email verification code for account validation.
 * Kept as a compatibility export for existing admin and API routes.
 */
export async function sendEmailVerification(
  userId: string,
  email: string
): Promise<{ success: boolean; otp?: string; error?: string }> {
  await connectToDatabase();

  const recentCodes = await Verification.countDocuments({
    userId,
    type: "email" as any,
    value: email,
    createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
  } as any);

  if (recentCodes >= 3) {
    return {
      success: false,
      error: "Too many verification attempts. Please try again later.",
    };
  }

  const code = generateEmailCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Verification.findOneAndUpdate(
    { userId, type: "email" as any, status: "pending" } as any,
    {
      userId,
      type: "email" as any,
      value: email,
      verificationCode: code,
      codeExpiresAt: expiresAt,
      status: "pending",
      documentUrl: "email-verification",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      $push: {
        timeline: {
          status: "pending",
          timestamp: new Date(),
          note: `Email verification code sent to ${email}`,
        },
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  console.log(`[Email Verification] ${email}: ${code}`);

  return {
    success: true,
    otp: process.env.NODE_ENV === "development" ? code : undefined,
  };
}

export async function verifyEmailCode(
  userId: string,
  code: string,
  expectedEmail?: string
): Promise<{ success: boolean; error?: string }> {
  await connectToDatabase();

  const matchQuery: Record<string, unknown> = {
    userId,
    type: "email" as any,
    status: "pending",
  };

  if (expectedEmail) {
    matchQuery.value = expectedEmail.trim().toLowerCase();
  }

  const verification = await Verification.findOne(matchQuery as any)
    .select("+verificationCode +codeExpiresAt");

  if (!verification) {
    return {
      success: false,
      error: expectedEmail
        ? "No pending email verification found for this email address."
        : "No pending email verification found.",
    };
  }

  if (verification.codeExpiresAt && new Date() > verification.codeExpiresAt) {
    await Verification.findByIdAndUpdate(verification._id, {
      status: "expired",
      $push: {
        timeline: {
          status: "expired",
          timestamp: new Date(),
          note: "Email verification code expired",
        },
      },
    });
    return { success: false, error: "Verification code has expired. Please request a new one." };
  }

  if (verification.verificationCode !== code) {
    return { success: false, error: "Invalid verification code." };
  }

  await Verification.findByIdAndUpdate(verification._id, {
    status: "approved",
    contributesToBadge: false,
    reviewedAt: new Date(),
    $push: {
      timeline: {
        status: "approved",
        timestamp: new Date(),
        note: "Email verified successfully",
      },
    },
  });

  return { success: true };
}

/**
 * Add a timeline event to a verification record
 */
export async function addTimelineEvent(
  verificationId: string,
  status: VerificationStatus,
  note?: string,
  reviewedBy?: string
): Promise<void> {
  await Verification.findByIdAndUpdate(verificationId, {
    $push: {
      timeline: {
        status,
        timestamp: new Date(),
        note: note || "",
        ...(reviewedBy ? { reviewedBy } : {}),
      },
    },
  });
}

/**
 * Send phone OTP for verification
 */
export async function sendPhoneOTP(
  userId: string,
  phone: string
): Promise<{ success: boolean; otp?: string; error?: string }> {
  await connectToDatabase();

  const user = await User.findById(userId).select("phone isPhoneVerified").lean();
  if (user?.isPhoneVerified && user.phone === phone) {
    return { success: false, error: "This mobile number is already verified." };
  }

  // Rate limit: max 3 OTPs per phone per hour
  const recentOTPs = await Verification.countDocuments({
    userId,
    type: "phone",
    value: phone,
    createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
  });

  if (recentOTPs >= 3) {
    return {
      success: false,
      error: "Too many OTP requests. Please try again later.",
    };
  }

  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Upsert verification record
  await Verification.findOneAndUpdate(
    { userId, type: "phone", status: "pending" },
    {
      userId,
      type: "phone",
      value: phone,
      verificationCode: code,
      codeExpiresAt: expiresAt,
      status: "pending",
      documentUrl: "phone-verification",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h to complete
      $push: {
        timeline: {
          status: "pending",
          timestamp: new Date(),
          note: `OTP sent to ${phone}`,
        },
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  // In production, send via SMS provider (Twilio, etc.)
  console.log(`[Phone OTP] ${phone}: ${code}`);

  return { success: true, otp: process.env.NODE_ENV === "development" ? code : undefined };
}

/**
 * Verify phone OTP
 */
export async function verifyPhoneOTP(
  userId: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  await connectToDatabase();

  const verification = await Verification.findOne({
    userId,
    type: "phone",
    status: "pending",
  }).select("+verificationCode +codeExpiresAt");

  if (!verification) {
    return { success: false, error: "No pending phone verification found." };
  }

  if (
    verification.codeExpiresAt &&
    new Date() > verification.codeExpiresAt
  ) {
    await Verification.findByIdAndUpdate(verification._id, {
      status: "expired",
      $push: {
        timeline: {
          status: "expired",
          timestamp: new Date(),
          note: "OTP expired",
        },
      },
    });
    return { success: false, error: "OTP has expired. Please request a new code." };
  }

  if (verification.verificationCode !== code) {
    return { success: false, error: "Invalid OTP code." };
  }

  // Mark as approved
  await Verification.findByIdAndUpdate(verification._id, {
    status: "approved",
    contributesToBadge: true,
    reviewedAt: new Date(),
    $push: {
      timeline: {
        status: "approved",
        timestamp: new Date(),
        note: "Phone number verified via OTP",
      },
    },
  });

  await User.findByIdAndUpdate(userId, { $set: { isPhoneVerified: true } });

  // Update profile badge
  await updateProfileBadge(userId);

  // Send notification
  await createNotification({
    userId,
    type: "verification",
    title: "Phone Verified",
    message: "Your phone number has been verified successfully!",
    link: "/dashboard/verification",
  });

  return { success: true };
}



/**
 * Get complete verification status for a user
 */
export async function submitProfileVerification(
  userId: string,
  documentUrl = "profile-review"
): Promise<{ verification: IVerification | null; error?: string }> {
  await connectToDatabase();

  const existing = await Verification.findOne({
    userId,
    type: "profile",
    status: { $in: ["pending", "under_review", "approved"] },
  });

  if (existing) {
    return {
      verification: existing,
      error: existing.status === "approved" ? "Profile verification is already complete." : "Profile verification is already pending or under review.",
    };
  }

  const verification = await Verification.create({
    userId,
    type: "profile",
    documentUrl,
    documentType: "profile",
    status: "pending",
    contributesToBadge: false,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    timeline: [
      {
        status: "pending",
        timestamp: new Date(),
        note: "Profile submitted for admin review",
      },
    ],
  });

  return { verification };
}

export async function getVerificationStatus(userId: string): Promise<{
  badge: IVerificationBadge;
  verifications: IVerification[];
  completedSteps: string[];
  totalSteps: number;
}> {
  await connectToDatabase();

  const badge = await calculateBadge(userId);

  const verifications = await Verification.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  const completedSteps: string[] = [];
  const allTypes: VerificationType[] = ["phone", "profile"];

  for (const type of allTypes) {
    const approved = verifications.find(
      (v) => v.type === type && v.status === "approved"
    );
    if (approved) {
      completedSteps.push(type);
    }
  }

  return {
    badge,
    verifications,
    completedSteps,
    totalSteps: allTypes.length,
  };
}
