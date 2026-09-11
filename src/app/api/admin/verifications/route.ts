export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Verification, User } from "@/models";
import { requireAdmin } from "@/lib/auth";
import { sendVerificationApprovedEmail } from "@/lib/email";
import { updateProfileBadge } from "@/lib/verification";
import { createNotification } from "@/lib/notifications";

// Get pending verifications
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") || "pending";
    const validStatuses = ["pending", "under_review", "approved", "rejected", "expired", "cancelled"] as const;
    const statusFilter = validStatuses.includes(statusParam as (typeof validStatuses)[number])
      ? (statusParam as (typeof validStatuses)[number])
      : "pending";
    const typeFilter = searchParams.get("type") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { status: statusFilter };
    if (typeFilter) {
      filter.type = typeFilter;
    }

    const [verifications, total] = await Promise.all([
      Verification.find(filter)
        .populate("userId", "email")
        .populate("reviewedBy", "email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Verification.countDocuments(filter),
    ]);

    // Get counts for each status
    const statusCounts = await Verification.aggregate([
      ...(typeFilter ? [{ $match: { type: typeFilter } }] : []),
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    return NextResponse.json({
      verifications,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      statusCounts: statusCounts.reduce(
        (acc: Record<string, number>, item: { _id: string; count: number }) => {
          acc[item._id] = item.count;
          return acc;
        },
        {}
      ),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
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
      return NextResponse.json(
        { error: "Verification ID and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["under_review", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const verification = await Verification.findById(verificationId);
    if (!verification) {
      return NextResponse.json(
        { error: "Verification not found" },
        { status: 404 }
      );
    }

    // Build timeline note
    let timelineNote = "";
    if (status === "approved") {
      timelineNote = "Verified by admin";
      if (verification.type === "face" && verification.faceMatchScore) {
        timelineNote += ` (Face match: ${verification.faceMatchScore}%)`;
      }
    } else if (status === "rejected") {
      timelineNote = rejectionReason || "Verification rejected by admin";
    } else if (status === "under_review") {
      timelineNote = "Under review by admin";
    }

    // Update verification
    const updated = await Verification.findByIdAndUpdate(
      verificationId,
      {
        $set: {
          status,
          rejectionReason: rejectionReason || "",
          reviewedBy: admin._id,
          reviewedAt: new Date(),
          contributesToBadge: status === "approved",
        },
        $push: {
          timeline: {
            status,
            timestamp: new Date(),
            note: timelineNote,
            reviewedBy: admin._id,
          },
        },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update verification" },
        { status: 500 }
      );
    }

    // If approved, update profile badge
    if (status === "approved") {
      await updateProfileBadge(verification.userId.toString());

      const user = await User.findById(verification.userId);
      if (user) {
        await sendVerificationApprovedEmail(user.email, "User");

        // Send notification
        await createNotification({
          userId: verification.userId.toString(),
          type: "verification",
          title: `${verification.type.charAt(0).toUpperCase() + verification.type.slice(1)} Verification Approved`,
          message: `Your ${verification.type} verification has been approved!`,
          link: "/dashboard/verification",
        });
      }
    }

    // If rejected, notify user
    if (status === "rejected") {
      await createNotification({
        userId: verification.userId.toString(),
        type: "verification",
        title: `${verification.type.charAt(0).toUpperCase() + verification.type.slice(1)} Verification Rejected`,
        message: rejectionReason
          ? `Your ${verification.type} verification was rejected: ${rejectionReason}`
          : `Your ${verification.type} verification was rejected. Please try again.`,
        link: "/dashboard/verification",
      });
    }

    return NextResponse.json({ verification: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}