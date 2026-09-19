import type { Types } from "mongoose";
import { Payment, User } from "@/models";

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
