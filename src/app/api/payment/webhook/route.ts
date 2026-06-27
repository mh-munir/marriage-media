export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Payment, Profile } from "@/models";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, data } = body;

    await connectToDatabase();

    switch (event) {
      case "payment.success": {
        const { transactionId, userId, plan, amount, currency, method, invoiceNumber, billingInfo, planDuration } = data;

        const now = new Date();
        const expiry = new Date(now);
        expiry.setDate(expiry.getDate() + (planDuration || 30));

        await Payment.create({
          userId,
          transactionId,
          plan,
          planDuration: planDuration || 30,
          amount,
          currency: currency || "BDT",
          paymentMethod: method,
          status: "completed",
          invoiceNumber: invoiceNumber || `INV-${Date.now()}`,
          billingInfo: billingInfo || { name: "User", email: "user@email.com" },
          startDate: now,
          expiryDate: expiry,
        });

        // Update profile premium status
        const planDurations: Record<string, number> = {
          silver: 30,
          gold: 30,
          platinum: 30,
        };

        const days = planDurations[plan] || 30;
        const premiumExpiry = new Date();
        premiumExpiry.setDate(premiumExpiry.getDate() + days);

        await Profile.findOneAndUpdate(
          { userId },
          {
            isPremium: true,
            premiumExpiry,
            premiumPlan: plan,
          }
        );

        break;
      }

      case "payment.failed": {
        const { transactionId, reason } = data;

        await Payment.findOneAndUpdate(
          { transactionId },
          {
            status: "failed",
          }
        );

        void reason;
        break;
      }

      case "subscription.renewed": {
        const { userId, plan: renewPlan, newExpiry } = data;

        await Profile.findOneAndUpdate(
          { userId },
          {
            premiumExpiry: new Date(newExpiry),
            premiumPlan: renewPlan,
          }
        );

        break;
      }

      case "subscription.expired": {
        const { userId } = data;

        await Profile.findOneAndUpdate(
          { userId },
          {
            isPremium: false,
            premiumPlan: "",
          }
        );

        break;
      }

      default:
        return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}