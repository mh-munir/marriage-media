import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Verification, Profile } from "@/models";
import { requireAdmin } from "@/lib/auth";
import { sendVerificationApprovedEmail } from "@/lib/email";

// Get pending verifications
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") || "pending";
    const validStatuses = ["pending", "approved", "rejected"] as const;
    const statusFilter = validStatuses.includes(statusParam as typeof validStatuses[number]) ? statusParam as typeof validStatuses[number] : "pending";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [verifications, total] = await Promise.all([
      Verification.find({ status: statusFilter })
        .populate("userId", "email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Verification.countDocuments({ status: statusFilter }),
    ]);

    return NextResponse.json({
      verifications,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// Review verification
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const admin = await requireAdmin(request);

    const body = await request.json();
    const { verificationId, status, rejectionReason } = body;

    if (!verificationId || !status) {
      return NextResponse.json({ error: "Verification ID and status are required" }, { status: 400 });
    }

    const verification = await Verification.findByIdAndUpdate(
      verificationId,
      {
        $set: {
          status,
          rejectionReason: rejectionReason || "",
          reviewedBy: admin._id,
          reviewedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!verification) {
      return NextResponse.json({ error: "Verification not found" }, { status: 404 });
    }

    // If approved, update profile
    if (status === "approved") {
      await Profile.findOneAndUpdate(
        { userId: verification.userId },
        { isVerified: true, verifiedAt: new Date() }
      );

      const { User } = await import("@/models");
      const user = await User.findById(verification.userId);
      if (user) {
        await sendVerificationApprovedEmail(user.email, "User");
      }
    }

    return NextResponse.json({ verification });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}