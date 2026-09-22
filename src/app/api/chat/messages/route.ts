export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Message, Conversation, Profile } from "@/models";
import { requireAuth } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

/**
 * GET /api/chat/messages?conversationId=xxx&page=1&limit=50
 * Get messages for a conversation with pagination
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    // Verify user is part of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === user._id.toString()
    );

    if (!isParticipant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await Promise.all([
      Message.updateMany(
        { conversationId, receiverId: user._id, isRead: false },
        { $set: { isRead: true, readAt: new Date() } }
      ),
      Conversation.updateOne(
        { _id: conversationId, "participantInfo.userId": user._id },
        { $set: { "participantInfo.$.unreadCount": 0, "participantInfo.$.lastReadAt": new Date() } }
      ),
    ]);

    const [messages, total, viewerProfile] = await Promise.all([
      Message.find({
        conversationId,
        deletedFor: { $ne: user._id },
      })
        .populate("senderId", "firstName lastName email")
        .populate("replyTo")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments({
        conversationId,
        deletedFor: { $ne: user._id },
      }),
      Profile.findOne({ userId: user._id }).select("isPremium premiumExpiry").lean(),
    ]);

    const viewerHasActiveSubscription = Boolean(
      viewerProfile?.isPremium && viewerProfile.premiumExpiry && new Date(viewerProfile.premiumExpiry) > new Date()
    );
    const senderIds = [...new Set(messages.map((item) => item.senderId.toString()).filter((id) => id !== user._id.toString()))];
    const senderProfiles = await Profile.find({ userId: { $in: senderIds } })
      .select("userId isPremium premiumExpiry")
      .lean();
    const lockedSenderIds = new Set(senderProfiles
      .filter((profile) => profile.isPremium && profile.premiumExpiry && new Date(profile.premiumExpiry) > new Date())
      .map((profile) => profile.userId.toString()));

    const visibleMessages = messages.reverse().map((item) => {
      const isLocked = !viewerHasActiveSubscription && item.senderId.toString() !== user._id.toString() && lockedSenderIds.has(item.senderId.toString());
      return isLocked
        ? { ...item, content: "This premium member's message is locked.", fileUrl: "", voiceUrl: "", thumbnailUrl: "", isLocked: true }
        : { ...item, isLocked: false };
    });

    return NextResponse.json({
      messages: visibleMessages,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * POST /api/chat/messages
 * Send a new message
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const body = await request.json();
    const {
      conversationId,
      content,
      messageType,
      fileUrl,
      fileName,
      fileSize,
      mimeType,
      thumbnailUrl,
      voiceUrl,
      voiceDuration,
      replyTo,
    } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    if (!content && !fileUrl && !voiceUrl) {
      return NextResponse.json(
        { error: "Message content, file, or voice is required" },
        { status: 400 }
      );
    }

    // Verify user is part of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const receiverId = conversation.participants.find(
      (p) => p.toString() !== user._id.toString()
    );

    if (!receiverId) {
      return NextResponse.json({ error: "Invalid conversation" }, { status: 400 });
    }

    // Build reply preview
    let replyPreview = undefined;
    if (replyTo) {
      const replyMessage = await Message.findById(replyTo).populate("senderId", "firstName lastName");
      if (replyMessage) {
        const sender = replyMessage.senderId as { firstName?: string; lastName?: string; email?: string };
        replyPreview = {
          senderName: sender.firstName
            ? `${sender.firstName} ${sender.lastName || ""}`
            : sender.email,
          content: replyMessage.content.substring(0, 100),
          messageType: replyMessage.messageType,
        };
      }
    }

    const [senderProfile, receiverProfile] = await Promise.all([
      Profile.findOne({ userId: user._id }).select("isPremium premiumExpiry").lean(),
      Profile.findOne({ userId: receiverId }).select("isPremium premiumExpiry").lean(),
    ]);
    const senderIsPremium = Boolean(senderProfile?.isPremium && senderProfile.premiumExpiry && new Date(senderProfile.premiumExpiry) > new Date());
    const receiverIsPremium = Boolean(receiverProfile?.isPremium && receiverProfile.premiumExpiry && new Date(receiverProfile.premiumExpiry) > new Date());
    const isLockedForReceiver = senderIsPremium && !receiverIsPremium;

    const message = await Message.create({
      conversationId,
      senderId: user._id,
      receiverId,
      content: content || "",
      messageType: messageType || "text",
      fileUrl: fileUrl || "",
      fileName: fileName || "",
      fileSize: fileSize || 0,
      mimeType: mimeType || "",
      thumbnailUrl: thumbnailUrl || "",
      voiceUrl: voiceUrl || "",
      voiceDuration: voiceDuration || 0,
      replyTo: replyTo || undefined,
      replyPreview,
      isRead: false,
      isDelivered: false,
    });

    // Update conversation
    const previewText =
      messageType === "voice"
        ? "🎤 Voice message"
        : messageType === "image"
          ? "📷 Photo"
          : messageType === "file"
            ? `📎 ${fileName || "File"}`
            : content?.substring(0, 100) || "";

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessagePreview: isLockedForReceiver ? "New message from a premium member" : previewText,
      lastMessageType: messageType || "text",
      lastMessageAt: new Date(),
      $inc: {
        [`participantInfo.$[elem].unreadCount`]: 1,
      },
    }, {
      arrayFilters: [{ "elem.userId": receiverId }],
    });

    await createNotification({
      userId: receiverId.toString(),
      type: "message",
      title: "New message",
      message: isLockedForReceiver ? "A premium member sent you a message. Upgrade to read it." : content?.substring(0, 160) || `New ${messageType || "text"} message received.`,
      link: `/dashboard/messages?conversationId=${conversationId}`,
      channels: ["inapp"],
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
