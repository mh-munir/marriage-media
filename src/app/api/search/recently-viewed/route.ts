import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Profile, ProfileView } from "@/models";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50);
    const skip = (page - 1) * limit;

    // Get the IDs of profiles this user has viewed, sorted by most recent
    const viewRecords = await ProfileView.find({ viewerId: user._id })
      .sort({ lastViewedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ProfileView.countDocuments({ viewerId: user._id });

    if (viewRecords.length === 0) {
      return NextResponse.json({
        profiles: [],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }

    // Get the full profiles for viewed users
    const viewedUserIds = viewRecords.map((v) => v.viewedId);
    const profiles = await Profile.find({ userId: { $in: viewedUserIds } })
      .select("firstName lastName gender age height religion caste division district area highestEducation profession isPremium isVerified isProfileBoosted boostedAt lastActiveAt photos aboutMe maritalStatus")
      .lean();

    // Map view counts and timestamps back to profiles
    const viewMap = new Map(
      viewRecords.map((v) => [v.viewedId.toString(), { viewCount: v.viewCount, lastViewedAt: v.lastViewedAt }])
    );

    const enrichedProfiles = profiles.map((profile) => {
      const viewInfo = viewMap.get(profile.userId.toString());
      return {
        ...profile,
        viewCount: viewInfo?.viewCount || 1,
        lastViewedAt: viewInfo?.lastViewedAt || null,
      };
    });

    // Sort by lastViewedAt to maintain the order from ProfileView
    enrichedProfiles.sort((a, b) => {
      const dateA = a.lastViewedAt ? new Date(a.lastViewedAt).getTime() : 0;
      const dateB = b.lastViewedAt ? new Date(b.lastViewedAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({
      profiles: enrichedProfiles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}