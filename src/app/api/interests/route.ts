export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Interest, Profile, User, Notification } from "@/models";
import { requireAuth } from "@/lib/auth";
import { isPremiumUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "received"; // "received" | "sent" | "mutual"

    let interests;

    if (type === "sent") {
      interests = await Interest.find({ senderId: user._id })
        .populate("receiverId", "email")
        .sort({ createdAt: -1 });

      // Attach profile data
      const receiverIds = interests.map((i) => i.receiverId._id);
      const profiles = await Profile.find({ userId: { $in: receiverIds } })
        .select("firstName lastName gender age height photos profession")
        .lean();

      const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));
      interests = interests.map((i) => ({
        ...i.toObject(),
        receiverProfile: profileMap.get(i.receiverId._id.toString()),
      }));
    } else if (type === "mutual") {
      const sent = await Interest.find({
        senderId: user._id,
        status: "accepted",
      }).select("receiverId");
      const received = await Interest.find({
        receiverId: user._id,
        status: "accepted",
      }).select("senderId");

      const mutualIds = [
        ...sent.map((s) => s.receiverId),
        ...received.map((r) => r.senderId),
      ];

      interests = await Profile.find({ userId: { $in: mutualIds } })
        .select("firstName lastName gender age height photos profession")
        .lean();
    } else {
      // Received interests
      interests = await Interest.find({ receiverId: user._id })
        .populate("senderId", "email")
        .sort({ createdAt: -1 });

      const senderIds = interests.map((i) => i.senderId._id);
      const profiles = await Profile.find({ userId: { $in: senderIds } })
        .select("firstName lastName gender age height photos profession")
        .lean();

      const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));
      interests = interests.map((i) => ({
        ...i.toObject(),
        senderProfile: profileMap.get(i.senderId._id.toString()),
      }));
    }

    return NextResponse.json({ interests });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const body = await request.json();
    const { receiverId, message } = body;

    if (!receiverId) {
      return NextResponse.json(
        { error: "Receiver ID is required" },
        { status: 400 }
      );
    }

    // Check if receiver exists
    const receiverProfile = await Profile.findOne({ userId: receiverId });
    if (!receiverProfile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Check if already sent
    const existingInterest = await Interest.findOne({
      senderId: user._id,
      receiverId,
    });
    if (existingInterest) {
      return NextResponse.json(
        { error: "You have already sent an interest to this profile" },
        { status: 409 }
      );
    }

    // Check free user limits
    const senderProfile = await Profile.findOne({ userId: user._id });
    if (!isPremiumUser(senderProfile)) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayCount = await Interest.countDocuments({
        senderId: user._id,
        createdAt: { $gte: todayStart },
      });
      if (todayCount >= 5) {
        return NextResponse.json(
          { error: "Free users can send up to 5 interests per day. Upgrade to Premium for unlimited interests." },
          { status: 403 }
        );
      }
    }

    // Create interest
    const interest = await Interest.create({
      senderId: user._id,
      receiverId,
      message: message || "",
    });

    // Create notification
    await Notification.create({
      userId: receiverId,
      type: "interest",
      title: "New Interest Received",
      message: `Someone is interested in your profile!`,
      link: `/dashboard/interests`,
    });

    return NextResponse.json({ interest }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}