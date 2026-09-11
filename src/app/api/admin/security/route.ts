export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import {
  AuditLog,
  LoginHistory,
  DeviceSession,
  FraudLog,
  BlockedIP,
  User,
} from "@/models";
import { requireAdmin } from "@/lib/auth";
import { blacklistIP, unblacklistIP, whitelistIP, removeWhitelistIP } from "@/lib/security";

/**
 * GET /api/admin/security — Security dashboard overview
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectToDatabase();

    const url = new URL(request.url);
    const section = url.searchParams.get("section") || "overview";

    if (section === "overview") {
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        totalLogins,
        failedLogins24h,
        suspiciousLogins24h,
        activeSessions,
        lockedAccounts,
        fraudAlerts,
        blockedIPs,
        recentAuditActions,
        failedByIP,
      ] = await Promise.all([
        LoginHistory.countDocuments({ createdAt: { $gte: last30d } }),
        LoginHistory.countDocuments({ status: "failed", createdAt: { $gte: last24h } }),
        LoginHistory.countDocuments({ isSuspicious: true, createdAt: { $gte: last24h } }),
        DeviceSession.countDocuments({ isActive: true }),
        User.countDocuments({ lockedUntil: { $gt: now } }),
        FraudLog.countDocuments({ createdAt: { $gte: last7d } }),
        BlockedIP.countDocuments({ type: "blacklist" }),
        AuditLog.countDocuments({ createdAt: { $gte: last24h } }),
        LoginHistory.aggregate([
          { $match: { status: "failed", createdAt: { $gte: last24h } } },
          { $group: { _id: "$ipAddress", count: { $sum: 1 } } },
          { $match: { count: { $gte: 3 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
      ]);

      // Get blocked IPs
      const blacklistedIPs = await BlockedIP.find({ type: "blacklist" })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      // Get whitelist IPs
      const whitelistedIPs = await BlockedIP.find({ type: "whitelist" })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      return NextResponse.json({
        overview: {
          totalLogins30d: totalLogins,
          failedLogins24h,
          suspiciousLogins24h,
          activeSessions,
          lockedAccounts,
          fraudAlerts7d: fraudAlerts,
          blockedIPs,
          recentAuditActions24h: recentAuditActions,
          topAttackingIPs: failedByIP,
        },
        blacklistedIPs,
        whitelistedIPs,
      });
    }

    if (section === "login-history") {
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const skip = parseInt(url.searchParams.get("skip") || "0");
      const status = url.searchParams.get("status");
      const suspicious = url.searchParams.get("suspicious");

      const filter: Record<string, unknown> = {};
      if (status) filter.status = status;
      if (suspicious === "true") filter.isSuspicious = true;

      const [logs, total] = await Promise.all([
        LoginHistory.find(filter)
          .populate("userId", "email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        LoginHistory.countDocuments(filter),
      ]);

      return NextResponse.json({ logs, total, limit, skip });
    }

    if (section === "audit-logs") {
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const skip = parseInt(url.searchParams.get("skip") || "0");
      const action = url.searchParams.get("action");

      const filter: Record<string, unknown> = {};
      if (action) filter.action = action;

      const [logs, total] = await Promise.all([
        AuditLog.find(filter)
          .populate("userId", "email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        AuditLog.countDocuments(filter),
      ]);

      return NextResponse.json({ logs, total, limit, skip });
    }

    if (section === "active-sessions") {
      const sessions = await DeviceSession.find({ isActive: true })
        .populate("userId", "email")
        .sort({ lastActivityAt: -1 })
        .lean();

      return NextResponse.json({ sessions });
    }

    if (section === "fraud-logs") {
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const skip = parseInt(url.searchParams.get("skip") || "0");

      const [logs, total] = await Promise.all([
        FraudLog.find()
          .populate("userId", "email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        FraudLog.countDocuments(),
      ]);

      return NextResponse.json({ logs, total, limit, skip });
    }

    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 403 });
    }
    console.error("Security dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/security — Manage IPs (blacklist/whitelist)
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    await connectToDatabase();

    const body = await request.json();
    const { action, ip, reason, expiresAt } = body;

    if (!action || !ip) {
      return NextResponse.json({ error: "action and ip are required" }, { status: 400 });
    }

    switch (action) {
      case "blacklist":
        await blacklistIP(ip, reason || "Admin action", admin._id.toString(), expiresAt ? new Date(expiresAt) : undefined);
        return NextResponse.json({ message: `IP ${ip} blacklisted` });

      case "unblacklist":
        await unblacklistIP(ip);
        return NextResponse.json({ message: `IP ${ip} unblacklisted` });

      case "whitelist":
        await whitelistIP(ip, reason || "Admin action", admin._id.toString());
        return NextResponse.json({ message: `IP ${ip} whitelisted` });

      case "remove-whitelist":
        await removeWhitelistIP(ip);
        return NextResponse.json({ message: `IP ${ip} removed from whitelist` });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 403 });
    }
    console.error("Security management error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}