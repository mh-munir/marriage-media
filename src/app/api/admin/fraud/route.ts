import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { FraudLog, User } from "@/models";
import { requireAdmin } from "@/lib/auth";

// Get fraud logs
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") || "detected";
    const validStatuses = ["detected", "investigating", "confirmed", "false_positive", "resolved"] as const;
    const statusFilter = validStatuses.includes(statusParam as typeof validStatuses[number]) ? statusParam as typeof validStatuses[number] : "detected";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      FraudLog.find({ status: statusFilter })
        .populate("userId", "email")
        .sort({ riskScore: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FraudLog.countDocuments({ status: statusFilter }),
    ]);

    return NextResponse.json({
      logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// Review fraud log
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const admin = await requireAdmin(request);

    const body = await request.json();
    const { fraudId, status, actionTaken } = body;

    if (!fraudId || !status) {
      return NextResponse.json({ error: "Fraud ID and status are required" }, { status: 400 });
    }

    const log = await FraudLog.findByIdAndUpdate(
      fraudId,
      {
        $set: {
          status,
          actionTaken: actionTaken || "",
          reviewedBy: admin._id,
          reviewedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!log) {
      return NextResponse.json({ error: "Fraud log not found" }, { status: 404 });
    }

    // If confirmed fraud, block the user
    if (status === "confirmed" && actionTaken === "block_user") {
      await User.findByIdAndUpdate(log.userId, { isBlocked: true });
    }

    return NextResponse.json({ log });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}