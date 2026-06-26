import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { User, Profile, Payment, Interest, Report, FraudLog, Verification } from "@/models";
import { requireAdmin } from "@/lib/auth";

// Get admin analytics dashboard data
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30";
    const since = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    // Core metrics
    const [
      totalUsers,
      newUsers,
      totalProfiles,
      premiumUsers,
      verifiedUsers,
      activeUsers,
      totalInterests,
      newInterests,
      totalPayments,
      revenue,
      pendingReports,
      pendingVerifications,
      fraudAlerts,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: since } }),
      Profile.countDocuments(),
      Profile.countDocuments({ isPremium: true, premiumExpiry: { $gt: new Date() } }),
      Profile.countDocuments({ isVerified: true }),
      Profile.countDocuments({ lastActiveAt: { $gte: since } }),
      Interest.countDocuments(),
      Interest.countDocuments({ createdAt: { $gte: since } }),
      Payment.countDocuments({ status: "completed" }),
      Payment.aggregate([
        { $match: { status: "completed", createdAt: { $gte: since } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Report.countDocuments({ status: "pending" }),
      Verification.countDocuments({ status: "pending" }),
      FraudLog.countDocuments({ status: "detected" }),
    ]);

    // Daily registration trend
    const dailyRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Daily revenue trend
    const dailyRevenue = await Payment.aggregate([
      { $match: { status: "completed", createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Payment method breakdown
    const paymentMethods = await Payment.aggregate([
      { $match: { status: "completed", createdAt: { $gte: since } } },
      { $group: { _id: "$paymentMethod", count: { $sum: 1 }, total: { $sum: "$amount" } } },
    ]);

    // Plan breakdown
    const planBreakdown = await Payment.aggregate([
      { $match: { status: "completed", createdAt: { $gte: since } } },
      { $group: { _id: "$plan", count: { $sum: 1 }, total: { $sum: "$amount" } } },
    ]);

    // Gender distribution
    const genderDistribution = await Profile.aggregate([
      { $group: { _id: "$gender", count: { $sum: 1 } } },
    ]);

    // Age distribution
    const ageDistribution = await Profile.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ["$age", 25] }, then: "18-24" },
                { case: { $lt: ["$age", 30] }, then: "25-29" },
                { case: { $lt: ["$age", 35] }, then: "30-34" },
                { case: { $lt: ["$age", 40] }, then: "35-39" },
                { case: { $gte: ["$age", 40] }, then: "40+" },
              ],
              default: "Unknown",
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      overview: {
        totalUsers,
        newUsers,
        totalProfiles,
        premiumUsers,
        verifiedUsers,
        activeUsers,
        totalInterests,
        newInterests,
        totalPayments,
        totalRevenue: revenue[0]?.total || 0,
        pendingReports,
        pendingVerifications,
        fraudAlerts,
        premiumConversionRate: totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0,
      },
      trends: {
        dailyRegistrations,
        dailyRevenue,
      },
      breakdowns: {
        paymentMethods,
        planBreakdown,
        genderDistribution,
        ageDistribution,
      },
      period: parseInt(period),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}