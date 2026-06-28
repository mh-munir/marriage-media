import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { User, Profile } from "@/models";
import { subDays } from "date-fns";

export const dynamic = "force-dynamic";

async function getAdminAnalytics(period: number) {
  const startDate = subDays(new Date(), period);
  const previousPeriodStartDate = subDays(new Date(), period * 2);

  // Overview Metrics
  const totalUsers = await User.countDocuments();
  const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
  const newUsersPrevious = await User.countDocuments({ createdAt: { $gte: previousPeriodStartDate, $lt: startDate } });
  const registrationGrowthRate = newUsersPrevious > 0 ? Math.round(((newUsers - newUsersPrevious) / newUsersPrevious) * 100) : newUsers > 0 ? 100 : 0;

  const totalProfiles = await Profile.countDocuments();
  // @ts-ignore - Assuming User model has these fields
  const premiumUsers = await User.countDocuments({ isPremium: true });
  // @ts-ignore - Assuming Profile model has these fields
  const verifiedUsers = await Profile.countDocuments({ isVerified: true });
  // @ts-ignore
  const activeUsers = await User.countDocuments({ lastLogin: { $gte: startDate } });

  // Placeholder data for features not yet implemented
  const totalPayments = 0;
  const totalRevenue = 0;
  const revenueGrowthRate = 0;
  const pendingReports = 0;
  const pendingVerifications = 0;
  const fraudAlerts = 0;
  const premiumConversionRate = totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0;
  const paymentSuccessRate = 0;
  const activeConversations = 0;
  const sentMessages = 0;
  
  // Trends
  const dailyRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, registrations: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", registrations: 1, _id: 0 } }
  ]);

  return {
    overview: {
      totalUsers,
      newUsers,
      registrationGrowthRate,
      totalProfiles,
      premiumUsers,
      verifiedUsers,
      activeUsers,
      totalPayments,
      totalRevenue,
      revenueGrowthRate,
      pendingReports,
      pendingVerifications,
      fraudAlerts,
      premiumConversionRate,
      paymentSuccessRate,
      activeConversations,
      sentMessages,
    },
    trends: {
      dailyRegistrations,
      dailyRevenue: [],
      subscriptionGrowth: [],
    },
    breakdowns: {
      paymentMethods: [],
      paymentStatuses: [],
      planBreakdown: [],
      genderDistribution: [],
      ageDistribution: [],
    },
    aiAnalytics: {
      requests: 0,
      fakeDetectionFlags: 0,
      flaggedRate: 0,
    },
    userActivityHeatmap: [],
    reports: {
      daily: dailyRegistrations.map(r => ({ ...r, _id: r.date, payments: 0, revenue: 0 })),
      monthly: [],
    },
    period,
  };
}


export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const adminUser = await requireAuth(request);

    if (adminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get("period") || "30", 10);

    const analyticsData = await getAdminAnalytics(period);

    return NextResponse.json(analyticsData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Analytics API Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}