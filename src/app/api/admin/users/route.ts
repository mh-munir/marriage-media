export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { User, Profile } from "@/models";
import { requireAdmin } from "@/lib/auth";

// Get all users with admin filters
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const role = searchParams.get("role") || "user";
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> =
      role === "admin-team"
        ? { role: { $in: ["admin", "superadmin"] } }
        : { role: "user" };

    if (search) {
      filter.$or = [{ email: { $regex: search, $options: "i" } }];
    }

    if (status === "active") filter.isActive = true;
    if (status === "blocked") filter.isBlocked = true;
    if (status === "unverified") filter.isEmailVerified = false;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-password")
        .lean(),
      User.countDocuments(filter),
    ]);

    // Attach profile data
    const userIds = users.map((u) => u._id);
    const profiles = await Profile.find({ userId: { $in: userIds } })
      .select(
        "userId firstName lastName gender age isPremium isVerified isDeactivated",
      )
      .lean();

    const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));

    const usersWithProfiles = users.map((u) => ({
      ...u,
      profile: profileMap.get(u._id.toString()) || null,
    }));

    return NextResponse.json({
      users: usersWithProfiles,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// Update user (admin actions)
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    await requireAdmin(request);

    const body = await request.json();
    const { userId, ...updates } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const target = await User.findOne({ _id: userId, role: "user" })
      .select("_id")
      .lean();
    if (!target) {
      return NextResponse.json(
        { error: "Website member not found" },
        { status: 404 },
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true },
    ).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
