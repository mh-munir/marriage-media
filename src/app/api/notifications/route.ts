export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getUserNotifications, deleteNotifications } from "@/lib/notifications";

/**
 * GET /api/notifications
 * Fetch user notifications with pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const result = await getUserNotifications(user._id.toString(), page, limit);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * DELETE /api/notifications
 * Delete notifications (all or specific IDs).
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json().catch(() => ({}));
    const { notificationIds } = body;

    await deleteNotifications(
      user._id.toString(),
      notificationIds && Array.isArray(notificationIds) ? notificationIds : undefined
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}