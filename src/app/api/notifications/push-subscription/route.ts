import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { User } from "@/models";

/**
 * POST /api/notifications/push-subscription
 * Register a push notification subscription (FCM token or web push subscription)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { token, endpoint, keys } = body;

    await connectToDatabase();

    // Store the push subscription on the user document
    const pushSubscription = token
      ? { type: "fcm", token }
      : { type: "webpush", endpoint, keys };

    await User.findByIdAndUpdate(user._id, {
      $push: {
        pushSubscriptions: {
          $each: [pushSubscription],
          $slice: -5, // Keep only last 5 subscriptions
        },
      },
      $set: { lastPushRegistrationAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Push subscription registered successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Push subscription error:", error);
    return NextResponse.json(
      { error: "Failed to register push subscription" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/push-subscription
 * Remove a push notification subscription
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { token, endpoint } = body;

    await connectToDatabase();

    if (token) {
      await User.findByIdAndUpdate(user._id, {
        $pull: { pushSubscriptions: { token } },
      });
    } else if (endpoint) {
      await User.findByIdAndUpdate(user._id, {
        $pull: { pushSubscriptions: { endpoint } },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Push subscription removed",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Push subscription removal error:", error);
    return NextResponse.json(
      { error: "Failed to remove push subscription" },
      { status: 500 }
    );
  }
}