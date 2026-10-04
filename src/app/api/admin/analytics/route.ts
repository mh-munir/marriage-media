export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import {
  Conversation,
  FraudLog,
  Interest,
  Message,
  Payment,
  Profile,
  Report,
  SiteVisitor,
  User,
  Verification,
} from "@/models";
import { requireAdmin } from "@/lib/auth";
import { captureException } from "@/lib/monitoring";
import { syncRejectedProfileUserFlags } from "@/lib/rejected-profile-users";

const PERIOD_OPTIONS = new Set(["7", "30", "90", "365"]);

// Get admin analytics dashboard data
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const requestedPeriod = searchParams.get("period") || "30";
    const period = PERIOD_OPTIONS.has(requestedPeriod) ? Number(requestedPeriod) : 30;
    const now = new Date();
    const since = new Date(now.getTime() - period * 24 * 60 * 60 * 1000);
    const previousSince = new Date(now.getTime() - period * 2 * 24 * 60 * 60 * 1000);
    const approvedManualPaymentFilter = { "metadata.submissionType": "manual", status: "completed" } as const;

    await syncRejectedProfileUserFlags();
    const publicUserFilter = {
      role: "user" as const,
      isPhoneVerified: true,
      isProfileVerificationRejected: { $ne: true },
    };
    const registrationUserFilter = { role: "user" as const };
    const publicUserIds = await User.distinct("_id", publicUserFilter);
    const publicProfileMatch = { userId: { $in: publicUserIds } };
    const activePublicUserIds = await User.distinct("_id", {
      role: "user",
      isPhoneVerified: true,
      isActive: true,
      isBlocked: false,
      isProfileVerificationRejected: { $ne: true },
    });
    const activePublicProfileMatch = {
      userId: { $in: activePublicUserIds },
      isVisible: true,
      isDeactivated: false,
      lastActiveAt: { $gte: since },
    };

    // Core metrics
    const [
      totalUsers,
      totalVisitors,
      newUsers,
      previousNewUsers,
      totalProfiles,
      premiumUsers,
      verifiedUsers,
      activeUsers,
      userGenderCounts,
      totalInterests,
      newInterests,
      totalPayments,
      revenue,
      previousRevenue,
      pendingReports,
      pendingVerifications,
      fraudAlerts,
      activeConversations,
      sentMessages,
      aiRequests,
      aiFakeDetectionFlags,
      dailyRegistrations,
      dailyRevenue,
      paymentMethods,
      paymentStatuses,
      planBreakdown,
      genderDistribution,
      ageDistribution,
      subscriptionGrowth,
      userActivityHeatmap,
      monthlyReports,
    ] = await Promise.all([
      User.countDocuments(publicUserFilter),
      SiteVisitor.countDocuments({}),
      User.countDocuments({ ...registrationUserFilter, createdAt: { $gte: since } }),
      User.countDocuments({ ...registrationUserFilter, createdAt: { $gte: previousSince, $lt: since } }),
      Profile.countDocuments(publicProfileMatch),
      Profile.countDocuments({ ...publicProfileMatch, isPremium: true, premiumExpiry: { $gt: new Date() } }),
      Profile.countDocuments({ ...publicProfileMatch, isVerified: true }),
      Profile.countDocuments(activePublicProfileMatch),
      Profile.aggregate([
        { $match: activePublicProfileMatch },
        { $group: { _id: "$gender", count: { $sum: 1 } } },
      ]),
      Interest.countDocuments(),
      Interest.countDocuments({ createdAt: { $gte: since } }),
      Payment.countDocuments(approvedManualPaymentFilter),
      Payment.aggregate([
        { $match: { ...approvedManualPaymentFilter, createdAt: { $gte: since } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        { $match: { ...approvedManualPaymentFilter, createdAt: { $gte: previousSince, $lt: since } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Report.countDocuments({ status: "pending" }),
      Verification.countDocuments({ status: "pending" }),
      FraudLog.countDocuments({ status: "detected" }),
      Conversation.countDocuments({ lastMessageAt: { $gte: since } }),
      Message.countDocuments({ createdAt: { $gte: since } }),
      FraudLog.countDocuments({ createdAt: { $gte: since } }),
      FraudLog.countDocuments({ status: "detected", createdAt: { $gte: since } }),
      User.aggregate([
        { $match: { ...registrationUserFilter, createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            registrations: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Payment.aggregate([
        { $match: { ...approvedManualPaymentFilter, createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$amount" },
            payments: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Payment.aggregate([
        { $match: { status: { $ne: "failed" }, createdAt: { $gte: since } } },
        { $group: { _id: "$paymentMethod", count: { $sum: 1 }, total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
      ]),
      Payment.aggregate([
        { $match: { status: { $ne: "failed" }, createdAt: { $gte: since } } },
        { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$amount" } } },
        { $sort: { count: -1 } },
      ]),
      Payment.aggregate([
        { $match: { ...approvedManualPaymentFilter, createdAt: { $gte: since } } },
        { $group: { _id: "$plan", count: { $sum: 1 }, total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
      ]),
      Profile.aggregate([
        { $match: publicProfileMatch },
        { $group: { _id: "$gender", count: { $sum: 1 } } },
      ]),
      Profile.aggregate([
        { $match: publicProfileMatch },
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
        { $sort: { _id: 1 } },
      ]),
      Payment.aggregate([
        { $match: { ...approvedManualPaymentFilter, createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            subscriptions: { $sum: 1 },
            revenue: { $sum: "$amount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Profile.aggregate([
        { $match: { ...publicProfileMatch, lastActiveAt: { $gte: since } } },
        {
          $group: {
            _id: {
              dayOfWeek: { $dayOfWeek: "$lastActiveAt" },
              hour: { $hour: "$lastActiveAt" },
            },
            activeUsers: { $sum: 1 },
          },
        },
        { $sort: { "_id.dayOfWeek": 1, "_id.hour": 1 } },
      ]),
      Payment.aggregate([
        { $match: { "metadata.submissionType": "manual", status: { $ne: "failed" }, createdAt: { $gte: previousSince } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            revenue: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$amount", 0] } },
            payments: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const currentRevenue = revenue[0]?.total || 0;
    const priorRevenue = previousRevenue[0]?.total || 0;
    const revenueGrowthRate =
      priorRevenue > 0 ? Math.round(((currentRevenue - priorRevenue) / priorRevenue) * 100) : 0;
    const registrationGrowthRate =
      previousNewUsers > 0 ? Math.round(((newUsers - previousNewUsers) / previousNewUsers) * 100) : 0;
    const maleUsers = userGenderCounts.find((item) => item._id === "Male")?.count || 0;
    const femaleUsers = userGenderCounts.find((item) => item._id === "Female")?.count || 0;
    const premiumConversionRate = totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0;
    return NextResponse.json({
      overview: {
        totalUsers,
        totalVisitors,
        newUsers,
        registrationGrowthRate,
        totalProfiles,
        maleUsers,
        femaleUsers,
        premiumUsers,
        verifiedUsers,
        activeUsers,
        totalInterests,
        newInterests,
        totalPayments,
        totalRevenue: currentRevenue,
        revenueGrowthRate,
        pendingReports,
        pendingVerifications,
        fraudAlerts,
        premiumConversionRate,
        activeConversations,
        sentMessages,
      },
      trends: {
        dailyRegistrations,
        dailyRevenue,
        subscriptionGrowth,
      },
      breakdowns: {
        paymentMethods,
        paymentStatuses,
        planBreakdown,
        genderDistribution,
        ageDistribution,
      },
      aiAnalytics: {
        requests: aiRequests,
        fakeDetectionFlags: aiFakeDetectionFlags,
        flaggedRate: aiRequests > 0 ? Math.round((aiFakeDetectionFlags / aiRequests) * 100) : 0,
      },
      userActivityHeatmap,
      reports: {
        daily: dailyRegistrations.map((item) => ({
          date: item._id,
          registrations: item.registrations,
          revenue: dailyRevenue.find((revenueItem) => revenueItem._id === item._id)?.revenue || 0,
        })),
        monthly: monthlyReports,
      },
      period,
    });
  } catch (error: unknown) {
    captureException(error, { route: "/api/admin/analytics" });
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
