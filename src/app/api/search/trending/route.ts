export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Profile } from "@/models";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50);
    const skip = (page - 1) * limit;
    const timeframe = searchParams.get("timeframe") || "7"; // days

    const sinceDate = new Date(Date.now() - parseInt(timeframe) * 24 * 60 * 60 * 1000);

    // Get my profile to determine gender preference
    const myProfile = await Profile.findOne({ userId: user._id }).lean();
    const targetGender = myProfile?.gender === "Male" ? "Female" : "Male";

    const filter: Record<string, unknown> = {
      isVisible: true,
      isDeactivated: false,
      userId: { $ne: user._id },
      gender: targetGender,
    };

    // Trending = boosted + premium + recently active + high view count
    const [profiles, total] = await Promise.all([
      Profile.find({
        ...filter,
        $or: [
          { isProfileBoosted: true, boostedAt: { $gt: sinceDate } },
          { isPremium: true, premiumExpiry: { $gt: new Date() } },
          { lastActiveAt: { $gt: sinceDate } },
          { profileViews: { $gte: 5 } },
        ],
      })
        .sort({
          isProfileBoosted: -1,
          profileViews: -1,
          lastActiveAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .select("firstName lastName gender age height religion caste division district area highestEducation profession isPremium isVerified isProfileBoosted boostedAt lastActiveAt photos maritalStatus profileViews")
        .lean(),
      Profile.countDocuments({
        ...filter,
        $or: [
          { isProfileBoosted: true, boostedAt: { $gt: sinceDate } },
          { isPremium: true, premiumExpiry: { $gt: new Date() } },
          { lastActiveAt: { $gt: sinceDate } },
          { profileViews: { $gte: 5 } },
        ],
      }),
    ]);

    // Calculate a trending score for each profile
    const enrichedProfiles = profiles.map((profile, index) => {
      let trendingScore = 0;
      if (profile.isProfileBoosted) trendingScore += 40;
      if (profile.isPremium) trendingScore += 25;
      trendingScore += Math.min((profile.profileViews || 0) * 2, 20);
      const daysSinceActive = Math.floor(
        (Date.now() - new Date(profile.lastActiveAt).getTime()) / (24 * 60 * 60 * 1000)
      );
      if (daysSinceActive <= 1) trendingScore += 15;
      else if (daysSinceActive <= 3) trendingScore += 10;
      else if (daysSinceActive <= 7) trendingScore += 5;

      // Add some position-based boost
      trendingScore += Math.max(0, 10 - index);

      return {
        ...profile,
        trendingScore: Math.min(trendingScore, 100),
        rank: index + 1,
      };
    });

    return NextResponse.json({
      profiles: enrichedProfiles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      timeframe: `${timeframe} days`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}