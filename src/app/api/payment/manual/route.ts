export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { generateInvoiceNumber, requireAuth } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { defaultPricingPlans } from "@/lib/pricing";
import { Payment, SitePage, User } from "@/models";

type ManualPaymentBody = {
  planId?: string;
  paymentMethod?: "bkash" | "nagad";
  senderMobileNumber?: string;
  transactionId?: string;
};

function priceToNumber(value: string): number {
  return Number(value.replace(/[^0-9.]/g, ""));
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = (await request.json()) as ManualPaymentBody;
    const senderMobileNumber = body.senderMobileNumber?.replace(/\D/g, "") || "";
    const transactionId = body.transactionId?.trim().toUpperCase() || "";

    if (!body.planId || !["bkash", "nagad"].includes(body.paymentMethod || "")) {
      return NextResponse.json({ error: "Select a plan and payment method" }, { status: 400 });
    }
    if (!/^01[3-9]\d{8}$/.test(senderMobileNumber)) {
      return NextResponse.json({ error: "Enter a valid 11-digit sender mobile number" }, { status: 400 });
    }
    if (transactionId.length < 6 || transactionId.length > 100) {
      return NextResponse.json({ error: "Enter a valid transaction ID" }, { status: 400 });
    }

    await connectToDatabase();
    const page = await SitePage.findOne({ slug: "pricing" }).select("pricingPlans").lean();
    const plans = page?.pricingPlans?.length ? page.pricingPlans : defaultPricingPlans;
    const plan = plans.find((item) => item.id === body.planId);
    const amount = plan ? priceToNumber(plan.price) : 0;

    if (!plan || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "This plan does not require a manual payment" }, { status: 400 });
    }

    const existingPayment = await Payment.exists({ transactionId });
    if (existingPayment) {
      return NextResponse.json({ error: "This transaction ID has already been submitted" }, { status: 409 });
    }

    const payment = await Payment.create({
      userId: user._id,
      amount,
      currency: "BDT",
      plan: "monthly",
      planDuration: 30,
      paymentMethod: body.paymentMethod,
      transactionId,
      status: "pending",
      invoiceNumber: generateInvoiceNumber(),
      billingInfo: { name: user.email || "Marriage Media member", email: user.email || "member@marriagemedia.local", phone: senderMobileNumber, address: "" },
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      metadata: { submissionType: "manual", planId: plan.id, senderMobileNumber },
    });

    const admins = await User.find({ role: { $in: ["admin", "superadmin"] }, isActive: true }).select("_id").lean();
    await Promise.all(admins.map((admin) => createNotification({
      userId: admin._id.toString(),
      type: "payment",
      title: "Manual payment submitted",
      message: `${body.paymentMethod === "bkash" ? "bKash" : "Nagad"} payment for ${plan.name}: ৳${amount}. Transaction ID: ${transactionId}.`,
      link: "/admin/payments",
      channels: ["inapp"],
    })));

    return NextResponse.json({ success: true, paymentId: payment._id.toString() }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not submit payment";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}
