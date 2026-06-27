export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { AuditLog } from "@/models";

/**
 * GET /api/admin/audit
 * Get audit logs (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectToDatabase();

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const action = url.searchParams.get("action");
    const resource = url.searchParams.get("resource");
    const userId = url.searchParams.get("userId");
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (userId) filter.userId = userId;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "email")
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 });
    }
    console.error("Audit log error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}