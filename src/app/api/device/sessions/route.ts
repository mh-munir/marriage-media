import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { DeviceSession, LoginHistory } from "@/models";
import { requireAuth } from "@/lib/auth";

// Get device sessions and login history
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "sessions";

    if (type === "login-history") {
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const skip = (page - 1) * limit;

      const [history, total] = await Promise.all([
        LoginHistory.find({ userId: user._id })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select("-userAgent")
          .lean(),
        LoginHistory.countDocuments({ userId: user._id }),
      ]);

      return NextResponse.json({
        history,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    }

    // Active sessions
    const sessions = await DeviceSession.find({
      userId: user._id,
      isActive: true,
    })
      .sort({ lastActivityAt: -1 })
      .lean();

    const totalSessions = await DeviceSession.countDocuments({
      userId: user._id,
    });

    return NextResponse.json({ sessions, totalSessions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// Terminate a session
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const session = await DeviceSession.findOne({
      _id: sessionId,
      userId: user._id,
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    session.isActive = false;
    session.logoutAt = new Date();
    await session.save();

    return NextResponse.json({ message: "Session terminated" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}