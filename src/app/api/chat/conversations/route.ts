export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Conversation, Profile } from "@/models";
import { requireAuth } from "@/lib/auth";

type ObjectIdLike = { toString(): string };

interface PopulatedUser {
  _id: ObjectIdLike;
  email?: string;
}

interface ConversationRecord {
  _id: ObjectIdLike;
  participants: PopulatedUser[];
  participantInfo?: Array<{
    userId: ObjectIdLike;
    unreadCount?: number;
    isPinned?: boolean;
    isArchived?: boolean;
    isMuted?: boolean;
  }>;
  lastMessagePreview?: string;
  lastMessageType?: string;
  lastMessageAt?: Date | string;
  updatedAt?: Date | string;
}

interface ProfileRecord {
  userId: ObjectIdLike;
  firstName?: string;
  lastName?: string;
  gender?: string;
  photos?: Array<{ url?: string; isPrimary?: boolean; isApproved?: boolean }>;
  lastActiveAt?: Date | string;
  isPremium?: boolean;
  premiumExpiry?: Date | string;
}

function toId(value: ObjectIdLike | string | undefined): string {
  return value ? value.toString() : "";
}

function getDateString(value: Date | string | undefined): string {
  return value ? new Date(value).toISOString() : "";
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await connectToDatabase();

    const conversations = (await Conversation.find({
      participants: user._id,
    })
      .populate("participants", "email")
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .limit(100)
      .lean()) as unknown as ConversationRecord[];

    const otherUserIds = conversations
      .flatMap((conversation) => conversation.participants)
      .map((participant) => toId(participant._id))
      .filter((participantId) => participantId && participantId !== toId(user._id));

    const profiles = (await Profile.find({ userId: { $in: [...otherUserIds, toId(user._id)] } })
      .select("userId firstName lastName gender photos lastActiveAt isPremium premiumExpiry")
      .lean()) as unknown as ProfileRecord[];

    const profileMap = new Map(profiles.map((profile) => [toId(profile.userId), profile]));
    const viewerProfile = profileMap.get(toId(user._id));
    const viewerHasActiveSubscription = Boolean(viewerProfile?.isPremium && viewerProfile.premiumExpiry && new Date(viewerProfile.premiumExpiry) > new Date());

    const formatted = conversations.map((conversation) => {
      const otherParticipant = conversation.participants.find(
        (participant) => toId(participant._id) !== toId(user._id)
      );
      const participantId = toId(otherParticipant?._id);
      const profile = profileMap.get(participantId);
      const displayName = profile
        ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
        : otherParticipant?.email || "Unknown user";
      const participantInfo = conversation.participantInfo?.find(
        (info) => toId(info.userId) === toId(user._id)
      );
      const primaryPhoto = profile?.photos?.find((photo) => photo.isPrimary && photo.isApproved);
      const lastActiveAt = profile?.lastActiveAt ? new Date(profile.lastActiveAt).getTime() : 0;
      const isPremiumSender = Boolean(profile?.isPremium && profile.premiumExpiry && new Date(profile.premiumExpiry) > new Date());
      const isLockedPreview = !viewerHasActiveSubscription && isPremiumSender && (participantInfo?.unreadCount || 0) > 0;

      return {
        id: toId(conversation._id),
        participantId,
        participantName: displayName || "Unknown user",
        participantEmail: otherParticipant?.email || "",
        participantAvatar: primaryPhoto?.url || "",
        participantGender: profile?.gender || "",
        lastMessage: isLockedPreview ? "New message from a premium member" : conversation.lastMessagePreview || "",
        lastMessageType: conversation.lastMessageType || "text",
        lastMessageAt: getDateString(conversation.lastMessageAt || conversation.updatedAt),
        unreadCount: participantInfo?.unreadCount || 0,
        isPinned: participantInfo?.isPinned || false,
        isArchived: participantInfo?.isArchived || false,
        isMuted: participantInfo?.isMuted || false,
        isOnline: lastActiveAt > Date.now() - 15 * 60 * 1000,
      };
    });

    return NextResponse.json({ conversations: formatted });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const participantId = typeof body.participantId === "string" ? body.participantId : "";

    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      return NextResponse.json({ error: "Valid participantId is required" }, { status: 400 });
    }

    if (participantId === toId(user._id)) {
      return NextResponse.json({ error: "Cannot create a conversation with yourself" }, { status: 400 });
    }

    await connectToDatabase();

    const participantObjectId = new mongoose.Types.ObjectId(participantId);
    const existing = await Conversation.findOne({
      isGroupChat: false,
      participants: { $all: [user._id, participantObjectId], $size: 2 },
    });

    if (existing) {
      return NextResponse.json({ conversationId: existing._id.toString(), created: false });
    }

    const conversation = await Conversation.create({
      participants: [user._id, participantObjectId],
      participantInfo: [
        { userId: user._id, unreadCount: 0, isPinned: false, isArchived: false, isMuted: false },
        { userId: participantObjectId, unreadCount: 0, isPinned: false, isArchived: false, isMuted: false },
      ],
      lastMessagePreview: "",
      lastMessageType: "text",
      lastMessageAt: new Date(),
      isGroupChat: false,
    });

    return NextResponse.json({ conversationId: conversation._id.toString(), created: true }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
