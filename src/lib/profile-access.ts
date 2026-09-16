import type { Types } from "mongoose";
import { Payment } from "@/models";

export async function getActiveSubscription(userId: Types.ObjectId | string) {
  return Payment.findOne({
    userId,
    status: "completed",
    expiryDate: { $gt: new Date() },
  })
    .sort({ expiryDate: -1 })
    .lean();
}
