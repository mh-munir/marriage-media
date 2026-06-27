export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { CallHistory, Profile } from "@/models";

/**
 * GET /api/calls/history
 * Get call history for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await connectToDatabase();

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [calls, total] = await Promise.all([
      CallHistory.find({
        $or: [{ callerId: user._id }, { receiverId: user._id }],
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("callerId", "email")
        .populate("receiverId", "email")
        .lean(),
      CallHistory.countDocuments({
        $or: [{ callerId: user._id }, { receiverId: user._id }],
      }),
    ]);

    // Enrich with profile data
    const userIds = new Set<string>();
    calls.forEach((call) => {
      userIds.add((call.callerId as unknown as { _id: string })._id?.toString());
      userIds.add((call.receiverId as unknown as { _id: string })._id?.toString());
    });

    const profiles = await Profile.find({
      userId: { $in: Array.from(userIds) },
    })
      .select("userId firstName lastName photos")
      .lean();

    const profileMap = new Map(
      profiles.map((p) => [p.userId.toString(), p])
    );

    const enrichedCalls = calls.map((call) => {
      const callerProfile = profileMap.get(
        (call.callerId as unknown as { _id: string })._id?.toString()
      );
      const receiverProfile = profileMap.get(
        (call.receiverId as unknown as { _id: string })._id?.toString()
      );
      return {
        ...call,
        callerProfile: callerProfile
          ? {
              firstName: callerProfile.firstName,
              lastName: callerProfile.lastName,
              photo: callerProfile.photos?.find(
                (p: { isPrimary: boolean; isApproved: boolean }) =>
                  p.isPrimary && p.isApproved
              )?.url,
            }
          : null,
        receiverProfile: receiverProfile
          ? {
              firstName: receiverProfile.firstName,
              lastName: receiverProfile.lastName,
              photo: receiverProfile.photos?.find(
                (p: { isPrimary: boolean; isApproved: boolean }) =>
                  p.isPrimary && p.isApproved
              )?.url,
            }
          : null,
      };
    });

    return NextResponse.json({
      calls: enrichedCalls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Call history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch call history" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calls/history
 * Log a call event (completed, missed, declined, failed)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { receiverId, type, status, duration } = body;

    if (!receiverId || !type) {
      return NextResponse.json(
        { error: "receiverId and type are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const call = await CallHistory.create({
      callerId: user._id,
      receiverId,
      type: type || "video",
      status: status || "completed",
      startedAt: new Date(Date.now() - (duration || 0) * 1000),
      endedAt: status === "completed" ? new Date() : undefined,
      duration: duration || 0,
    });

    return NextResponse.json({ call });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Call log error:", error);
    return NextResponse.json(
      { error: "Failed to log call" },
      { status: 500 }
    );
  }
}