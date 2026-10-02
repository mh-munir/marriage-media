import type { Types } from "mongoose";
import { Payment, ProfileDetailAccess, User } from "@/models";
import { getProfileDetailLimit } from "@/lib/pricing";

export async function getActiveSubscription(userId: Types.ObjectId | string) {
  const user = await User.findById(userId).select("role").lean();
  if (!user || user.role !== "user") return null;

  return Payment.findOne({
    userId,
    status: "completed",
    expiryDate: { $gt: new Date() },
  })
    .sort({ expiryDate: -1 })
    .lean();
}

export async function reserveProfileDetailAccess(
  payment: { _id: Types.ObjectId; expiryDate: Date; metadata?: Record<string, unknown>; plan: string },
  viewerId: Types.ObjectId | string,
  profileUserId: Types.ObjectId | string,
) {
  const planId = String(payment.metadata?.planId || payment.plan);
  const limit = getProfileDetailLimit(planId);
  const accessFilter = { viewerId, profileUserId, paymentId: payment._id, expiresAt: { $gt: new Date() } };
  const existingAccess = await ProfileDetailAccess.findOne(accessFilter).select("_id").lean();
  const used = await ProfileDetailAccess.countDocuments({ viewerId, paymentId: payment._id, expiresAt: { $gt: new Date() } });

  if (existingAccess) return { allowed: true, limit, used };
  if (used >= limit) return { allowed: false, limit, used };

  const reservedPayment = await Payment.findOneAndUpdate(
    {
      _id: payment._id,
      status: "completed",
      expiryDate: { $gt: new Date() },
      $or: [
        { "metadata.profileDetailViewsUsed": { $lt: limit } },
        { "metadata.profileDetailViewsUsed": { $exists: false } },
      ],
    },
    { $inc: { "metadata.profileDetailViewsUsed": 1 } },
    { new: true },
  ).select("metadata").lean();

  if (!reservedPayment) {
    const latestPayment = await Payment.findById(payment._id).select("metadata").lean();
    return {
      allowed: false,
      limit,
      used: Math.max(used, Number(latestPayment?.metadata?.profileDetailViewsUsed || 0)),
    };
  }

  try {
    await ProfileDetailAccess.create({
      viewerId,
      profileUserId,
      paymentId: payment._id,
      expiresAt: payment.expiryDate,
    });
    return { allowed: true, limit, used: used + 1 };
  } catch (error: unknown) {
    await Payment.updateOne({ _id: payment._id }, { $inc: { "metadata.profileDetailViewsUsed": -1 } });
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      const repeatedAccess = await ProfileDetailAccess.findOne(accessFilter).select("_id").lean();
      const latestUsed = await ProfileDetailAccess.countDocuments({ viewerId, paymentId: payment._id, expiresAt: { $gt: new Date() } });
      return { allowed: Boolean(repeatedAccess), limit, used: latestUsed };
    }
    throw error;
  }
}
