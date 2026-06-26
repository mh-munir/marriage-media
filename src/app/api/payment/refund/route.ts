import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { Payment } from "@/models";

/**
 * POST /api/payment/refund
 * Request a refund for a payment
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { paymentId, reason } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const payment = await Payment.findOne({
      _id: paymentId,
      userId: user._id,
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    if (payment.status === "refunded") {
      return NextResponse.json(
        { error: "Payment already refunded" },
        { status: 400 }
      );
    }

    if (payment.status !== "completed") {
      return NextResponse.json(
        { error: "Only completed payments can be refunded" },
        { status: 400 }
      );
    }

    // Check if refund is within 30 days
    const paymentDate = new Date(payment.createdAt);
    const now = new Date();
    const daysSincePayment = Math.floor(
      (now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSincePayment > 30) {
      return NextResponse.json(
        { error: "Refund requests must be made within 30 days of payment" },
        { status: 400 }
      );
    }

    // Update payment status to refund pending
    payment.status = "refund_pending";
    payment.refundReason = reason || "";
    payment.refundRequestedAt = new Date();
    await payment.save();

    return NextResponse.json({
      success: true,
      message: "Refund request submitted successfully. It will be reviewed within 3-5 business days.",
      payment: {
        id: payment._id,
        status: payment.status,
        amount: payment.amount,
        refundReason: payment.refundReason,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Refund error:", error);
    return NextResponse.json(
      { error: "Failed to process refund request" },
      { status: 500 }
    );
  }
}