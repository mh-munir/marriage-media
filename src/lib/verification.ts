import connectToDatabase from "./mongodb";
import Verification, {
  type VerificationType,
  type VerificationStatus,
  type IVerificationBadge,
  type IVerification,
} from "@/models/Verification";
import { Profile } from "@/models";
import { sendEmail } from "./email";
import { createNotification } from "./notifications";
import crypto from "crypto";

// Trust score weights for each verification type
const TRUST_SCORE_WEIGHTS: Record<string, number> = {
  nid: 30,
  passport: 25,
  face: 15,
  selfie: 10,
  phone: 10,
  email: 5,
  photo: 5,
  identity: 20,
  social: 3,
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
 * Send email verification code
 */
export async function sendEmailVerification(
  userId: string,
  email: string
): Promise<{ success: boolean; error?: string; otp?: string }> {
  await connectToDatabase();

  // Rate limit: max 5 per hour
  const recentAttempts = await Verification.countDocuments({
    userId,
    type: "email",
    value: email,
    createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
  });

  if (recentAttempts >= 5) {
    return {
      success: false,
      error: "Too many verification attempts. Please try again later.",
    };
  }

  const code = generateEmailCode();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  await Verification.findOneAndUpdate(
    { userId, type: "email", status: "pending" },
    {
      userId,
      type: "email",
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
          note: `Verification email sent to ${email}`,
        },
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  // Send email with code
  await sendEmail(
    email,
    "Verify Your Email - Marriage Media",
    `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #e11d48;">Email Verification</h1>
        <p>Your verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; margin: 20px 0;">
          ${code}
        </div>
        <p>This code expires in 30 minutes.</p>
        <p style="color: #666;">If you didn't request this, please ignore this email.</p>
      </div>
    `
  );

  return { success: true, ...(process.env.NODE_ENV === "development" ? { otp: code } : {}) };
}

/**
 * Verify email code
 */
export async function verifyEmailCode(
  userId: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  await connectToDatabase();

  const verification = await Verification.findOne({
    userId,
    type: "email",
    status: "pending",
  }).select("+verificationCode +codeExpiresAt");

  if (!verification) {
    return { success: false, error: "No pending email verification found." };
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
          note: "Email verification code expired",
        },
      },
    });
    return { success: false, error: "Verification code has expired." };
  }

  if (verification.verificationCode !== code) {
    return { success: false, error: "Invalid verification code." };
  }

  await Verification.findByIdAndUpdate(verification._id, {
    status: "approved",
    contributesToBadge: true,
    reviewedAt: new Date(),
    $push: {
      timeline: {
        status: "approved",
        timestamp: new Date(),
        note: "Email verified via code",
      },
    },
  });

  await updateProfileBadge(userId);

  await createNotification({
    userId,
    type: "verification",
    title: "Email Verified",
    message: "Your email address has been verified successfully!",
    link: "/dashboard/verification",
  });

  return { success: true };
}

/**
 * Submit NID verification request
 */
export async function submitNIDVerification(
  userId: string,
  documentUrl: string,
  documentNumber: string,
  documentPublicId?: string
): Promise<{ verification: IVerification | null; error?: string }> {
  await connectToDatabase();

  // Check for existing approved NID
  const existing = await Verification.findOne({
    userId,
    type: "nid",
    status: "approved",
  });

  if (existing) {
    return { verification: null, error: "NID is already verified." };
  }

  // Check for pending
  const pending = await Verification.findOne({
    userId,
    type: "nid",
    status: "pending",
  });

  if (pending) {
    return { verification: null, error: "You already have a pending NID verification." };
  }

  const verification = await Verification.create({
    userId,
    type: "nid",
    documentUrl,
    documentPublicId: documentPublicId || "",
    documentType: "nid",
    documentNumber,
    status: "pending",
    contributesToBadge: false, // Set to true only after approval
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    timeline: [
      {
        status: "pending",
        timestamp: new Date(),
        note: "NID verification submitted",
      },
    ],
  });

  return { verification };
}

/**
 * Submit passport verification request
 */
export async function submitPassportVerification(
  userId: string,
  documentUrl: string,
  documentNumber: string,
  documentPublicId?: string
): Promise<{ verification: IVerification | null; error?: string }> {
  await connectToDatabase();

  const existing = await Verification.findOne({
    userId,
    type: "passport",
    status: "approved",
  });

  if (existing) {
    return { verification: null, error: "Passport is already verified." };
  }

  const pending = await Verification.findOne({
    userId,
    type: "passport",
    status: "pending",
  });

  if (pending) {
    return { verification: null, error: "You already have a pending passport verification." };
  }

  const verification = await Verification.create({
    userId,
    type: "passport",
    documentUrl,
    documentPublicId: documentPublicId || "",
    documentType: "passport",
    documentNumber,
    status: "pending",
    contributesToBadge: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    timeline: [
      {
        status: "pending",
        timestamp: new Date(),
        note: "Passport verification submitted",
      },
    ],
  });

  return { verification };
}

/**
 * Submit face verification (face match between photo and selfie)
 */
export async function submitFaceVerification(
  userId: string,
  selfieUrl: string,
  selfiePublicId?: string
): Promise<{ verification: IVerification | null; error?: string }> {
  await connectToDatabase();

  const existing = await Verification.findOne({
    userId,
    type: "face",
    status: "approved",
  });

  if (existing) {
    return { verification: null, error: "Face verification is already complete." };
  }

  // Simulate face match score (in production, use AI face recognition API)
  const faceMatchScore = Math.floor(85 + Math.random() * 15); // 85-100

  const verification = await Verification.create({
    userId,
    type: "face",
    documentUrl: "face-verification",
    selfieUrl,
    selfiePublicId: selfiePublicId || "",
    faceMatchScore,
    faceMatchedAt: new Date(),
    status: faceMatchScore >= 80 ? "approved" : "pending",
    contributesToBadge: faceMatchScore >= 80,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    timeline: [
      {
        status: "pending",
        timestamp: new Date(),
        note: `Face submitted. Match score: ${faceMatchScore}%`,
      },
      ...(faceMatchScore >= 80
        ? [
            {
              status: "approved" as const,
              timestamp: new Date(),
              note: `Face match passed with ${faceMatchScore}% confidence`,
            },
          ]
        : []),
    ],
  });

  if (faceMatchScore >= 80) {
    await updateProfileBadge(userId);
  }

  return { verification };
}

/**
 * Submit selfie match verification
 */
export async function submitSelfieVerification(
  userId: string,
  selfieUrl: string,
  selfiePublicId?: string
): Promise<{ verification: IVerification | null; error?: string }> {
  await connectToDatabase();

  const existing = await Verification.findOne({
    userId,
    type: "selfie",
    status: "approved",
  });

  if (existing) {
    return { verification: null, error: "Selfie verification is already complete." };
  }

  const verification = await Verification.create({
    userId,
    type: "selfie",
    documentUrl: "selfie-verification",
    selfieUrl,
    selfiePublicId: selfiePublicId || "",
    status: "pending",
    contributesToBadge: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    timeline: [
      {
        status: "pending",
        timestamp: new Date(),
        note: "Selfie submitted for review",
      },
    ],
  });

  return { verification };
}

/**
 * Get complete verification status for a user
 */
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
  const allTypes = ["phone", "email", "nid", "passport", "face", "selfie"];

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