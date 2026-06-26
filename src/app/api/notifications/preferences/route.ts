import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { NotificationPreference, Notification } from "@/models";
import { requireAuth } from "@/lib/auth";

// Get notification preferences and counts
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const [preferences, unreadCount, recentNotifications] = await Promise.all([
      NotificationPreference.findOne({ userId: user._id }).lean(),
      Notification.countDocuments({ userId: user._id, isRead: false }),
      Notification.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
    ]);

    return NextResponse.json({
      preferences: preferences || {
        email: { interests: true, messages: true, profileViews: false, payments: true, promotions: false, newsletters: false, security: true },
        push: { interests: true, messages: true, profileViews: true, payments: true, promotions: false },
        sms: { security: true, payments: true },
        quietHoursEnabled: false,
        quietHoursStart: "22:00",
        quietHoursEnd: "08:00",
      },
      unreadCount,
      notifications: recentNotifications,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// Update notification preferences
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const body = await request.json();

    const preferences = await NotificationPreference.findOneAndUpdate(
      { userId: user._id },
      { $set: body },
      { new: true, upsert: true }
    );

    return NextResponse.json({ preferences });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}