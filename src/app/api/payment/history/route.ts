import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { Payment } from "@/models";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { userId: user._id };
    if (status) {
      filter.status = status;
    }

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("amount currency plan planDuration paymentMethod transactionId status invoiceNumber startDate expiryDate createdAt")
        .lean(),
      Payment.countDocuments(filter),
    ]);

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch payment history";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}