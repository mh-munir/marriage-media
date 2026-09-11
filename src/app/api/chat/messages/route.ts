export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Message, Conversation } from "@/models";
import { requireAuth } from "@/lib/auth";

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

    const [messages, total] = await Promise.all([
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
    ]);

    return NextResponse.json({
      messages: messages.reverse(),
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
      lastMessagePreview: previewText,
      lastMessageType: messageType || "text",
      lastMessageAt: new Date(),
      $inc: {
        [`participantInfo.$[elem].unreadCount`]: 1,
      },
    }, {
      arrayFilters: [{ "elem.userId": receiverId }],
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}