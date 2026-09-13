export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { ProfileView } from "@/models";
import { requireAuth } from "@/lib/auth";

// Get visitor analytics for current user's profile
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // days

    const since = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    // Get profile views
    const views = await ProfileView.find({
      viewedId: user._id,
      lastViewedAt: { $gte: since },
    })
      .populate("viewerId", "email")
      .sort({ lastViewedAt: -1 })
      .lean();

    const totalViews = views.reduce((sum, v) => sum + v.viewCount, 0);
    const uniqueViewers = views.length;

    // Get daily view counts for chart
    const dailyViews = await ProfileView.aggregate([
      {
        $match: {
          viewedId: user._id,
          lastViewedAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$lastViewedAt" },
          },
          views: { $sum: "$viewCount" },
          uniqueVisitors: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get top viewers
    const topViewers = await ProfileView.find({ viewedId: user._id })
      .populate("viewerId", "email")
      .sort({ viewCount: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      summary: {
        totalViews,
        uniqueViewers,
        period: parseInt(period),
      },
      dailyViews,
      topViewers: topViewers.map(v => ({
        viewerId: v.viewerId,
        viewCount: v.viewCount,
        lastViewedAt: v.lastViewedAt,
      })),
      recentViews: views.slice(0, 20).map(v => ({
        viewerId: v.viewerId,
        viewCount: v.viewCount,
        lastViewedAt: v.lastViewedAt,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}