export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import { User, Profile, Payment, ProfileDetailAccess, ProfileView, Verification } from "@/models";
import { requireAdmin } from "@/lib/auth";
import { sendEmailVerification, sendPhoneOTP, verifyEmailCode, verifyPhoneOTP } from "@/lib/verification";
import { validatePhoneNumber } from "@/lib/utils";
import { removeDeprecatedLifestyleFields } from "@/lib/remove-deprecated-lifestyle-fields";
import { syncRejectedProfileUserFlags } from "@/lib/rejected-profile-users";
import { getProfileDetailLimit } from "@/lib/pricing";
import { ADMIN_ONBOARDING_PROFILE_FIELDS, ADMIN_ONBOARDING_USER_FIELDS } from "@/lib/admin-onboarding-fields";
import { parsePaginationParams } from "@/lib/validation";

// Get all users with admin filters
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    await removeDeprecatedLifestyleFields();
    await requireAdmin(request);
    await syncRejectedProfileUserFlags();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePaginationParams(searchParams, {
      defaultPage: 1,
      defaultLimit: 20,
      maxLimit: 100,
    });
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const role = searchParams.get("role") || "user";
    const segment = searchParams.get("segment") || "";
    const userId = searchParams.get("userId") || "";
    const isPublicUsersView = role === "user" || role === "members";

    if (userId) {
      const [user, profile] = await Promise.all([
        User.findOne({ _id: userId, role: "user" }).select(ADMIN_ONBOARDING_USER_FIELDS).lean(),
        Profile.findOne({ userId }).select(ADMIN_ONBOARDING_PROFILE_FIELDS).lean(),
      ]);

      if (!user) return NextResponse.json({ error: "Public user not found" }, { status: 404 });

      return NextResponse.json({
        user: {
          ...user,
          profile: profile || null,
        },
      });
    }
    const filter: Record<string, unknown> =
      role === "admin-team"
        ? { role: { $in: ["admin", "superadmin"] } }
        : { role: "user" };

    let approvedProfileUserIds: Types.ObjectId[] | null = null;
    if (isPublicUsersView) {
      filter.isProfileVerificationRejected = { $ne: true };
      const latestProfileReviews = await Verification.aggregate([
        { $match: { type: "profile" } },
        { $sort: { createdAt: -1, _id: -1 } },
        { $group: { _id: "$userId", status: { $first: "$status" } } },
        { $match: { status: "approved" } },
      ]);
      approvedProfileUserIds = latestProfileReviews.map((review) => review._id as Types.ObjectId);
      filter._id = { $in: approvedProfileUserIds };
    }

    if (isPublicUsersView && (segment === "free" || segment === "subscribed")) {
      const [paidUserIds, premiumProfileUserIds] = await Promise.all([
        Payment.distinct("userId", {
          status: "completed",
        }),
        Profile.distinct("userId", { isPremium: true }),
      ]);
      const subscribedUserIds = [...new Set([...paidUserIds, ...premiumProfileUserIds].map(String))]
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id));
      const subscribedUserIdSet = new Set(subscribedUserIds.map((id) => id.toString()));
      filter._id = {
        $in: (approvedProfileUserIds || []).filter((id) =>
          segment === "subscribed"
            ? subscribedUserIdSet.has(id.toString())
            : !subscribedUserIdSet.has(id.toString())
        ),
      };
    }

    if (search) {
      const searchableFields = isPublicUsersView
        ? ["phone", "publicId"]
        : ["email", "phone", "firstName", "lastName"];
      filter.$or = searchableFields.map((field) => ({
        [field]: { $regex: search, $options: "i" },
      }));
    }

    if (status === "active") filter.isActive = true;
    if (status === "blocked") filter.isBlocked = true;
    if (status === "unverified") filter.isEmailVerified = false;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-password")
        .lean(),
      User.countDocuments(filter),
    ]);

    // Attach profile data
    const userIds = users.map((u) => u._id);
    const [profiles, payments, biodataVisits] = await Promise.all([
      Profile.find({ userId: { $in: userIds } }).lean(),
      Payment.find({ userId: { $in: userIds }, status: "completed" })
        .sort({ expiryDate: -1 })
        .select("userId expiryDate metadata plan")
        .lean(),
      ProfileView.aggregate([
        { $match: { viewerId: { $in: userIds } } },
        { $group: { _id: "$viewerId", totalVisits: { $sum: "$viewCount" }, uniqueBiodatas: { $sum: 1 } } },
      ]),
    ]);

    const profileDetailAccesses = await ProfileDetailAccess.find({
      paymentId: { $in: payments.map((payment) => payment._id) },
    }).select("paymentId").lean();

    const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));
    const biodataVisitMap = new Map(biodataVisits.map((visit) => [visit._id.toString(), {
      totalVisits: Number(visit.totalVisits || 0),
      uniqueBiodatas: Number(visit.uniqueBiodatas || 0),
    }]));
    const subscriptionMap = new Map<string, (typeof payments)[number]>();
    const subscriptionUsageMap = new Map<string, number>();
    for (const access of profileDetailAccesses) {
      const paymentId = access.paymentId.toString();
      subscriptionUsageMap.set(paymentId, (subscriptionUsageMap.get(paymentId) || 0) + 1);
    }
    for (const payment of payments) {
      const key = payment.userId.toString();
      if (!subscriptionMap.has(key)) subscriptionMap.set(key, payment);
    }

    const usersWithProfiles = users.map((u) => ({
      ...u,
      profile: profileMap.get(u._id.toString()) || null,
      displayName: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
      biodataVisits: biodataVisitMap.get(u._id.toString()) || { totalVisits: 0, uniqueBiodatas: 0 },
      subscription: u.role === "user" ? (() => {
        const payment = subscriptionMap.get(u._id.toString());
        if (!payment) return null;
        const expiryDate = payment.expiryDate.toISOString();
        const plan = String(payment.metadata?.planId || payment.plan).toLowerCase();
        const biodataLimit = getProfileDetailLimit(plan);
        const biodataUsed = subscriptionUsageMap.get(payment._id.toString()) || 0;
        return {
          plan,
          expiryDate,
          isActive: payment.expiryDate > new Date(),
          daysRemaining: Math.max(0, Math.ceil((payment.expiryDate.getTime() - Date.now()) / 86_400_000)),
          biodataLimit,
          biodataUsed,
          biodataRemaining: biodataLimit < 0 ? null : Math.max(0, biodataLimit - biodataUsed),
        };
      })() : null,
    }));

    return NextResponse.json({
      users: usersWithProfiles,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// Update user (admin actions)
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const actor = await requireAdmin(request);

    const body = await request.json();
    const { userId, changeOtp, ...updates } = body as { userId?: string; changeOtp?: string; [key: string]: unknown };

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const target = await User.findById(userId).select("_id role isEmailVerified isPhoneVerified").lean();
    if (!target) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    if (target.role === "superadmin") {
      if (actor.role !== "superadmin" || actor._id.toString() !== userId) {
        return NextResponse.json({ error: "Only the superadmin can edit this account" }, { status: 403 });
      }
    } else if (target.role === "admin") {
      if (actor.role !== "superadmin") {
        return NextResponse.json({ error: "Only the superadmin can edit admin accounts" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "This account cannot be edited here" }, { status: 403 });
    }

    const nextEmail = typeof updates.email === "string" ? updates.email.trim().toLowerCase() : "";
    const emailChanged = Boolean(nextEmail && nextEmail !== String(actor.email || "").toLowerCase());
    const password = typeof updates.password === "string" ? updates.password : "";
    if (password && (actor.role !== "superadmin" || password.length < 8)) {
      return NextResponse.json({ error: "Only the superadmin can set a password of at least 8 characters" }, { status: 400 });
    }

    if (target.role === "superadmin" && (emailChanged || password)) {
      if (nextEmail && !/^\S+@\S+\.\S+$/.test(nextEmail)) {
        return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
      }
      if (!/^\d{6}$/.test(String(changeOtp || ""))) {
        return NextResponse.json({ error: "Enter the OTP sent to your current superadmin email" }, { status: 400 });
      }
      if (emailChanged) {
        const emailInUse = await User.exists({ email: nextEmail, _id: { $ne: actor._id } });
        if (emailInUse) return NextResponse.json({ error: "This email is already in use" }, { status: 409 });
      }

      const currentEmail = String(actor.email || "").trim().toLowerCase();
      if (!currentEmail) {
        return NextResponse.json({ error: "Your superadmin account has no email address on file" }, { status: 400 });
      }

      const result = await verifyEmailCode(actor._id.toString(), String(changeOtp), currentEmail);
      if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const allowedUpdates = {
      firstName: updates.firstName,
      lastName: updates.lastName,
      email: emailChanged ? nextEmail : undefined,
      phone: updates.phone,
      isActive: actor.role === "superadmin" ? updates.isActive : undefined,
      isBlocked: actor.role === "superadmin" ? updates.isBlocked : undefined,
      ...(password ? { password: await bcrypt.hash(password, 12) } : {}),
      ...(target.role === "superadmin" && (emailChanged || password) ? { isEmailVerified: true } : {}),
    };
    const cleanUpdates = Object.fromEntries(Object.entries(allowedUpdates).filter(([, value]) => value !== undefined));

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: cleanUpdates },
      { returnDocument: "after" },
    ).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const actor = await requireAdmin(request);
    if (actor.role !== "superadmin") {
      return NextResponse.json({ error: "Only the superadmin can create admin accounts" }, { status: 403 });
    }

    const body = await request.json() as { email?: string; phone?: string; password?: string; firstName?: string; lastName?: string };
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").replace(/\s/g, "");
    const password = String(body.password || "");
    if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    if (!validatePhoneNumber(phone)) return NextResponse.json({ error: "A valid 11-digit mobile number is required" }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    const existing = await User.findOne({ $or: [{ email }, { phone }] }).select("email phone").lean();
    if (existing) return NextResponse.json({ error: "An account already uses this email or mobile number" }, { status: 409 });

    const user = await User.create({
      email,
      phone,
      password: await bcrypt.hash(password, 12),
      role: "admin",
      roleMutationAllowed: true,
      firstName: String(body.firstName || "").trim(),
      lastName: String(body.lastName || "").trim(),
      isActive: true,
      isBlocked: false,
      isEmailVerified: false,
      isPhoneVerified: false,
    });

    return NextResponse.json({ user: { id: user._id.toString(), email: user.email, phone: user.phone, role: user.role } }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();
    const actor = await requireAdmin(request);

    const body = await request.json() as {
      action?: string;
      email?: string;
      phone?: string;
      code?: string;
      userId?: string;
      isBlocked?: boolean;
    };
    const action = body.action;

    if (action === "toggle-block") {
      const { userId, isBlocked } = body;
      if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });
      const target = await User.findById(userId).select("_id role isBlocked").lean();
      if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
      if (target.role !== "user") return NextResponse.json({ error: "Only public users can be blocked here" }, { status: 403 });
      const nextBlocked = Boolean(isBlocked);
      await User.findByIdAndUpdate(userId, { $set: { isBlocked: nextBlocked } }, { new: true });
      return NextResponse.json({ message: nextBlocked ? "User blocked successfully." : "User unblocked successfully." });
    }

    if (actor.role !== "superadmin") return NextResponse.json({ error: "Only the superadmin can verify these details" }, { status: 403 });

    if (action === "send-superadmin-change-otp") {
      const email = String(actor.email || "").trim().toLowerCase();
      if (!email) return NextResponse.json({ error: "Your superadmin account has no email address" }, { status: 400 });
      const result = await sendEmailVerification(actor._id.toString(), email);
      return result.success
        ? NextResponse.json({ message: "OTP sent to the current superadmin email", ...(result.otp ? { otp: result.otp } : {}) })
        : NextResponse.json({ error: result.error }, { status: 429 });
    }
    if (action === "send-email") {
      const email = String(body.email || "").trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
      const existing = await User.findOne({ email, _id: { $ne: actor._id } }).select("_id").lean();
      if (existing) return NextResponse.json({ error: "This email is already in use" }, { status: 409 });
      const result = await sendEmailVerification(actor._id.toString(), email);
      return result.success ? NextResponse.json({ message: "Email verification code sent", ...(result.otp ? { otp: result.otp } : {}) }) : NextResponse.json({ error: result.error }, { status: 429 });
    }
    if (action === "send-phone") {
      const phone = String(body.phone || "").replace(/\s/g, "");
      if (!validatePhoneNumber(phone)) return NextResponse.json({ error: "A valid 11-digit mobile number is required" }, { status: 400 });
      const existing = await User.findOne({ phone, _id: { $ne: actor._id } }).select("_id").lean();
      if (existing) return NextResponse.json({ error: "This mobile number is already in use" }, { status: 409 });
      const result = await sendPhoneOTP(actor._id.toString(), phone);
      return result.success ? NextResponse.json({ message: "Mobile verification code sent", ...(result.otp ? { otp: result.otp } : {}) }) : NextResponse.json({ error: result.error }, { status: 429 });
    }
    if (action === "verify-email" || action === "verify-phone") {
      const code = String(body.code || "");
      if (!/^\d{6}$/.test(code)) return NextResponse.json({ error: "Enter the 6-digit verification code" }, { status: 400 });
      if (action === "verify-email") {
        const email = String(body.email || "").trim().toLowerCase();
        const pending = await Verification.findOne({ userId: actor._id, type: "email", status: "pending", value: email }).select("_id").lean();
        if (!pending) return NextResponse.json({ error: "Request a verification code for this email first" }, { status: 400 });
        const result = await verifyEmailCode(actor._id.toString(), code);
        if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
        await User.findByIdAndUpdate(actor._id, { $set: { email, isEmailVerified: true } });
      } else {
        const phone = String(body.phone || "").replace(/\s/g, "");
        const pending = await Verification.findOne({ userId: actor._id, type: "phone", status: "pending", value: phone }).select("_id").lean();
        if (!pending) return NextResponse.json({ error: "Request a verification code for this mobile number first" }, { status: 400 });
        const result = await verifyPhoneOTP(actor._id.toString(), code);
        if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
        await User.findByIdAndUpdate(actor._id, { $set: { phone, isPhoneVerified: true } });
      }
      return NextResponse.json({ message: "Verification completed" });
    }
    return NextResponse.json({ error: "Unsupported verification action" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const actor = await requireAdmin(request);
    if (actor.role !== "superadmin" && actor.role !== "admin") {
      return NextResponse.json({ error: "Only administrators can delete public accounts" }, { status: 403 });
    }

    const body = await request.json() as { userId?: string };
    const userId = body.userId;
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const target = await User.findById(userId).select("_id role phone email").lean();
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (target.role !== "user") {
      return NextResponse.json({ error: "Only public users can be permanently deleted" }, { status: 403 });
    }

    await Promise.all([
      User.deleteOne({ _id: userId }),
      Profile.deleteMany({ userId }),
      Payment.deleteMany({ userId }),
      (await import("@/models")).Verification.deleteMany({ userId }),
    ]);

    return NextResponse.json({ message: "User permanently deleted from the database." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
