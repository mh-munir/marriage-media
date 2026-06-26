import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Notification } from "@/models";
import { requireAuth } from "@/lib/auth";

// Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const body = await request.json();
    const { notificationIds, markAll } = body;

    if (markAll) {
      await Notification.updateMany(
        { userId: user._id, isRead: false },
        { $set: { isRead: true, readAt: new Date() } }
      );
    } else if (notificationIds && Array.isArray(notificationIds)) {
      await Notification.updateMany(
        { _id: { $in: notificationIds }, userId: user._id },
        { $set: { isRead: true, readAt: new Date() } }
      );
    }

    const unreadCount = await Notification.countDocuments({
      userId: user._id,
      isRead: false,
    });

    return NextResponse.json({ unreadCount });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}