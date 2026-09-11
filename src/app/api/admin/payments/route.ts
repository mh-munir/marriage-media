export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { notifyPaymentConfirmation } from "@/lib/notifications";
import { Payment, Profile } from "@/models";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectToDatabase();
    const status = new URL(request.url).searchParams.get("status") || "pending";
    const filter: Record<string, unknown> = { "metadata.submissionType": "manual" };
    if (status !== "all") filter.status = "pending";
    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "email phone")
      .lean();
    const profileUserIds = payments.map((payment) => {
      const user = payment.userId as unknown as { _id?: Types.ObjectId };
      return user?._id;
    }).filter((userId): userId is Types.ObjectId => Boolean(userId));
    const profiles = await Profile.find({ userId: { $in: profileUserIds } }).select("userId firstName lastName").lean();
    const profileNames = new Map(profiles.map((profile) => [profile.userId.toString(), [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Member"]));

    return NextResponse.json({ payments: payments.map((payment) => {
      const user = payment.userId as unknown as { _id?: Types.ObjectId; email?: string; phone?: string };
      return {
        id: payment._id.toString(),
        amount: payment.amount,
        currency: payment.currency,
        plan: payment.metadata?.planId || payment.plan,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        senderMobileNumber: payment.metadata?.senderMobileNumber || payment.billingInfo.phone || "",
        status: payment.status,
        createdAt: payment.createdAt,
        user: {
          id: user?._id?.toString() || "",
          name: user?._id ? profileNames.get(user._id.toString()) || "Member" : "Member",
          email: user?.email || "",
          registeredMobileNumber: user?.phone || "",
        },
      };
    }) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not load payments";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);
    const { paymentId, action } = await request.json() as { paymentId?: string; action?: "approve" | "reject" };
    if (!paymentId || !Types.ObjectId.isValid(paymentId) || !["approve", "reject"].includes(action || "")) {
      return NextResponse.json({ error: "Valid payment and action are required" }, { status: 400 });
    }

    await connectToDatabase();
    const payment = await Payment.findOne({ _id: paymentId, "metadata.submissionType": "manual", status: "pending" });
    if (!payment) return NextResponse.json({ error: "Pending manual payment not found" }, { status: 404 });

    if (action === "reject") {
      payment.status = "failed";
      await payment.save();
      return NextResponse.json({ success: true, status: payment.status });
    }

    payment.status = "completed";
    payment.startDate = new Date();
    payment.expiryDate = new Date(Date.now() + payment.planDuration * 24 * 60 * 60 * 1000);
    await payment.save();
    await Profile.findOneAndUpdate({ userId: payment.userId }, { isPremium: true, premiumExpiry: payment.expiryDate, premiumPlan: payment.metadata?.planId || payment.plan });
    await notifyPaymentConfirmation(payment.userId.toString(), String(payment.metadata?.planId || payment.plan), `BDT ${payment.amount}`, payment.expiryDate.toLocaleDateString(), "/dashboard");

    return NextResponse.json({ success: true, status: payment.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not update payment";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500 });
  }
}
